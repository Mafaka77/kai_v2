const ReportController = require('../controllers/ReportController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/reports', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, ReportController.index);
  fastify.post('/web/reports', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, ReportController.store);
  fastify.get('/web/reports/:id/download', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, ReportController.download);
  fastify.delete('/web/reports/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, ReportController.destroy);
};
