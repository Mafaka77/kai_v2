const AppealController = require('../controllers/AppealController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/appeals', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AppealController.index);
  fastify.get('/web/my-appeals', { preValidation: [fastify.authenticate] }, AppealController.myAppeals);
  fastify.post('/web/appeals', { preValidation: [fastify.authenticate] }, AppealController.store);
  fastify.put('/web/appeals/:id/approve', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AppealController.approve);
  fastify.put('/web/appeals/:id/reject', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AppealController.reject);
};
