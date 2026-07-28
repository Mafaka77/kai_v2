const LateListController = require('../controllers/LateListController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/latelist', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, LateListController.index);
  fastify.get('/web/latelist/export', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, LateListController.exportCsv);
};
