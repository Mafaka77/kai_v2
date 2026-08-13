const { User, Office, Device, Attendance, District, Role, LateList, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

module.exports = {
  // POST /api/leaves — Receive leave request from external systems / apps
  store: async (request, reply) => {
    try {
      const body  = request.body || {};
      const query = request.query || {};
      const mobile     = body.mobile     || query.mobile;
      const leaveType  = body.leaveType  || query.leaveType;
      const start_date = body.start_date || query.start_date;
      const end_date   = body.end_date   || query.end_date;
      const no_of_days = body.no_of_days || query.no_of_days;

      if (!mobile || !leaveType || !start_date || !end_date || no_of_days === undefined) {
        return reply.code(422).send({ status: 422, message: 'The mobile, leaveType, start_date, end_date, and no_of_days fields are required.' });
      }

      // Find the user by mobile number
      const user = await User.findOne({ where: { mobile } });
      if (!user) {
        return reply.code(404).send({ message: 'Mobile No. not found' });
      }

      // Check if duplicate leave request already exists for this user and date range
      const existingLeave = await Attendance.findOne({
        where: {
          user_id: user.id,
          start_date,
          end_date
        }
      });

      if (existingLeave) {
        return reply.code(200).send({
          message: 'Leave request already exists',
          data:    existingLeave
        });
      }

      // Find user's assigned office
      const userWithOffice = await User.findByPk(user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });
      const office = userWithOffice?.Offices?.[0] || null;

      // Find user's device
      const device = await Device.findOne({ where: { user_id: user.id } });

      // Create attendance leave entry
      const leaveRequest = await Attendance.create({
        user_id:    user.id,
        office_id:  office ? office.id : null,
        device_id:  device ? device.id : null,
        type:       'absent',
        mobile,
        leaveType,
        start_date,
        end_date,
        no_of_days
      });

      return reply.code(201).send({
        message: 'Leave request stored successfully',
        data:    leaveRequest
      });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  // GET /web/leaves — Managers get users currently on leave today
  index: async (request, reply) => {
    try {
      const { search, office_id, page = 1, limit = 15 } = request.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      const isAdmin = request.user.role === 'Admin';
      let targetOfficeIds = null;
      let officesList = [];

      if (isAdmin) {
        officesList = await Office.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
        if (office_id) {
          targetOfficeIds = [parseInt(office_id)];
        }
      } else {
        const loggedInUser = await User.findByPk(request.user.id, {
          include: [{ model: Office, as: 'Offices' }]
        });
        officesList = loggedInUser?.Offices || [];
        const managedOfficeIds = officesList.map(o => o.id);

        if (office_id) {
          const idVal = parseInt(office_id);
          if (managedOfficeIds.includes(idVal)) {
            targetOfficeIds = [idVal];
          } else {
            return reply.code(403).send({ status: 403, message: 'Unauthorized access to this office' });
          }
        } else {
          targetOfficeIds = managedOfficeIds;
        }
      }

      const today = moment().format('YYYY-MM-DD');

      // User filters
      const userWhere = {};
      if (search) {
        userWhere.full_name = { [Op.like]: `%${search}%` };
      }

      const officeInclude = {
        model: Office,
        as: 'Offices',
        required: true,
        attributes: ['id', 'name']
      };
      if (targetOfficeIds) {
        officeInclude.where = { id: { [Op.in]: targetOfficeIds } };
      }

      // Eager load attendances (leaves) overlapping today
      const { count, rows } = await User.findAndCountAll({
        where: userWhere,
        include: [
          officeInclude,
          {
            model: Attendance,
            required: true,
            where: {
              start_date: { [Op.lte]: today },
              end_date: { [Op.gte]: today },
              leaveType: { [Op.not]: null }
            },
            attributes: ['id', 'leaveType', 'start_date', 'end_date', 'no_of_days']
          }
        ],
        limit: limitNum,
        offset: offset,
        distinct: true,
        order: [['id', 'DESC']]
      });

      const totalPages = Math.ceil(count / limitNum);

      return {
        status: 'success',
        data: rows.map(u => ({
          id: u.id,
          full_name: u.full_name,
          designation: u.designation,
          mobile: u.mobile,
          office: u.Offices?.[0] || null,
          leave: u.Attendances?.[0] || null
        })),
        offices: officesList,
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
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  // ─────────────────────────────────────────────────────────────────────
  // E-Leave Portal routes — mirrors api.php
  // ─────────────────────────────────────────────────────────────────────

  /**
   * GET /api/late_list
   * Returns mobile numbers of users who were late 3+ days in the current week.
   * Called by the E-Leave portal to identify persistently-late users.
   */
  late_list: async (request, reply) => {
    try {
      // Use startOf/endOf day to capture full day range (mirrors Carbon whereBetween behaviour)
      const from = moment().startOf('isoWeek').startOf('day').format('YYYY-MM-DD HH:mm:ss');
      const to   = moment().endOf('isoWeek').endOf('day').format('YYYY-MM-DD HH:mm:ss');

      // Find user IDs with 3+ late days this week
      const results = await Attendance.findAll({
        attributes: [
          'user_id',
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.fn('DATE', sequelize.col('signin_at')))), 'late_days']
        ],
        where: {
          type:      'late',
          signin_at: { [Op.between]: [from, to] }
        },
        group:  ['user_id'],
        having: sequelize.literal('late_days >= 3'),
        raw:    true
      });

      const lateUserIds = results.map(r => r.user_id);

      // Fetch their mobile numbers
      const users = await User.findAll({
        where:      { id: { [Op.in]: lateUserIds } },
        attributes: ['mobile']
      });

      return reply.send({ mobiles: users.map(u => u.mobile) });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  /**
   * POST /api/store_late_list
   * Stores a batch of late-list mobile records sent from the E-Leave portal.
   * Body: { mobiles: ['0123456789', ...] }
   */
  store_late_list: async (request, reply) => {
    try {
      const { mobiles } = request.body || {};

      if (!mobiles || !Array.isArray(mobiles) || mobiles.length === 0) {
        return reply.code(400).send({ status: 400, message: 'mobiles array is required' });
      }

      const records = [];

      for (const mobile of mobiles) {
        const user = await User.findOne({ where: { mobile } });
        if (!user) continue;

        const offices = await user.getOffices();
        const office  = offices[0] || null;

        records.push(await LateList.create({
          user_id:   user.id,
          office_id: office ? office.id : null,
          mobile
        }));
      }

      return reply.code(201).send({
        message: 'Late list stored successfully',
        data:    records
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
