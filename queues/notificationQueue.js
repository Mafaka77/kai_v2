const { Queue, Worker } = require('bullmq');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT) || 6379;

const connection = {
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null
};

let notificationQueue = null;
let notificationWorker = null;
let redisAvailable = false;

// Delayed worker processor binding to avoid circular dependency
let processNotificationHandler = null;
const setProcessor = (handler) => {
  processNotificationHandler = handler;
};

try {
  notificationQueue = new Queue('fcm-notifications', { connection });

  notificationWorker = new Worker('fcm-notifications', async (job) => {
    console.log(`[BullMQ FCM Worker] Processing FCM push notification job ID: ${job.id}`);
    if (typeof processNotificationHandler === 'function') {
      return await processNotificationHandler(job.data);
    } else {
      const fcmService = require('../services/fcmService');
      return await fcmService.processDirectPushNotification(job.data);
    }
  }, { connection });

  notificationQueue.on('error', (err) => {
    if (!redisAvailable) return;
    console.warn('[BullMQ FCM] Redis Queue Connection Warning:', err.message);
    redisAvailable = false;
  });

  notificationWorker.on('completed', (job, result) => {
    console.log(`[BullMQ FCM Worker] FCM Notification job ${job.id} completed successfully. Sent: ${result?.sentCount || 0}`);
  });

  notificationWorker.on('failed', (job, err) => {
    console.error(`[BullMQ FCM Worker] FCM Notification job ${job ? job.id : 'unknown'} failed:`, err.message);
  });

  redisAvailable = true;
} catch (err) {
  console.warn('[BullMQ FCM] Initializing BullMQ FCM Queue failed. Will use async fallback worker.', err.message);
  redisAvailable = false;
}

/**
 * Enqueues FCM push notification task to BullMQ / Redis queue
 * @param {Object} jobData - Notification payload (tokens, title, body, url, data)
 */
const addNotificationJob = async (jobData) => {
  if (redisAvailable && notificationQueue) {
    try {
      const job = await notificationQueue.add('send-fcm-push', jobData, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 500
      });
      console.log(`[BullMQ FCM] Enqueued FCM push notification job ID: ${job.id} for ${jobData.tokens?.length || 0} tokens`);
      return { queued: true, jobId: job.id };
    } catch (err) {
      console.warn('[BullMQ FCM] Failed to enqueue to Redis. Executing direct fallback execution.', err.message);
      redisAvailable = false;
    }
  }

  // Fallback: Asynchronous non-blocking background dispatch
  setImmediate(async () => {
    try {
      console.log(`[Fallback FCM Worker] Dispatching push notification "${jobData.title}" for ${jobData.tokens?.length || 0} tokens...`);
      const fcmService = require('../services/fcmService');
      await fcmService.processDirectPushNotification(jobData);
    } catch (fallbackError) {
      console.error('[Fallback FCM Worker] Error processing push notification:', fallbackError.message);
    }
  });

  return { queued: false, fallback: true };
};

module.exports = {
  notificationQueue,
  notificationWorker,
  addNotificationJob,
  setProcessor
};
