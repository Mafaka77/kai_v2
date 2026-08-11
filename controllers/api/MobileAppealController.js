/**
 * Mobile Appeal Controller
 * GET  /api/appeal/index                         — User's on_Duty appeal list
 * POST /api/appeal/appeal_onDuty                  — Submit on-duty appeal
 * POST /api/appeal/:model/appeal_lateReason       — Appeal for late check-in
 * POST /api/appeal/:model/appeal_leftEarly        — Appeal for leaving early
 */
const { AppealAttendance, Attendance, Office, User } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');
const ApiResponseType = require('../../constants/ApiResponseType');

module.exports = {
  /**
   * GET /api/appeal/index  [auth required]
   * Returns the authenticated user's on_Duty appeals (paginated by offset/limit)
   */
  index: async (request, reply) => {
    try {
      const userId = request.user.id;
      const body  = request.body  || {};
      const query = request.query || {};
      const offset = parseInt(body.offset ?? query.offset ?? 0);
      const limit  = parseInt(body.limit  ?? query.limit  ?? 10);

      const list = await AppealAttendance.findAll({
        where: {
          user_id: userId,
          type:    'on_Duty'
        },
        include: [
          { model: Office, attributes: ['id', 'name'], required: false }
        ],
        order:  [['created_at', 'DESC']],
        limit:  isNaN(limit)  ? 10 : limit,
        offset: isNaN(offset) ? 0  : offset
      });

      const formattedList = list.map(item => {
        const json = item.toJSON();
        json.created_at = json.created_at || json.createdAt;
        json.updated_at = json.updated_at || json.updatedAt;
        return json;
      });

      return reply.send({ list: formattedList });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  /**
   * POST /api/appeal/appeal_onDuty  [auth required]
   * Submit an on-duty appeal for a date range.
   * Expects: reason, start_date (d-m-Y), end_date (d-m-Y)
   */
  appeal_onDuty: async (request, reply) => {
    try {
      const body  = request.body || {};
      const query = request.query || {};
      const reason     = body.reason     || query.reason;
      const start_date = body.start_date || query.start_date;
      const end_date   = body.end_date   || query.end_date;

      const errors = {};
      if (!reason)     errors.reason     = ['The reason field is required.'];
      if (!start_date) errors.start_date = ['The start_date field is required (format: d-m-Y).'];
      if (!end_date)   errors.end_date   = ['The end_date field is required (format: d-m-Y).'];

      if (Object.keys(errors).length > 0) {
        return reply.send({ status: ApiResponseType.VALIDATION_ERROR, errors });
      }

      // Parse d-m-Y format (legacy mobile format)
      const startDate = moment(start_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
      const endDate   = moment(end_date,   'DD-MM-YYYY').format('YYYY-MM-DD');

      if (!moment(startDate, 'YYYY-MM-DD').isValid() || !moment(endDate, 'YYYY-MM-DD').isValid()) {
        return reply.send({
          status: ApiResponseType.VALIDATION_ERROR,
          errors: { start_date: ['Invalid date format. Use DD-MM-YYYY.'] }
        });
      }

      // Get user's assigned office
      const user = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });
      const office = user?.Offices?.[0];

      if (!office) {
        return reply.code(400).send({ status: 'error', message: 'No office assigned. Contact administrator.' });
      }

      // Check for duplicate overlapping appeal
      const duplicate = await AppealAttendance.findOne({
        where: {
          user_id: request.user.id,
          type:    'on_Duty',
          [Op.or]: [
            { start_date: { [Op.between]: [startDate, endDate] } },
            { end_date:   { [Op.between]: [startDate, endDate] } },
            {
              [Op.and]: [
                { start_date: { [Op.lte]: startDate } },
                { end_date:   { [Op.gte]: endDate   } }
              ]
            }
          ]
        }
      });

      if (duplicate) {
        return reply.send({
          status:  ApiResponseType.DUPLICATE_APPEAL_ATTENDANCE,
          message: 'Appeal already applied'
        });
      }

      const appeal = await AppealAttendance.create({
        user_id:    request.user.id,
        office_id:  office.id,
        start_date: startDate,
        end_date:   endDate,
        type:       'on_Duty',
        reason,
        status:     'Submitted'
      });

      return reply.send({
        status:  ApiResponseType.SUCCESS,
        data:    appeal,
        message: 'Your application is processing, Please wait for approval'
      });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  /**
   * POST /api/appeal/:model/appeal_lateReason  [auth required]
   * Submit a late reason appeal for a specific attendance record
   */
  appeal_lateReason: async (request, reply) => {
    try {
      const { model: id } = request.params;
      const body  = request.body || {};
      const query = request.query || {};
      const reason = body.reason || query.reason;
      const userId = request.user.id;

      if (!reason) {
        return reply.send({
          status: ApiResponseType.VALIDATION_ERROR,
          errors: { reason: ['The reason field is required.'] }
        });
      }

      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        return reply.code(404).send({ status: ApiResponseType.MODEL_NOT_FOUND, message: 'Attendance record not found' });
      }

      // Check for duplicate
      const duplicate = await AppealAttendance.findOne({
        where: { attendance_id: attendance.id, type: 'late_reason' }
      });

      if (duplicate) {
        return reply.send({
          status:  ApiResponseType.DUPLICATE_APPEAL_ATTENDANCE,
          message: 'Appeal already applied'
        });
      }

      const signinTime = moment(attendance.signin_at).format('hh:mm A');

      const appeal = await AppealAttendance.create({
        attendance_id: attendance.id,
        user_id:       userId,
        office_id:     attendance.office_id,
        start_date:    attendance.signin_at,
        type:          'late_reason',
        reason,
        signin_time:   signinTime,
        status:        'Submitted'
      });

      return reply.send({
        status:  ApiResponseType.SUCCESS,
        data:    appeal,
        message: 'Your application is processing, Please wait for approval'
      });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  /**
   * POST /api/appeal/:model/appeal_leftEarly  [auth required]
   * Submit a left-early appeal for a specific attendance record
   */
  appeal_leftEarly: async (request, reply) => {
    try {
      const { model: id } = request.params;
      const body  = request.body || {};
      const query = request.query || {};
      const reason = body.reason || query.reason;

      if (!reason) {
        return reply.send({
          status: ApiResponseType.VALIDATION_ERROR,
          errors: { reason: ['The reason field is required.'] }
        });
      }

      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        return reply.code(404).send({ status: ApiResponseType.MODEL_NOT_FOUND, message: 'Attendance record not found' });
      }

      // Check for duplicate
      const duplicate = await AppealAttendance.findOne({
        where: { attendance_id: attendance.id, type: 'left_early' }
      });

      if (duplicate) {
        return reply.send({
          status:  ApiResponseType.DUPLICATE_APPEAL_ATTENDANCE,
          message: 'Appeal already applied'
        });
      }

      const appeal = await AppealAttendance.create({
        attendance_id: attendance.id,
        user_id:       attendance.user_id,
        office_id:     attendance.office_id,
        start_date:    attendance.signin_at,
        type:          'left_early',
        reason,
        status:        'Submitted'
      });

      return reply.send({
        status:  ApiResponseType.SUCCESS,
        data:    appeal,
        message: 'Your application is processing, Please wait for approval'
      });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  }
};
