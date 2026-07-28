/**
 * Mobile Profile Controller
 * GET /api/profile         — Returns authenticated user profile with offices
 * GET /api/profile/devices — Returns user's registered devices
 */
const { User, Device, Office } = require('../../models');

module.exports = {
  /**
   * GET /api/profile  [auth required]
   * Returns the authenticated user's profile including assigned offices
   */
  index: async (request, reply) => {
    try {
      const user = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });
      return reply.send({ data: user });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  /**
   * GET /api/profile/devices  [auth required]
   * Returns all devices registered to the authenticated user
   */
  devices: async (request, reply) => {
    try {
      const devices = await Device.findAll({ where: { user_id: request.user.id } });
      return reply.send({ data: devices });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
