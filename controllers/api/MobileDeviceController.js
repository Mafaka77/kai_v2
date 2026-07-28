/**
 * Mobile Device Controller
 * POST /api/device/request — Register a new device (requires admin approval)
 */
const { Device } = require('../../models');
const ApiResponseType = require('../../constants/ApiResponseType');

module.exports = {
  /**
   * POST /api/device/request  [auth required]
   * Registers a new device for the authenticated user — pending admin approval
   */
  registerNewDevice: async (request, reply) => {
    try {
      const { device_name, uid } = request.body || {};

      const errors = {};
      if (!device_name) errors.device_name = ['The device_name field is required.'];
      if (!uid)         errors.uid         = ['The uid field is required.'];

      if (Object.keys(errors).length > 0) {
        return reply.send({ status: ApiResponseType.VALIDATION_ERROR, errors });
      }

      const userId = request.user.id;

      // Check for duplicate UID already registered to this user
      const duplicate = await Device.findOne({
        where: { uid, user_id: userId }
      });

      if (duplicate) {
        return reply.send({
          status:  ApiResponseType.DUPLICATE_ATTENDANCE,
          message: 'A device with this UID is already applied.'
        });
      }

      const device = await Device.create({
        name:    device_name,
        uid,
        active:  false,
        user_id: userId,
        status:  'Pending'
      });

      return reply.send({
        status:  ApiResponseType.SUCCESS,
        data:    device,
        message: 'Change Request Success,Please wait for approval'
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
