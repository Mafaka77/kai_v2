const { User, Attendance, sequelize } = require('./models');
const { Op } = require('sequelize');

async function test() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let statsStartDate = today;
  let statsEndDate = tomorrow;

  const countToday = await Attendance.count({
    where: { signin_at: { [Op.gte]: today, [Op.lt]: tomorrow } }
  });

  console.log("Count today:", countToday, "for range:", today, "to", tomorrow);

  if (countToday === 0) {
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
      console.log("Fallback triggered! Range:", statsStartDate, "to", statsEndDate);
    }
  }

  // Find users who have attendance in the fallback range
  const usersWithAttendance = await Attendance.findAll({
    where: { signin_at: { [Op.gte]: statsStartDate, [Op.lt]: statsEndDate } },
    limit: 1
  });
  
  if (usersWithAttendance.length > 0) {
    const user_id = usersWithAttendance[0].user_id;
    console.log("Testing with user:", user_id);
    const todayAttendance = await Attendance.findOne({
      where: { user_id: user_id, signin_at: { [Op.gte]: statsStartDate, [Op.lt]: statsEndDate } }
    });
    console.log("todayAttendance for user:", todayAttendance ? todayAttendance.signin_at : null);
  } else {
    console.log("No one has attendance in this range.");
  }
  process.exit();
}
test();
