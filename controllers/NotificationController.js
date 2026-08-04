const { NotificationMessage, Office, User, Role, FcmToken } = require('../models');
const { Op } = require('sequelize');
const fcmService = require('../services/fcmService');

module.exports = {
  // GET /web/notifications — List notifications filtered by role & office management
  index: async (request, reply) => {
    try {
      const { page = 1, limit = 15 } = request.query || {};
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      const loggedInUser = await User.findByPk(request.user.id, {
        include: [
          { model: Office, as: 'Offices' },
          { model: Role, as: 'Roles', through: { attributes: [] } }
        ]
      });

      const roles = loggedInUser?.Roles ? loggedInUser.Roles.map(r => r.name) : [];
      const isAdmin = roles.includes('Admin');
      const isManager = roles.includes('Manager');

      let where = {};
      let availableOffices = [];

      if (isAdmin) {
        // Admin sees all notifications and all system offices
        availableOffices = await Office.findAll({
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      } else if (isManager) {
        const managedOfficeIds = loggedInUser?.Offices ? loggedInUser.Offices.map(o => o.id) : [];
        availableOffices = loggedInUser?.Offices || [];
        where = {
          [Op.or]: [
            { office_id: { [Op.in]: managedOfficeIds } }
          ]
        };
      } else {
        return reply.code(403).send({ status: 'error', message: 'Access denied' });
      }

      const { count, rows } = await NotificationMessage.findAndCountAll({
        where,
        include: [{ model: Office, attributes: ['id', 'name'] }],
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset
      });

      const totalPages = Math.ceil(count / limitNum) || 1;

      return {
        status: 'success',
        data: rows,
        offices: availableOffices,
        role: isAdmin ? 'Admin' : 'Manager',
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // POST /web/notifications — Send FCM push notification to target employees (Admin: All/Office, Manager: Managed Offices)
  store: async (request, reply) => {
    try {
      const { title, body, url, office_id } = request.body || {};

      if (!title || !body) {
        return reply.code(400).send({ status: 'error', message: 'Title and body are required' });
      }

      const loggedInUser = await User.findByPk(request.user.id, {
        include: [
          { model: Office, as: 'Offices' },
          { model: Role, as: 'Roles', through: { attributes: [] } }
        ]
      });

      const roles = loggedInUser?.Roles ? loggedInUser.Roles.map(r => r.name) : [];
      const isAdmin = roles.includes('Admin');
      const isManager = roles.includes('Manager');

      if (!isAdmin && !isManager) {
        return reply.code(403).send({ status: 'error', message: 'Unauthorized permission to send notifications' });
      }

      let targetOfficeIds = null;
      let isSystemWide = false;

      if (isAdmin) {
        if (office_id && office_id !== 'all') {
          targetOfficeIds = [parseInt(office_id)];
        } else {
          isSystemWide = true;
        }
      } else if (isManager) {
        const managedOfficeIds = loggedInUser?.Offices ? loggedInUser.Offices.map(o => o.id) : [];

        if (!managedOfficeIds.length) {
          return reply.code(403).send({ status: 'error', message: 'You do not have management permissions for any office' });
        }

        if (office_id && office_id !== 'all') {
          const selectedId = parseInt(office_id);
          if (!managedOfficeIds.includes(selectedId)) {
            return reply.code(403).send({ status: 'error', message: 'Unauthorized: You can only send notifications to your managed offices' });
          }
          targetOfficeIds = [selectedId];
        } else {
          targetOfficeIds = managedOfficeIds;
        }
      }

      // 1. Resolve Target Users
      let targetUserIds = [];
      if (isSystemWide) {
        const allUsers = await User.findAll({ attributes: ['id'] });
        targetUserIds = allUsers.map(u => u.id);
      } else {
        const officeUsers = await User.findAll({
          attributes: ['id'],
          include: [
            {
              model: Office,
              as: 'Offices',
              required: true,
              where: { id: { [Op.in]: targetOfficeIds } }
            }
          ]
        });
        targetUserIds = officeUsers.map(u => u.id);
      }

      targetUserIds = [...new Set(targetUserIds)];

      // 2. Query FCM Tokens for target users
      const fcmTokenRecords = await FcmToken.findAll({
        attributes: ['token'],
        where: { user_id: { [Op.in]: targetUserIds } }
      });
      const fcmTokens = fcmTokenRecords.map(t => t.token).filter(Boolean);

      // 3. Create Notification Message DB Record(s)
      const createdNotifications = [];
      if (isSystemWide) {
        const notif = await NotificationMessage.create({
          title,
          body,
          url: url || null,
          schedule_at: new Date(),
          office_id: null
        });
        createdNotifications.push(notif);
      } else {
        for (const offId of targetOfficeIds) {
          const notif = await NotificationMessage.create({
            title,
            body,
            url: url || null,
            schedule_at: new Date(),
            office_id: offId
          });
          createdNotifications.push(notif);
        }
      }

      // 4. Dispatch FCM Push Notification to target device tokens
      const pushResult = await fcmService.sendPushNotification({
        tokens: fcmTokens,
        title,
        body,
        url,
        data: {
          notification_id: String(createdNotifications[0]?.id || '')
        }
      });

      return reply.send({
        status: 'success',
        message: 'Push notification sent successfully',
        data: createdNotifications,
        stats: {
          targetUsersCount: targetUserIds.length,
          fcmTokensCount: fcmTokens.length,
          pushResult
        }
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // DELETE /web/notifications/:id — Remove notification message record
  destroy: async (request, reply) => {
    try {
      const { id } = request.params;
      const notif = await NotificationMessage.findByPk(id);
      if (!notif) {
        return reply.code(404).send({ status: 'error', message: 'Notification record not found' });
      }
      await notif.destroy();
      return reply.send({ status: 'success', message: 'Notification deleted successfully' });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
