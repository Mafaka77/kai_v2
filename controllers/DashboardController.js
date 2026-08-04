const { User, Office, Attendance, District, AppealAttendance, PostingRequest, Device, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const { HOLIDAY_DATES_DD_MM_YYYY: holidays } = require('../constants/holidays');

module.exports = {
  stats: async (request, reply) => {
    try {
      const user = request.user;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Default stats date range to Today
      let statsStartDate = today;
      let statsEndDate = tomorrow;
      let dateLabel = "Today";

      // Check if today has attendance sign-ins
      const countToday = await Attendance.count({
        where: { signin_at: { [Op.gte]: today, [Op.lt]: tomorrow } }
      });

      if (countToday === 0) {
        // Fallback to last working date with sign-ins if today has none
        const latestAttendance = await Attendance.findOne({
          order: [['signin_at', 'DESC']]
        });

        if (latestAttendance && latestAttendance.signin_at) {
          const latestDate = new Date(latestAttendance.signin_at);
          latestDate.setHours(0, 0, 0, 0);

          statsStartDate = latestDate;
          const nextDay = new Date(latestDate);
          nextDay.setDate(nextDay.getDate() + 1);
          statsEndDate = nextDay;

          const isYesterday = latestDate.getTime() === (today.getTime() - 86400000);
          dateLabel = isYesterday ? "Yesterday" : `${latestDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} (Last Working Day)`;
        }
      }

      const isManager = user?.role === 'Manager';
      const isAdmin = user?.role === 'Admin';

      let data = {};

      if (isAdmin) {
        const [
          totalUsers,
          totalOffices,
          totalDistricts,
          periodAttendances,
          pendingAppeals,
          pendingPostingRequests,
          employeesOnLeave
        ] = await Promise.all([
          User.count(),
          Office.count(),
          District.count(),
          Attendance.count({ where: { signin_at: { [Op.gte]: statsStartDate, [Op.lt]: statsEndDate } } }),
          AppealAttendance.count({ where: { status: 'Submitted' } }),
          PostingRequest.count({ where: { status: 'Submitted' } }),
          Attendance.count({
            where: {
              leaveType: { [Op.ne]: null },
              start_date: { [Op.lte]: today },
              end_date: { [Op.gte]: today }
            },
            distinct: true,
            col: 'user_id'
          })
        ]);

        // Fetch ALL offices with total assigned staff count
        const allOffices = await Office.findAll({
          attributes: [
            'id',
            'name',
            [sequelize.literal('(SELECT COUNT(*) FROM user_offices WHERE user_offices.office_id = Office.id)'), 'total_staff']
          ],
          raw: true
        });

        // Group attendance by office_id AND type (present vs late)
        const attendanceBreakdown = await Attendance.findAll({
          attributes: [
            'office_id',
            'type',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            signin_at: { [Op.gte]: statsStartDate, [Op.lt]: statsEndDate },
            office_id: { [Op.ne]: null }
          },
          group: ['office_id', 'type'],
          raw: true
        });

        const officeStatsMap = {};
        let activeOfficesCount = 0;

        attendanceBreakdown.forEach(item => {
          const offId = item.office_id;
          if (!officeStatsMap[offId]) {
            officeStatsMap[offId] = { present: 0, late: 0, total_signin: 0 };
          }
          const cnt = parseInt(item.count || 0);
          officeStatsMap[offId].total_signin += cnt;
          if (item.type === 'late') {
            officeStatsMap[offId].late += cnt;
          } else {
            officeStatsMap[offId].present += cnt;
          }
        });

        Object.keys(officeStatsMap).forEach(offId => {
          if (officeStatsMap[offId].total_signin > 0) activeOfficesCount++;
        });

        // Map ALL system offices with Present, Late, Absent metrics
        const officeAttendanceChart = allOffices.map(off => {
          const stats = officeStatsMap[off.id] || { present: 0, late: 0, total_signin: 0 };
          const totalStaff = parseInt(off.total_staff || 0);
          const absent = Math.max(0, totalStaff - stats.total_signin);

          return {
            office_id: off.id,
            office_name: off.name,
            present: stats.present,
            late: stats.late,
            absent: absent,
            total_staff: totalStaff,
            count: stats.total_signin
          };
        });

        // Sort descending (highest attendance offices first)
        officeAttendanceChart.sort((a, b) => b.count - a.count);

        data = {
          role: 'Admin',
          users: totalUsers,
          offices: totalOffices,
          active_offices: activeOfficesCount,
          districts: totalDistricts,
          attendances_today: periodAttendances,
          date_label: dateLabel,
          pending_appeals: pendingAppeals,
          pending_posting_requests: pendingPostingRequests,
          employees_on_leave: employeesOnLeave,
          office_attendance_chart: officeAttendanceChart
        };
      } else if (isManager) {
        const loggedInUser = await User.findByPk(user.id, {
          include: [{ model: Office, as: 'Offices' }]
        });
        const officeIds = loggedInUser?.Offices?.map(o => o.id) || [];
        const officeWhere = officeIds.length ? { office_id: { [Op.in]: officeIds } } : {};

        const [
          periodAttendances,
          pendingAppeals
        ] = await Promise.all([
          Attendance.count({ where: { ...officeWhere, signin_at: { [Op.gte]: statsStartDate, [Op.lt]: statsEndDate } } }),
          AppealAttendance.count({ where: { ...officeWhere, status: 'Submitted' } })
        ]);

        // Fetch employees in manager's office
        let officeUsers = [];
        if (officeIds.length) {
          officeUsers = await User.findAll({
            attributes: ['id', 'full_name', 'designation', 'mobile'],
            include: [
              {
                model: Office,
                as: 'Offices',
                required: true,
                where: { id: { [Op.in]: officeIds } },
                attributes: ['id', 'name']
              },
              {
                model: Attendance,
                as: 'Attendances',
                required: false,
                where: {
                  signin_at: { [Op.gte]: statsStartDate, [Op.lt]: statsEndDate }
                }
              }
            ],
            order: [['full_name', 'ASC']]
          });
        }

        let presentCount = 0;
        let lateCount = 0;
        let absentCount = 0;

        const todayUserAttendances = officeUsers.map(u => {
          const uJson = u.toJSON();
          const att = uJson.Attendances && uJson.Attendances.length ? uJson.Attendances[0] : null;
          let status = 'Absent';
          if (att) {
            if (att.type === 'late') {
              status = 'Late';
              lateCount++;
            } else {
              status = 'Present';
              presentCount++;
            }
          } else {
            absentCount++;
          }

          return {
            id: uJson.id,
            full_name: uJson.full_name,
            designation: uJson.designation || 'Staff',
            mobile: uJson.mobile,
            office_name: uJson.Offices && uJson.Offices[0] ? uJson.Offices[0].name : '',
            signin_at: att ? att.signin_at : null,
            signout_at: att ? att.signout_at : null,
            in_remark: att ? att.in_remark : null,
            out_remark: att ? att.out_remark : null,
            type: att ? att.type : null,
            status
          };
        });

        // Sort employees: Earliest sign-in first, then employees without sign-ins
        todayUserAttendances.sort((a, b) => {
          if (a.signin_at && b.signin_at) {
            return new Date(a.signin_at) - new Date(b.signin_at);
          }
          if (a.signin_at && !b.signin_at) return -1;
          if (!a.signin_at && b.signin_at) return 1;
          return (a.full_name || '').localeCompare(b.full_name || '');
        });

        // Today pie chart breakdown
        const todayPieChart = [
          { name: 'Present (On Time)', value: presentCount, itemStyle: { color: '#10b981' } },
          { name: 'Late Sign-in', value: lateCount, itemStyle: { color: '#f59e0b' } },
          { name: 'Absent', value: absentCount, itemStyle: { color: '#f43f5e' } }
        ];

        // Compute weekly attendance per employee starting from Monday of the current ISO week (excluding Weekends & Holidays)
        const mondayStart = moment(statsStartDate).startOf('isoWeek').toDate();

        // Count working days in this week so far (Monday through current date, excluding weekends and official holidays)
        let workingDaysCount = 0;
        const curDate = new Date(mondayStart);
        while (curDate < statsEndDate) {
          const dayOfWeek = curDate.getDay();
          const formattedDate = moment(curDate).format('DD-MM-YYYY');
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
          const isHoliday = holidays.includes(formattedDate);

          if (!isWeekend && !isHoliday) {
            workingDaysCount++;
          }
          curDate.setDate(curDate.getDate() + 1);
        }

        if (workingDaysCount === 0) workingDaysCount = 1;

        const weeklyEmployeeChartPromises = officeUsers.map(async emp => {
          const empAttendances = await Attendance.findAll({
            where: {
              user_id: emp.id,
              signin_at: { [Op.gte]: mondayStart, [Op.lt]: statsEndDate }
            },
            raw: true
          });

          let pDays = 0;
          let lDays = 0;

          empAttendances.forEach(att => {
            if (att.signin_at) {
              const attDate = new Date(att.signin_at);
              const dayOfWeek = attDate.getDay();
              const formattedDate = moment(attDate).format('DD-MM-YYYY');
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isHoliday = holidays.includes(formattedDate);

              // Only count attendance on official working days
              if (!isWeekend && !isHoliday) {
                if (att.type === 'late') lDays++;
                else pDays++;
              }
            }
          });

          const aDays = Math.max(0, workingDaysCount - (pDays + lDays));

          return {
            user_id: emp.id,
            employee_name: emp.full_name,
            designation: emp.designation || 'Staff',
            present: pDays,
            late: lDays,
            absent: aDays,
            working_days: workingDaysCount,
            count: pDays + lDays
          };
        });

        const weeklyEmployeeChart = await Promise.all(weeklyEmployeeChartPromises);

        // Fetch recent approval-required appeals for manager's office
        const recentAppealsRaw = await AppealAttendance.findAll({
          where: {
            ...officeWhere,
            status: 'Submitted'
          },
          include: [{
            model: User,
            attributes: ['id', 'full_name', 'designation']
          }],
          order: [['id', 'DESC']],
          limit: 5
        });

        const recentAppeals = recentAppealsRaw.map(app => ({
          id: app.id,
          employee_name: app.User?.full_name || `User #${app.user_id}`,
          designation: app.User?.designation || 'Staff',
          start_date: app.start_date,
          end_date: app.end_date,
          reason: app.reason || 'No reason provided',
          created_at: app.createdAt
        }));

        // Fetch employees currently on leave in manager's office
        const todayStr = moment().format('YYYY-MM-DD');

        const employeesOnLeaveCount = await Attendance.count({
          where: {
            ...officeWhere,
            leaveType: { [Op.not]: null },
            start_date: { [Op.lte]: todayStr },
            end_date: { [Op.gte]: todayStr }
          }
        });

        // Fetch submitted device change requests for manager's office employees
        let pendingDevicesRaw = [];
        let pendingDevicesCount = 0;

        if (officeIds.length) {
          pendingDevicesRaw = await Device.findAll({
            where: {
              status: { [Op.in]: ['Pending', 'Submitted'] }
            },
            include: [{
              model: User,
              required: true,
              attributes: ['id', 'full_name', 'designation', 'mobile'],
              include: [{
                model: Office,
                as: 'Offices',
                required: true,
                where: { id: { [Op.in]: officeIds } }
              }]
            }],
            order: [['id', 'DESC']],
            limit: 5
          });

          pendingDevicesCount = await Device.count({
            where: {
              status: { [Op.in]: ['Pending', 'Submitted'] }
            },
            include: [{
              model: User,
              required: true,
              include: [{
                model: Office,
                as: 'Offices',
                required: true,
                where: { id: { [Op.in]: officeIds } }
              }]
            }]
          });
        }

        const recentDeviceRequests = pendingDevicesRaw.map(dev => ({
          id: dev.id,
          device_name: dev.name || 'Mobile Device',
          device_uid: dev.uid || '—',
          employee_name: dev.User?.full_name || `User #${dev.user_id}`,
          designation: dev.User?.designation || 'Staff',
          created_at: dev.createdAt
        }));

        data = {
          role: 'Manager',
          office_name: loggedInUser?.Offices?.[0]?.name || 'Assigned Office',
          office_users: officeUsers.length,
          attendances_today: periodAttendances,
          date_label: dateLabel,
          pending_appeals: pendingAppeals,
          employees_on_leave_count: employeesOnLeaveCount,
          pending_devices: pendingDevicesCount,
          today_user_attendances: todayUserAttendances,
          today_pie_chart: todayPieChart,
          weekly_employee_chart: weeklyEmployeeChart,
          recent_appeals: recentAppeals,
          recent_device_requests: recentDeviceRequests
        };
      } else {
        // Regular User
        const reqMonth = request.query.month;
        const reqYear = request.query.year;
        
        let firstDayOfMonth, lastDayOfMonth;
        if (reqMonth && reqYear) {
          firstDayOfMonth = new Date(parseInt(reqYear), parseInt(reqMonth) - 1, 1);
          lastDayOfMonth = new Date(parseInt(reqYear), parseInt(reqMonth), 1);
        } else {
          firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        }

        const [
          myAttendancesThisMonth,
          monthlyAttendances,
          todayAttendance,
          myPendingAppeals,
          myPendingPostingRequests
        ] = await Promise.all([
          Attendance.count({ where: { user_id: user.id, signin_at: { [Op.gte]: firstDayOfMonth, [Op.lt]: lastDayOfMonth } } }),
          Attendance.findAll({ 
            where: { user_id: user.id, signin_at: { [Op.gte]: firstDayOfMonth, [Op.lt]: lastDayOfMonth } },
            attributes: ['id', 'signin_at', 'signout_at', 'type', 'leaveType']
          }),
          Attendance.findOne({ 
            where: { 
              user_id: user.id, 
              signin_at: { [Op.gte]: moment().startOf('day').toDate(), [Op.lte]: moment().endOf('day').toDate() } 
            },
            order: [['signin_at', 'DESC']]
          }),
          AppealAttendance.count({ where: { user_id: user.id, status: 'Submitted' } }),
          PostingRequest.count({ where: { status: 'Submitted' } })
        ]);

        data = {
          role: 'User',
          attendances_this_month: myAttendancesThisMonth,
          monthly_attendances: monthlyAttendances,
          today_signin: todayAttendance ? todayAttendance.signin_at : null,
          date_label: dateLabel,
          pending_appeals: myPendingAppeals,
          pending_posting_requests: myPendingPostingRequests
        };
      }

      return { status: 'success', data };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
