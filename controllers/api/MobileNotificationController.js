/**
 * Mobile Notification Controller
 * GET /api/notification/index       — List notifications for user's office
 * GET /api/notification/:model/show — Single notification with attachments
 */
const { NotificationMessage, Office, Attachment, User } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');
const ApiResponseType = require('../../constants/ApiResponseType');

module.exports = {
  /**
   * GET /api/notification/index  [auth required]
   * Returns notifications for the authenticated user's office (weekly range by default)
   */
  index: async (request, reply) => {
    try {
      const { from, to, offset = 0, limit = 10 } = request.query || {};

      const fromDate = from || moment().startOf('isoWeek').format('YYYY-MM-DD'); // Monday
      const toDate   = to   || moment().endOf('isoWeek').format('YYYY-MM-DD');   // Friday

      // Find user's assigned office
      const user = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });
      const office = user?.Offices?.[0];

      if (!office) {
        return reply.send({ list: [] });
      }

      const list = await NotificationMessage.findAll({
        where: {
          office_id: office.id,
          schedule_at: {
            [Op.gte]: fromDate,
            [Op.lte]: toDate
          }
        },
        order:  [['created_at', 'DESC']],
        limit:  parseInt(limit),
        offset: parseInt(offset)
      });

      return reply.send({ list });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  /**
   * GET /api/notification/:model/show  [auth required]
   * Returns a single notification message including its office and attachments
   */
  show: async (request, reply) => {
    try {
      const { model: id } = request.params;

      const notification = await NotificationMessage.findByPk(id, {
        include: [
          { model: Office,     attributes: ['id', 'name'] },
          { model: Attachment, attributes: ['id', 'url', 'name'] }
        ]
      });

      if (!notification) {
        return reply.code(404).send({ status: ApiResponseType.MODEL_NOT_FOUND, message: 'Notification not found' });
      }

      return reply.send({ data: notification });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
