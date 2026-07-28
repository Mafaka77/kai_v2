const { AppealAttendance, Attendance, User, Office, Device, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

const holidays = [
  // 2024
  '01-01-2024', '02-02-2024', '11-01-2024', '26-01-2024', '20-02-2024', '01-03-2024', '25-03-2024', '29-03-2024',
  '11-04-2024', '21-04-2024', '23-05-2024', '15-06-2024', '17-06-2024', '30-06-2024', '06-07-2024', '17-07-2024',
  '15-08-2024', '16-09-2024', '02-10-2024', '12-10-2024', '31-10-2024', '15-11-2024', '24-12-2024', '24-12-2024',
  '26-12-2024', '31-12-2024',
  // 2025
  '01-01-2025', '02-01-2025', '11-01-2025', '26-01-2025', '20-02-2025', '26-02-2025', '07-03-2025', '14-03-2025',
  '31-03-2025', '10-04-2025', '18-04-2025', '12-05-2025', '07-06-2025', '15-06-2025', '30-06-2025', '06-07-2025',
  '17-07-2025', '15-08-2025', '16-08-2025', '05-09-2025', '02-10-2025', '20-10-2025', '05-11-2025', '24-12-2025',
  '25-12-2025', '26-12-2025', '31-12-2025',
  // 2026
  '01-01-2026', '02-01-2026', '11-01-2026', '26-01-2026', '20-02-2026', '04-03-2026', '13-03-2026', '21-03-2026',
  '26-03-2026', '31-03-2026', '03-04-2026', '14-04-2026', '01-05-2026', '27-05-2026', '15-06-2026', '26-06-2026', '30-06-2026',
  '06-07-2026', '15-08-2026', '26-08-2026', '04-09-2026', '02-10-2026', '20-10-2026', '08-11-2026', '24-11-2026',
  '24-12-2026', '25-12-2026', '26-12-2026', '31-12-2026'
];

module.exports = {
  index: async (request, reply) => {
    try {
      const { type, search, page = 1, limit = 15 } = request.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;
      
      // Determine what offices the logged-in user manages
      const loggedInUser = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });
      
      const managedOfficeIds = loggedInUser.Offices.map(o => o.id);
      
      let userWhere = {};
      if (search) {
        userWhere.full_name = { [Op.like]: `%${search}%` };
      }
      
      const { count, rows } = await AppealAttendance.findAndCountAll({
        where: { type },
        include: [
          {
            model: User,
            required: true,
            where: userWhere,
            include: [
              {
                model: Office,
                as: 'Offices',
                required: true,
                where: { id: managedOfficeIds }
              }
            ]
          },
          { model: Office }
        ],
        order: [['id', 'DESC']],
        limit: limitNum,
        offset,
        distinct: true
      });
      
      const totalPages = Math.ceil(count / limitNum);
      
      return {
        status: 'success',
        data: rows,
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
      const { type, page = 1, limit = 15 } = request.query || {};
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      const where = { user_id: request.user.id };
      if (type) where.type = type;

      const { count, rows } = await AppealAttendance.findAndCountAll({
        where,
        include: [{ model: Office, attributes: ['id', 'name'] }],
        order: [['id', 'DESC']],
        limit: limitNum,
        offset,
        distinct: true
      });

      const totalPages = Math.ceil(count / limitNum);

      return {
        status: 'success',
        data: rows,
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

