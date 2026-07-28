const { Attendance, User, Office, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

module.exports = {
  index: async (request, reply) => {
    try {
      const { office_id, search, page = 1, limit = 15 } = request.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      // Get logged-in user & their assigned offices
      const loggedInUser = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });

      const userOffices = loggedInUser ? loggedInUser.Offices : [];
      const managedOfficeIds = userOffices.map(o => o.id);

      // Current week date bounds
      const from = moment().startOf('week').format('YYYY-MM-DD 00:00:00');
      const to = moment().endOf('week').format('YYYY-MM-DD 23:59:59');

      // 1. Find user_ids with 3+ distinct late days in the current week
      const lateGroup = await Attendance.findAll({
        attributes: [
          'user_id',
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.fn('DATE', sequelize.col('signin_at')))), 'late_days'],
          [sequelize.fn('MAX', sequelize.col('created_at')), 'last_late']
        ],
        where: {
          type: 'late',
          signin_at: { [Op.between]: [from, to] }
        },
        group: ['user_id'],
        having: sequelize.literal('COUNT(DISTINCT DATE(signin_at)) >= 3'),
        raw: true
      });

      if (!lateGroup || lateGroup.length === 0) {
        return {
          status: 'success',
          data: [],
          offices: userOffices,
          selectedOffice: office_id || (userOffices[0] ? userOffices[0].id : null),
          pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0, hasNextPage: false, hasPrevPage: false }
        };
      }

      const lateDaysMap = {};
      lateGroup.forEach(item => {
        lateDaysMap[item.user_id] = item.late_days;
      });

      const userIds = lateGroup.map(item => item.user_id);

      // Target office filter
      const targetOfficeIds = office_id ? [parseInt(office_id)] : managedOfficeIds;

      // 2. Fetch User models matching office filter & search query with pagination
      let userWhere = { id: userIds };
      if (search) {
        userWhere.full_name = { [Op.like]: `%${search}%` };
      }

      const { count, rows } = await User.findAndCountAll({
        where: userWhere,
        include: [
          {
            model: Office,
            as: 'Offices',
            required: true,
            where: { id: targetOfficeIds }
          }
        ],
        order: [['id', 'DESC']],
        limit: limitNum,
        offset,
        distinct: true
      });

      const result = rows.map(user => {
        const u = user.toJSON();
        u.late_days = lateDaysMap[user.id] || 3;
        return u;
      });

      const totalPages = Math.ceil(count / limitNum);

      return {
        status: 'success',
        data: result,
        offices: userOffices,
        selectedOffice: office_id || (userOffices[0] ? userOffices[0].id : null),
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

  exportCsv: async (request, reply) => {
    try {
      const { office_id, search } = request.query;

      const loggedInUser = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });

      const userOffices = loggedInUser ? loggedInUser.Offices : [];
      const managedOfficeIds = userOffices.map(o => o.id);

      const from = moment().startOf('week').format('YYYY-MM-DD 00:00:00');
      const to = moment().endOf('week').format('YYYY-MM-DD 23:59:59');

      const lateGroup = await Attendance.findAll({
        attributes: [
          'user_id',
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.fn('DATE', sequelize.col('signin_at')))), 'late_days']
        ],
        where: {
          type: 'late',
          signin_at: { [Op.between]: [from, to] }
        },
        group: ['user_id'],
        having: sequelize.literal('COUNT(DISTINCT DATE(signin_at)) >= 3'),
        raw: true
      });

      const lateDaysMap = {};
      lateGroup.forEach(item => {
        lateDaysMap[item.user_id] = item.late_days;
      });

      const userIds = lateGroup.map(item => item.user_id);
      const targetOfficeIds = office_id ? [parseInt(office_id)] : managedOfficeIds;

      let userWhere = { id: userIds };
      if (search) {
        userWhere.full_name = { [Op.like]: `%${search}%` };
      }

      const users = await User.findAll({
        where: userWhere,
        include: [
          {
            model: Office,
            as: 'Offices',
            required: true,
            where: { id: targetOfficeIds }
          }
        ]
      });

      // Build CSV output
      let csv = 'Full Name,Designation,Mobile,Late Days,Offices\n';
      users.forEach(u => {
        const officesStr = u.Offices.map(o => o.name).join(' | ');
        const lDays = lateDaysMap[u.id] || 3;
        csv += `"${u.full_name}","${u.designation || 'Staff'}","${u.mobile || ''}",${lDays},"${officesStr}"\n`;
      });

      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="late_list.csv"');
      return reply.send(csv);
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
