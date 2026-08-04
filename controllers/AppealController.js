const { AppealAttendance, Attendance, User, Office, Role, Device, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { HOLIDAY_DATES_DD_MM_YYYY: holidays } = require('../constants/holidays');

module.exports = {
  index: async (request, reply) => {
    try {
      const { type, search, status, office_id, page = 1, limit = 15 } = request.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;
      
      const loggedInUser = await User.findByPk(request.user.id, {
        include: [
          { model: Office, as: 'Offices' },
          { model: Role, as: 'Roles', through: { attributes: [] } }
        ]
      });

      let availableOffices = loggedInUser?.Offices || [];
      let targetOfficeIds = availableOffices.map(o => o.id);

      const roles = loggedInUser?.Roles ? loggedInUser.Roles.map(r => r.name) : [];
      const isAdmin = roles.includes('Admin');

      if (isAdmin && targetOfficeIds.length === 0) {
        availableOffices = await Office.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
        targetOfficeIds = availableOffices.map(o => o.id);
      }

      let appealWhere = { type };

      if (office_id && office_id !== 'All') {
        appealWhere.office_id = parseInt(office_id);
      } else if (targetOfficeIds.length > 0) {
        appealWhere.office_id = { [Op.in]: targetOfficeIds };
      }

      if (status && status !== 'All') {
        appealWhere.status = status;
      }

      let userWhere = {};
      if (search) {
        userWhere.full_name = { [Op.like]: `%${search}%` };
      }

      const { count, rows } = await AppealAttendance.findAndCountAll({
        where: appealWhere,
        include: [
          {
            model: User,
            required: true,
            where: userWhere
          },
          { model: Office }
        ],
        order: [
          [sequelize.literal(`CASE WHEN status = 'Submitted' THEN 0 ELSE 1 END`), 'ASC'],
          ['id', 'DESC']
        ],
        limit: limitNum,
        offset,
        distinct: true
      });

      const totalPages = Math.ceil(count / limitNum) || 1;

      let countWhereBase = { type };
      if (office_id && office_id !== 'All') {
        countWhereBase.office_id = parseInt(office_id);
      } else if (targetOfficeIds.length > 0) {
        countWhereBase.office_id = { [Op.in]: targetOfficeIds };
      }

      const getCountInclude = () => [{ model: User, required: true, where: userWhere }];

      const pendingCountP = AppealAttendance.count({ where: { ...countWhereBase, status: 'Submitted' }, include: getCountInclude(), distinct: true, col: 'id' });
      const approvedCountP = AppealAttendance.count({ where: { ...countWhereBase, status: 'Approved' }, include: getCountInclude(), distinct: true, col: 'id' });
      const rejectedCountP = AppealAttendance.count({ where: { ...countWhereBase, status: 'Rejected' }, include: getCountInclude(), distinct: true, col: 'id' });

      const [pendingCount, approvedCount, rejectedCount] = await Promise.all([pendingCountP, approvedCountP, rejectedCountP]);

      return {
        status: 'success',
        data: rows,
        offices: availableOffices,
        counts: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        },
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

  approve: async (request, reply) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = request.params;
      const appeal = await AppealAttendance.findByPk(id);
      if (!appeal) {
        return reply.code(404).send({ status: 'error', message: 'Appeal request not found' });
      }
      
      const office = await Office.findByPk(appeal.office_id);
      const user = await User.findByPk(appeal.user_id);
      const device = await Device.findOne({ where: { user_id: user.id } });
      
      if (appeal.type === 'on_Duty') {
        const startDate = moment(appeal.start_date);
        const endDate = moment(appeal.end_date);
        
        let currentDate = moment(startDate);
        while (currentDate.isSameOrBefore(endDate)) {
          const dayOfWeek = currentDate.day();
          const formattedDate = currentDate.format('DD-MM-YYYY');
          
          // Skip weekends (Saturday: 6, Sunday: 0) and listed holidays
          if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(formattedDate)) {
            const dbDateString = currentDate.format('YYYY-MM-DD');
            const signin_at = moment(`${dbDateString} ${office.start_time}`, 'YYYY-MM-DD HH:mm:ss').toDate();
            const signout_at = moment(`${dbDateString} ${office.close_time}`, 'YYYY-MM-DD HH:mm:ss').toDate();
            
            const existingAttendance = await Attendance.findOne({
              where: {
                user_id: user.id,
                office_id: office.id,
                signin_at: {
                  [Op.between]: [
                    moment(dbDateString).startOf('day').toDate(),
                    moment(dbDateString).endOf('day').toDate()
                  ]
                }
              }
            });
            
            if (existingAttendance) {
              await existingAttendance.update({
                signout_at,
                signout_lat: office.lat,
                signout_lng: office.lng,
                in_remark: 'on-duty with approval'
              }, { transaction });
            } else {
              await Attendance.create({
                user_id: user.id,
                office_id: office.id,
                device_id: device ? device.id : null,
                signin_at,
                signout_at,
                signout_lat: office.lat,
                signout_lng: office.lng,
                lat: office.lat,
                lng: office.lng,
                type: 'present',
                in_remark: 'on-duty with approval'
              }, { transaction });
            }
          }
          currentDate.add(1, 'day');
        }
      } else if (appeal.type === 'late_reason') {
        const attendance = await Attendance.findByPk(appeal.attendance_id);
        if (!attendance) {
          throw new Error('Associated attendance record not found');
        }
        await attendance.update({
          in_remark: 'late with approval',
          type: 'present'
        }, { transaction });
      } else if (appeal.type === 'left_early') {
        const attendance = await Attendance.findByPk(appeal.attendance_id);
        if (!attendance) {
          throw new Error('Associated attendance record not found');
        }
        
        const signinDateString = moment(attendance.signin_at).format('YYYY-MM-DD');
        const signout_at = moment(`${signinDateString} ${office.close_time}`, 'YYYY-MM-DD HH:mm:ss').toDate();
        
        await attendance.update({
          signout_at,
          signout_lat: office.lat,
          signout_lng: office.lng,
          in_remark: 'left-early with approval'
        }, { transaction });
      }
      
      await appeal.update({ status: 'Approved' }, { transaction });
      await transaction.commit();
      
      return { status: 'success', message: 'Appeal approved successfully' };
    } catch (error) {
      await transaction.rollback();
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  reject: async (request, reply) => {
    try {
      const { id } = request.params;
      const appeal = await AppealAttendance.findByPk(id);
      if (!appeal) {
        return reply.code(404).send({ status: 'error', message: 'Appeal request not found' });
      }
      
      await appeal.update({ status: 'Rejected' });
      return { status: 'success', message: 'Appeal rejected successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  // GET /api/my-appeals — regular user fetches their own submitted appeals
    myAppeals: async (request, reply) => {
    try {
      const { type, status, page = 1, limit = 15 } = request.query || {};
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      const where = { user_id: request.user.id };
      if (type) where.type = type;
      if (status && status !== 'All') where.status = status;

      const { count, rows } = await AppealAttendance.findAndCountAll({
        where,
        include: [{ model: Office, attributes: ['id', 'name'] }],
        order: [
          [sequelize.literal(`CASE WHEN status = 'Submitted' THEN 0 ELSE 1 END`), 'ASC'],
          ['id', 'DESC']
        ],
        limit: limitNum,
        offset,
        distinct: true
      });

      const totalPages = Math.ceil(count / limitNum);

      const baseWhereForCounts = { user_id: request.user.id };
      if (type) baseWhereForCounts.type = type;

      const pendingCountP = AppealAttendance.count({ where: { ...baseWhereForCounts, status: 'Submitted' } });
      const approvedCountP = AppealAttendance.count({ where: { ...baseWhereForCounts, status: 'Approved' } });
      const rejectedCountP = AppealAttendance.count({ where: { ...baseWhereForCounts, status: 'Rejected' } });
      
      const [pendingCount, approvedCount, rejectedCount] = await Promise.all([pendingCountP, approvedCountP, rejectedCountP]);

      return {
        status: 'success',
        data: rows,
        counts: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        },
        pagination: {
          total: count, page: pageNum, limit: limitNum,
          totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // POST /api/appeals — regular user submits a new appeal
  store: async (request, reply) => {
    try {
      const { type = 'on_Duty', office_id, attendance_id, start_date, end_date, signin_time, reason } = request.body || {};

      let targetOfficeId = office_id ? parseInt(office_id) : null;

      if (!targetOfficeId) {
        const loggedInUser = await User.findByPk(request.user.id, {
          include: [{ model: Office, as: 'Offices' }]
        });
        const assignedOffice = loggedInUser?.Offices?.[0];
        if (assignedOffice) {
          targetOfficeId = assignedOffice.id;
        } else {
          const defaultOffice = await Office.findOne({ order: [['id', 'ASC']] });
          if (defaultOffice) {
            targetOfficeId = defaultOffice.id;
          } else {
            return reply.code(400).send({ status: 'error', message: 'No office configured in system. Please contact administrator.' });
          }
        }
      }

      if (!start_date || !reason) {
        return reply.code(400).send({ status: 'error', message: 'Start date and reason are required' });
      }

      // Check if attendance is already punched on the specified date(s)
      const startDateObj = moment(start_date).startOf('day').toDate();
      const endDateObj = moment(end_date || start_date).endOf('day').toDate();

      const existingAttendance = await Attendance.findOne({
        where: {
          user_id: request.user.id,
          signin_at: {
            [Op.between]: [startDateObj, endDateObj]
          }
        }
      });

      if (existingAttendance) {
        return reply.code(400).send({
          status: 'error',
          message: 'Attendance is already punched on the selected specified date(s).'
        });
      }

      const appeal = await AppealAttendance.create({
        user_id: request.user.id,
        office_id: targetOfficeId,
        attendance_id: attendance_id ? parseInt(attendance_id) : null,
        type: type || 'on_Duty',
        start_date: start_date || null,
        end_date: end_date || start_date || null,
        signin_time: signin_time || null,
        reason: reason || null,
        status: 'Submitted'
      });

      return { status: 'success', message: 'Appeal submitted successfully', data: appeal };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};

