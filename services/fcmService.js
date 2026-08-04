/**
 * Firebase Cloud Messaging (FCM) Service
 * Automatically loads project firebase.json service account credentials
 * and dispatches push notifications via BullMQ & Redis queues + FCM HTTP v1 API.
 * Optimized with parallel batch concurrency and automatic dead token cleanup.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { FcmToken } = require('../models');
const { addNotificationJob } = require('../queues/notificationQueue');

let cachedAccessToken = null;
let tokenExpiresAt = 0;

/**
 * Reads firebase.json service account credentials if present
 */
function getServiceAccount() {
  try {
    const firebaseJsonPath = path.join(__dirname, '../firebase.json');
    if (fs.existsSync(firebaseJsonPath)) {
      const raw = fs.readFileSync(firebaseJsonPath, 'utf8');
      const data = JSON.parse(raw);
      if (data.type === 'service_account' && data.project_id && data.private_key && data.client_email) {
        return data;
      }
    }
  } catch (err) {
    console.error('[FCM Service] Error parsing firebase.json:', err.message);
  }
  return null;
}

/**
 * Obtains Google OAuth2 Access Token for FCM HTTP v1 API using RS256 JWT
 */
async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);

  if (cachedAccessToken && now < tokenExpiresAt - 60) {
    return cachedAccessToken;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: serviceAccount.token_uri || 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (str) =>
    Buffer.from(typeof str === 'string' ? str : JSON.stringify(str))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(serviceAccount.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signature}`;

  const response = await fetch(serviceAccount.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const resData = await response.json();
  if (!response.ok || !resData.access_token) {
    throw new Error(resData.error_description || resData.error || 'Failed to obtain OAuth2 access token');
  }

  cachedAccessToken = resData.access_token;
  tokenExpiresAt = now + (resData.expires_in || 3600);
  return cachedAccessToken;
}

/**
 * Removes stale/unregistered FCM tokens from the database in bulk
 */
async function cleanupDeadTokens(deadTokens) {
  if (!deadTokens || deadTokens.length === 0) return;
  try {
    const deletedCount = await FcmToken.destroy({
      where: {
        token: { [Op.in]: deadTokens }
      }
    });
    console.log(`[FCM Service Cleanup] Automatically removed ${deletedCount} unregistered/stale FCM token(s) from DB.`);
  } catch (err) {
    console.error('[FCM Service Cleanup Error] Failed to delete dead tokens:', err.message);
  }
}

/**
 * Executes FCM HTTP v1 / Legacy dispatch with parallel batching & auto-cleanup
 */
async function processDirectPushNotification({ tokens, title, body, url, data = {} }) {
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    console.log('[FCM Worker] No recipient FCM tokens provided. Skipping push dispatch.');
    return { success: true, sentCount: 0, failureCount: 0 };
  }

  const serviceAccount = getServiceAccount();
  const legacyServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;

  console.log(`[FCM Worker] Processing push notification "${title}" for ${tokens.length} device token(s)...`);

  // ── Mode 1: FCM HTTP v1 API using firebase.json Service Account (Official) ──
  if (serviceAccount) {
    try {
      const accessToken = await getAccessToken(serviceAccount);
      const endpoint = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

      let successCount = 0;
      let failureCount = 0;
      const errors = [];
      const deadTokens = [];

      // Helper function to send single FCM HTTP v1 request
      const sendSingleToken = async (token) => {
        try {
          const payload = {
            message: {
              token,
              notification: { title, body },
              data: {
                ...data,
                title,
                body,
                url: url || '',
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
              },
              android: {
                priority: 'high',
                notification: {
                  sound: 'default',
                  channel_id: 'high_importance_channel'
                }
              },
              apns: {
                payload: {
                  aps: {
                    sound: 'default',
                    badge: 1
                  }
                }
              }
            }
          };

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
          });

          const resData = await res.json().catch(() => ({}));
          if (res.ok) {
            successCount++;
          } else {
            failureCount++;
            const errMsg = resData.error?.message || 'FCM error';
            const status = resData.error?.status;
            errors.push(errMsg);

            // Detect unregistered / dead tokens (404 NOT_FOUND / UNREGISTERED / NotRegistered)
            if (res.status === 404 || status === 'NOT_FOUND' || errMsg.includes('unregistered') || errMsg.includes('NotRegistered')) {
              deadTokens.push(token);
            }
          }
        } catch (tokErr) {
          failureCount++;
          errors.push(tokErr.message);
        }
      };

      // Parallel batching in chunks of 25 concurrent requests
      const CHUNK_SIZE = 25;
      for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
        const batch = tokens.slice(i, i + CHUNK_SIZE);
        await Promise.all(batch.map(t => sendSingleToken(t)));
      }

      // Asynchronously purge dead tokens from database
      if (deadTokens.length > 0) {
        cleanupDeadTokens(deadTokens);
      }

      console.log(`[FCM Worker] Batch dispatch completed. Sent: ${successCount}, Failed: ${failureCount}, Dead tokens purged: ${deadTokens.length}`);
      return {
        success: successCount > 0 || tokens.length === 0,
        sentCount: successCount,
        failureCount,
        purgedTokensCount: deadTokens.length,
        errors
      };
    } catch (error) {
      console.error('[FCM Worker Error] HTTP v1 dispatch failed:', error.message);
      throw error;
    }
  }

  // ── Mode 2: Legacy FCM API using Server Key ──
  if (legacyServerKey) {
    try {
      const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';

      const payload = {
        registration_ids: tokens,
        notification: { title, body, sound: 'default', badge: 1 },
        data: { ...data, title, body, url: url || '', click_action: 'FLUTTER_NOTIFICATION_CLICK' },
        priority: 'high'
      };

      const response = await fetch(fcmEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${legacyServerKey}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json().catch(() => ({}));
      return {
        success: response.ok,
        sentCount: resData.success || 0,
        failureCount: resData.failure || 0,
        resData
      };
    } catch (error) {
      console.error('[FCM Worker Error] Legacy dispatch failed:', error.message);
      throw error;
    }
  }

  // ── Mode 3: Simulation mode when no keys present ──
  console.log('[FCM Worker Notice] Neither firebase.json nor FCM_SERVER_KEY found. Simulation logged.');
  return { success: true, simulated: true, tokenCount: tokens.length };
}

module.exports = {
  /**
   * Enqueues push notification job into BullMQ & Redis queue
   */
  sendPushNotification: async ({ tokens, title, body, url, data = {} }) => {
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      console.log('[FCM Service] No recipient FCM tokens provided. Skipping enqueue.');
      return { success: true, sentCount: 0, failureCount: 0 };
    }

    const queueResult = await addNotificationJob({ tokens, title, body, url, data });

    return {
      success: true,
      queued: queueResult.queued,
      jobId: queueResult.jobId || null,
      tokensCount: tokens.length
    };
  },

  processDirectPushNotification
};
