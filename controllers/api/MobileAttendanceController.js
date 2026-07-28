/**
 * Mobile Attendance Controller
 * GET /api/attendance/index        — Paginated list of the user's attendance records
 * GET /api/attendance/:model/show  — Single attendance record detail
 *
 * Also handles office sign-in / sign-out:
 * POST /api/office/signin           — Mark attendance with QR + geofence check
 * PUT  /api/office/:model/signout   — Sign out with geofence check
 */
const { Attendance, Office, Device, User } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');
const ApiResponseType = require('../../constants/ApiResponseType');

// Helper: calculate distance between two lat/lng points (Haversine formula)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // earth radius in metres
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinCircle(lat, lng, officeLat, officeLng, radius) {
  return haversineDistance(
    parseFloat(lat), parseFloat(lng),
    parseFloat(officeLat), parseFloat(officeLng)
  ) <= parseFloat(radius);
}

function checkOfficeGeo(lat, lng, office) {
  if (isWithinCircle(lat, lng, office.lat, office.lng, office.radius)) return true;
  if (office.lat2 && office.lng2) {
    return isWithinCircle(lat, lng, office.lat2, office.lng2, office.radius);
  }
  return false;
}

module.exports = {
  /**
   * GET /api/attendance/index  [auth required]
   * Returns the authenticated user's attendance records with offset/limit pagination
   */
  index: async (request, reply) => {
    try {
      const userId = request.user.id;
      const { from, to, offset = 0, limit = 10 } = request.query || {};

      // Defaults: Monday to Friday of current week (matching Carbon 'last monday' to 'this friday')
      const defaultFrom = moment().startOf('isoWeek').format('YYYY-MM-DD');
      const defaultTo   = moment().startOf('isoWeek').add(4, 'days').format('YYYY-MM-DD');

      const fromStr = from || defaultFrom;
      const toStr   = to   || defaultTo;

      const startDate = moment(fromStr).startOf('day').toDate();
      const endDate   = moment(toStr).endOf('day').toDate();

      const rows = await Attendance.findAll({
        where: {
          user_id:   userId,
          signin_at: { [Op.gte]: startDate, [Op.lte]: endDate },
          type:      { [Op.ne]: 'absent' }
        },
        include: [{ model: Office, attributes: ['id', 'name'] }],
        limit:   parseInt(limit),
        offset:  parseInt(offset)
      });

      return reply.send({ list: rows });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  /**
   * GET /api/attendance/:model/show  [auth required]
   * Returns a single attendance record by ID with related office
   */
  show: async (request, reply) => {
    try {
      const { model: id } = request.params;
      const record = await Attendance.findByPk(id, {
        include: [
          { model: User },
          { model: Device },
          { model: Office }
        ]
      });

      if (!record) {
        return reply.code(404).send({ status: ApiResponseType.MODEL_NOT_FOUND, message: 'Attendance record not found' });
      }

      // Only the owner can see their own record
      if (record.user_id !== request.user.id) {
        return reply.code(403).send({ status: 403, message: 'Unauthorized' });
      }

      const recordJson = record.toJSON();
      recordJson.user   = recordJson.user   || recordJson.User   || null;
      recordJson.device = recordJson.device || recordJson.Device || null;
      recordJson.office = recordJson.office || recordJson.Office || null;

      return reply.send({ data: recordJson });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // Office Sign-in / Sign-out
  // ─────────────────────────────────────────────────────────────────────

  /**
   * POST /api/office/signin  [auth required]
   * Validates QR code, device UID, and geofence then creates attendance record
   */
  signin: async (request, reply) => {
    try {
      const body  = request.body || {};
      const query = request.query || {};
      const uid   = body.uid  || query.uid;
      const code  = body.code || query.code;
      const lat   = body.lat  || query.lat;
      const lng   = body.lng  || query.lng;

      const errors = {};
      if (!uid)  errors.uid  = ['The uid field is required.'];
      if (!code) errors.code = ['The code field is required.'];
      if (!lat)  errors.lat  = ['The lat field is required.'];
      if (!lng)  errors.lng  = ['The lng field is required.'];

      if (Object.keys(errors).length > 0) {
        return reply.send({ status: ApiResponseType.VALIDATION_ERROR, errors });
      }

      const userId = request.user.id;

      // Find office by user assignment + QR code
      const { QrCode, UserOffice } = require('../../models');

      // Get user's assigned offices
      const assignedOffices = await Office.findAll({
        include: [
          {
            model:    User,
            as:       'Users',
            where:    { id: userId },
            required: true
          },
          {
            model:    QrCode,
            required: true,
            where:    { code }
          }
        ]
      });

      const office = assignedOffices[0] || null;

      if (!office) {
        return reply.send({
          status:  ApiResponseType.INVALID_OFFICE,
          message: 'The QR does not match your registered office QR'
        });
      }

      // Validate device
      const device = await Device.findOne({
        where: { user_id: userId, uid, active: true }
      });

      if (!device) {
        return reply.send({
          status:  ApiResponseType.INVALID_DEVICE,
          message: 'Your device is not registered in the system'
        });
      }

      // Geofence check
      const isNearby = checkOfficeGeo(lat, lng, office);
      if (!isNearby) {
        return reply.send({
          status:  ApiResponseType.INVALID_GEO,
          message: 'You are out of range. Please go to your office',
          office
        });
      }

      // Check for duplicate today
      const today = moment().startOf('day').toDate();
      const tomorrow = moment().endOf('day').toDate();

      const duplicate = await Attendance.findOne({
        where: {
          user_id:   userId,
          signin_at: { [Op.between]: [today, tomorrow] }
        }
      });

      if (duplicate) {
        return reply.send({
          status:  ApiResponseType.DUPLICATE_ATTENDANCE,
          message: 'You are already signed in for today'
        });
      }

      // Check if late
      const [startH, startM] = office.start_time.split(':').map(Number);
      const officeStart = moment().hours(startH).minutes(startM).seconds(0);
      const graceEnd    = officeStart.clone().add(office.grace_period || 0, 'minutes');
      const isLate      = moment().isAfter(graceEnd);

      await Attendance.create({
        office_id: office.id,
        user_id:   userId,
        signin_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        lat,
        lng,
        device_id: device.id,
        type:      isLate ? 'late' : 'present'
      });

      return reply.send({
        status:  ApiResponseType.SUCCESS,
        message: 'You have signed in successfully'
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  /**
   * PUT /api/office/:model/signout  [auth required]
   * Validates geofence and marks signout time, detects left_early
   */
  signout: async (request, reply) => {
    try {
      const { model: id } = request.params;
      const body  = request.body || {};
      const query = request.query || {};
      const lat   = body.lat  || query.lat;
      const lng   = body.lng  || query.lng;

      if (!lat || !lng) {
        return reply.send({
          status: ApiResponseType.VALIDATION_ERROR,
          errors: { lat: ['Latitude and longitude are required.'] }
        });
      }

      const attendance = await Attendance.findByPk(id);

      if (!attendance) {
        return reply.code(404).send({ status: ApiResponseType.MODEL_NOT_FOUND, message: 'Attendance record not found' });
      }

      if (attendance.user_id !== request.user.id) {
        return reply.code(403).send({ status: 'error', message: 'Unauthorized' });
      }

      // Look up user's assigned office (matching Laravel $office = Office::whereHas('users', ...)->first())
      const userWithOffice = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });
      const office = userWithOffice?.Offices?.[0] || await Office.findByPk(attendance.office_id);

      if (!office) {
        return reply.send({
          status:  ApiResponseType.INVALID_OFFICE,
          message: 'Office not found'
        });
      }

      // Geofence check
      const isNearby = checkOfficeGeo(lat, lng, office);
      if (!isNearby) {
        return reply.send({
          status:  ApiResponseType.INVALID_GEO,
          message: 'You are out of range. Please go to your office location and sign out'
        });
      }

      // Determine if left early
      const signoutTime = moment();
      const currentDate = signoutTime.format('YYYY-MM-DD');
      const signinDate  = moment(attendance.signin_at).format('YYYY-MM-DD');

      let outRemark = null;
      if (signinDate !== currentDate) {
        outRemark = 'left_early';
      } else if (office.close_time) {
        const [closeH, closeM] = office.close_time.split(':').map(Number);
        const cutoff = moment().hours(closeH).minutes(closeM).seconds(0);
        if (signoutTime.isBefore(cutoff)) {
          outRemark = 'left_early';
        }
      }

      await attendance.update({
        signout_at:  moment().format('YYYY-MM-DD HH:mm:ss'),
        signout_lat: lat,
        signout_lng: lng,
        out_remark:  outRemark
      });

      return reply.send({
        status:  ApiResponseType.SUCCESS,
        message: 'You have signed out successfully'
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
