const AttendanceController = require('../controllers/AttendanceController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/attendances', { preValidation: [fastify.authenticate] }, AttendanceController.index);
  fastify.get('/web/my-attendance', { preValidation: [fastify.authenticate] }, AttendanceController.myWeek);
  fastify.get('/web/my-attendance/history', { preValidation: [fastify.authenticate] }, AttendanceController.myHistory);
  fastify.get('/web/attendances/user/:id/week', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AttendanceController.userWeek);
  fastify.get('/web/attendances/user/:id/history', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AttendanceController.userHistory);
}
