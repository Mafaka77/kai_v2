const { Attendance, User, Office } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { HOLIDAY_DATES_DD_MM_YYYY } = require('../constants/holidays');

module.exports = {
  index: async (request, reply) => {
    try {
      const { office_id, date, status_filter, page = 1, limit = 15 } = request.query || {};
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      let officesList = [];
      let targetOfficeIds = [];

      const loggedInUser = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });
      officesList = loggedInUser?.Offices || [];
      const managedIds = officesList.map(o => o.id);
      
      if (office_id) {
        const idVal = parseInt(office_id);
        if (managedIds.includes(idVal)) {
          targetOfficeIds = [idVal];
        } else {
          return reply.code(403).send({ status: 'error', message: 'Unauthorized access to this office' });
        }
      } else {
        targetOfficeIds = managedIds;
      }

      // Default to today if date is not specified
      let targetDate = date;
      if (!targetDate) {
        targetDate = moment().format('YYYY-MM-DD');
      }

      const startOfDay = moment(targetDate).startOf('day').toDate();
      const endOfDay = moment(targetDate).endOf('day').toDate();

      // 1. Fetch attendance records for target offices & target date
      const attendanceRecords = await Attendance.findAll({
        where: {
          office_id: { [Op.in]: targetOfficeIds },
          signin_at: { [Op.gte]: startOfDay, [Op.lte]: endOfDay }
        },
        include: [
          { model: User, attributes: ['id', 'full_name', 'designation', 'mobile'] },
          { model: Office, attributes: ['id', 'name'] }
        ],
        order: [['signin_at', 'ASC']]
      });

      // 2. Fetch leave records covering targetDate
      const leaveRecords = await Attendance.findAll({
        where: {
          office_id: { [Op.in]: targetOfficeIds },
          leaveType: { [Op.ne]: null },
          start_date: { [Op.lte]: targetDate },
          end_date: { [Op.gte]: targetDate }
        },
        include: [
          { model: User, attributes: ['id', 'full_name', 'designation', 'mobile'] },
          { model: Office, attributes: ['id', 'name'] }
        ]
      });

      // 3. Fetch all assigned staff members for the target offices
      const assignedUsers = await User.findAll({
        attributes: ['id', 'full_name', 'designation', 'mobile'],
        include: [
          {
            model: Office,
            as: 'Offices',
            where: { id: { [Op.in]: targetOfficeIds } },
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ]
      });

      const leaveMap = new Map();
      leaveRecords.forEach(l => {
        if (l.user_id) leaveMap.set(l.user_id, l);
      });

      const combinedList = [];
      const processedUserIds = new Set();

      // First, add all signed-in attendance records
      attendanceRecords.forEach(att => {
        const json = att.toJSON();
        processedUserIds.add(json.user_id);
        combinedList.push(json);
      });

      // Second, add assigned users who didn't sign in
      assignedUsers.forEach(u => {
        if (processedUserIds.has(u.id)) return;
        processedUserIds.add(u.id);

        const leave = leaveMap.get(u.id);
        const officeObj = u.Offices && u.Offices.length ? { id: u.Offices[0].id, name: u.Offices[0].name } : null;

        if (leave) {
          combinedList.push({
            id: `leave_${u.id}_${targetDate}`,
            user_id: u.id,
            office_id: officeObj ? officeObj.id : targetOfficeIds[0],
            signin_at: null,
            signout_at: null,
            type: 'leave',
            leaveType: leave.leaveType,
            User: { id: u.id, full_name: u.full_name, designation: u.designation, mobile: u.mobile },
            Office: officeObj
          });
        } else {
          combinedList.push({
            id: `absent_${u.id}_${targetDate}`,
            user_id: u.id,
            office_id: officeObj ? officeObj.id : targetOfficeIds[0],
            signin_at: null,
            signout_at: null,
            type: 'absent',
            User: { id: u.id, full_name: u.full_name, designation: u.designation, mobile: u.mobile },
            Office: officeObj
          });
        }
      });

      // Calculate summary metrics
      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;
      let leaveCount = 0;

      combinedList.forEach(item => {
        if (item.type === 'present') presentCount++;
        else if (item.type === 'late') lateCount++;
        else if (item.type === 'absent') absentCount++;
        else if (item.type === 'leave') leaveCount++;
      });

      // Filter by status if provided
      let filteredList = combinedList;
      if (status_filter && status_filter !== 'all') {
        filteredList = combinedList.filter(item => item.type === status_filter);
      }

      // Sort: Earliest sign-in first, then employees on leave, then absent employees
      filteredList.sort((a, b) => {
        if (a.signin_at && b.signin_at) {
          return new Date(a.signin_at) - new Date(b.signin_at);
        }
        if (a.signin_at && !b.signin_at) return -1;
        if (!a.signin_at && b.signin_at) return 1;

        const statusPriority = { leave: 1, absent: 2 };
        const pA = statusPriority[a.type] || 3;
        const pB = statusPriority[b.type] || 3;
        if (pA !== pB) return pA - pB;

        const nameA = a.User?.full_name || '';
        const nameB = b.User?.full_name || '';
        return nameA.localeCompare(nameB);
      });

      const totalCount = filteredList.length;
      const totalPages = Math.ceil(totalCount / limitNum) || 1;
      const rows = filteredList.slice(offset, offset + limitNum);

      return {
        status: 'success',
        data: rows,
        offices: officesList,
        summary: {
          total: combinedList.length,
          present: presentCount,
          late: lateCount,
          absent: absentCount,
          leave: leaveCount
        },
        pagination: {
          total: totalCount,
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

  // Returns the current week's attendance for the logged-in user
  myWeek: async (request, reply) => {
    try {
      const userId = request.user.id;

      const weekStart = moment().startOf('isoWeek').toDate(); // Monday
      const weekEnd = moment().endOf('isoWeek').toDate();     // Sunday

      const rows = await Attendance.findAll({
        where: {
          user_id: userId,
          signin_at: { [Op.between]: [weekStart, weekEnd] }
        },
        include: [
          { model: Office, attributes: ['id', 'name'] }
        ],
        order: [['signin_at', 'ASC']]
      });

      // Build a map of day -> record for the current ISO week (Mon-Sun)
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = moment().startOf('isoWeek').add(i, 'days');
        const record = rows.find(r => {
          const d = moment(r.signin_at);
          return d.isSame(day, 'day');
        }) || null;
        weekDays.push({
          date: day.format('YYYY-MM-DD'),
          dayLabel: day.format('ddd'),
          dayNumber: day.format('D'),
          isToday: day.isSame(moment(), 'day'),
          isWeekend: day.day() === 0 || day.day() === 6,
          record
        });
      }

      return { status: 'success', data: weekDays };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // Returns weekly attendance (Mon-Sun) for a specific user
  userWeek: async (request, reply) => {
    try {
      const { id } = request.params;
      const weekStart = moment().startOf('isoWeek').toDate();
      const weekEnd = moment().endOf('isoWeek').toDate();

      const rows = await Attendance.findAll({
        where: {
          user_id: id,
          signin_at: { [Op.between]: [weekStart, weekEnd] }
        },
        include: [
          { model: Office, attributes: ['id', 'name'] }
        ],
        order: [['signin_at', 'ASC']]
      });

      // Build a map of day -> record for the current ISO week (Mon-Sun)
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = moment().startOf('isoWeek').add(i, 'days');
        const record = rows.find(r => {
          const d = moment(r.signin_at);
          return d.isSame(day, 'day');
        }) || null;
        weekDays.push({
          date: day.format('YYYY-MM-DD'),
          dayLabel: day.format('ddd'),
          dayNumber: day.format('D'),
          isToday: day.isSame(moment(), 'day'),
          isWeekend: day.day() === 0 || day.day() === 6,
          record
        });
      }

      return { status: 'success', data: weekDays };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // Returns paginated attendance history for the logged-in user with date range
  myHistory: async (request, reply) => {
    try {
      const userId = request.user.id;
      const { from, to, page = 1, limit = 20 } = request.query || {};
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      const where = { user_id: userId };

      if (from && to) {
        where.signin_at = {
          [Op.gte]: moment(from).startOf('day').toDate(),
          [Op.lte]: moment(to).endOf('day').toDate()
        };
      } else if (from) {
        where.signin_at = { [Op.gte]: moment(from).startOf('day').toDate() };
      }

      const { count, rows } = await Attendance.findAndCountAll({
        where,
        include: [{ model: Office, attributes: ['id', 'name'] }],
        limit: limitNum,
        offset,
        distinct: true,
        order: [['signin_at', 'DESC']]
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

  // Returns paginated attendance history for a specific user
  userHistory: async (request, reply) => {
    try {
      const { id } = request.params;
      const { from, to, page = 1, limit = 100 } = request.query || {};
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      const where = { user_id: id };

      if (from && to) {
        where.signin_at = {
          [Op.gte]: moment(from).startOf('day').toDate(),
          [Op.lte]: moment(to).endOf('day').toDate()
        };
      } else if (from) {
        where.signin_at = { [Op.gte]: moment(from).startOf('day').toDate() };
      }

      const { count, rows } = await Attendance.findAndCountAll({
        where,
        include: [{ model: Office, attributes: ['id', 'name'] }],
        limit: limitNum,
        offset,
        distinct: true,
        order: [['signin_at', 'ASC']]
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

  // Export CSV attendance history for a specific user including holidays, weekends, leaves & absent days
  exportUserHistory: async (request, reply) => {
    try {
      const { id } = request.params;
      const { from, to } = request.query || {};

      const holidaysList = HOLIDAY_DATES_DD_MM_YYYY;

      const user = await User.findByPk(id, {
        attributes: ['id', 'full_name', 'designation', 'mobile'],
        include: [{ model: Office, as: 'Offices', attributes: ['id', 'name'], through: { attributes: [] } }]
      });

      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User not found' });
      }

      const defaultOfficeName = user.Offices && user.Offices.length ? user.Offices[0].name : '-';

      // Determine date bounds
      let startDate, endDate;
      if (from && to) {
        startDate = moment(from, 'YYYY-MM-DD');
        endDate = moment(to, 'YYYY-MM-DD');
      } else if (from) {
        startDate = moment(from, 'YYYY-MM-DD');
        endDate = moment();
      } else if (to) {
        const earliest = await Attendance.findOne({
          where: { user_id: id },
          order: [['signin_at', 'ASC']]
        });
        startDate = earliest && earliest.signin_at ? moment(earliest.signin_at) : moment().startOf('month');
        endDate = moment(to, 'YYYY-MM-DD');
      } else {
        const earliest = await Attendance.findOne({
          where: { user_id: id },
          order: [['signin_at', 'ASC']]
        });
        startDate = earliest && earliest.signin_at ? moment(earliest.signin_at) : moment().startOf('month');
        endDate = moment();
      }

      // Fetch all attendance and leave records for user within [startDate, endDate]
      const dbRecords = await Attendance.findAll({
        where: {
          user_id: id,
          [Op.or]: [
            {
              signin_at: {
                [Op.gte]: startDate.clone().startOf('day').toDate(),
                [Op.lte]: endDate.clone().endOf('day').toDate()
              }
            },
            {
              leaveType: { [Op.ne]: null },
              start_date: { [Op.lte]: endDate.format('YYYY-MM-DD') },
              end_date: { [Op.gte]: startDate.format('YYYY-MM-DD') }
            }
          ]
        },
        include: [{ model: Office, attributes: ['id', 'name'] }],
        order: [['signin_at', 'ASC']]
      });

      const attendanceMap = new Map();
      const leaveMap = new Map();

      dbRecords.forEach(rec => {
        if (rec.signin_at) {
          const dateStr = moment(rec.signin_at).format('YYYY-MM-DD');
          attendanceMap.set(dateStr, rec);
        } else if (rec.leaveType && rec.start_date && rec.end_date) {
          let currLeave = moment(rec.start_date);
          const endLeave = moment(rec.end_date);
          while (currLeave.isSameOrBefore(endLeave, 'day')) {
            leaveMap.set(currLeave.format('YYYY-MM-DD'), rec);
            currLeave.add(1, 'day');
          }
        }
      });

      const escapeCsv = (str) => {
        if (str === null || str === undefined) return '""';
        const stringified = String(str).replace(/"/g, '""');
        return `"${stringified}"`;
      };

      let csv = 'Date,Day,Employee Name,Designation,Mobile,Office,Status,Sign In Time,Sign Out Time,In Remark,Out Remark\n';

      const today = moment().startOf('day');
      let curr = startDate.clone();

      while (curr.isSameOrBefore(endDate, 'day')) {
        const dateStr = curr.format('YYYY-MM-DD');
        const formattedHolidaysDate = curr.format('DD-MM-YYYY');
        const dayName = curr.format('dddd');
        const dayOfWeek = curr.day(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = holidaysList.includes(formattedHolidaysDate);

        const attRecord = attendanceMap.get(dateStr);
        const leaveRecord = leaveMap.get(dateStr);

        let status = 'ABSENT';
        let signinStr = '-';
        let signoutStr = '-';
        let inRemark = '';
        let outRemark = '';
        let officeName = defaultOfficeName;

        if (attRecord) {
          status = attRecord.type ? attRecord.type.toUpperCase() : 'PRESENT';
          signinStr = attRecord.signin_at ? moment(attRecord.signin_at).format('HH:mm:ss') : '-';
          signoutStr = attRecord.signout_at ? moment(attRecord.signout_at).format('HH:mm:ss') : '-';
          inRemark = attRecord.in_remark || '';
          outRemark = attRecord.out_remark || '';
          if (attRecord.Office) officeName = attRecord.Office.name;
        } else if (leaveRecord) {
          status = `LEAVE (${(leaveRecord.leaveType || 'LEAVE').toUpperCase()})`;
          inRemark = leaveRecord.in_remark || '';
          outRemark = leaveRecord.out_remark || '';
          if (leaveRecord.Office) officeName = leaveRecord.Office.name;
        } else if (isHoliday) {
          status = 'HOLIDAY';
        } else if (isWeekend) {
          status = 'WEEKEND';
        } else if (curr.isAfter(today, 'day')) {
          status = 'UPCOMING';
        } else {
          status = 'ABSENT';
        }

        csv += `${escapeCsv(dateStr)},${escapeCsv(dayName)},${escapeCsv(user.full_name)},${escapeCsv(user.designation || 'Staff')},${escapeCsv(user.mobile || '')},${escapeCsv(officeName)},${escapeCsv(status)},${escapeCsv(signinStr)},${escapeCsv(signoutStr)},${escapeCsv(inRemark)},${escapeCsv(outRemark)}\n`;

        curr.add(1, 'day');
      }

      const safeName = (user.full_name || 'employee').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const filename = `attendance_history_${safeName}.csv`;

      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      return reply.send(csv);
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
