const DashboardController = require('../controllers/DashboardController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/dashboard/stats', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, DashboardController.stats);
}
