/**
 * Mobile Home Controller
 * GET /api/index      — Returns user info + this week's attendance
 * POST /api/fcm/token — Updates FCM push notification token
 */
const { User, Attendance, Office, FcmToken } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');
const ApiResponseType = require('../../constants/ApiResponseType');

module.exports = {
  /**
   * GET /api/index  [auth required]
   * Returns authenticated user info with their offices and current/pending attendance
   */
  index: async (request, reply) => {
    try {
      const userId = request.user.id;

      const userRecord = await User.findByPk(userId, {
        include: [
          {
            model: Attendance,
            where: {
              type: { [Op.ne]: 'absent' },
              signout_at: null
            },
            required: false
          },
          {
            model: Office,
            as: 'Offices'
          }
        ]
      });

      if (!userRecord) {
        return reply.code(404).send({ status: ApiResponseType.MODEL_NOT_FOUND, message: 'User not found' });
      }

      const userJson = userRecord.toJSON();
      userJson.offices = userJson.Offices || [];
      userJson.attendances = userJson.Attendances || userJson.attendances || [];

      // Fetch this week's attendance records (Mon–Sun), excluding absent type
      const weekStart = moment().startOf('isoWeek').startOf('day').toDate();
      const weekEnd   = moment().endOf('isoWeek').endOf('day').toDate();

      const attendances = await Attendance.findAll({
        where: {
          user_id:   userId,
          type:      { [Op.ne]: 'absent' },
          signin_at: { [Op.between]: [weekStart, weekEnd] }
        },
        include: [{ model: Office, attributes: ['id', 'name'] }],
        order: [['signin_at', 'DESC']]
      });

      return reply.send({ user: userJson, attendances });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  /**
   * POST /api/fcm/token  [auth required]
   * Registers or updates the device's FCM push token for the authenticated user
   */
  updateToken: async (request, reply) => {
    try {
      const { token } = request.body || {};

      if (!token) {
        return reply.send({ status: ApiResponseType.VALIDATION_ERROR, errors: { token: ['The token field is required.'] } });
      }

      // Check if token already exists for a different user
      const existing = await FcmToken.findOne({ where: { token } });
      if (existing && existing.user_id !== request.user.id) {
        return reply.send({ status: ApiResponseType.VALIDATION_ERROR });
      }

      await FcmToken.upsert({ token, user_id: request.user.id });

      return reply.send({
        status: ApiResponseType.SUCCESS,
        data:    { token },
        message: 'Token updated'
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
