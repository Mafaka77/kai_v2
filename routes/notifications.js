const NotificationController = require('../controllers/NotificationController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/notifications', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, NotificationController.index);
  fastify.post('/web/notifications', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, NotificationController.store);
  fastify.delete('/web/notifications/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, NotificationController.destroy);
};
