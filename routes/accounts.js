const AccountController = require('../controllers/AccountController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/accounts', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AccountController.index);
  fastify.get('/web/accounts/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AccountController.show);
  fastify.put('/web/accounts/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AccountController.update);
  fastify.put('/web/accounts/:id/activate', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AccountController.activate);
  fastify.put('/web/accounts/:id/deactivate', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AccountController.deactivate);
  fastify.delete('/web/accounts/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin'])] }, AccountController.destroy);

  // Device endpoints
  fastify.put('/web/accounts/devices/:deviceId/toggle', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AccountController.toggleDevice);
  fastify.put('/web/accounts/devices/:deviceId/approve', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AccountController.approveDevice);
  fastify.put('/web/accounts/devices/:deviceId/reject', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AccountController.rejectDevice);
  fastify.delete('/web/accounts/devices/:deviceId', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, AccountController.deleteDevice);
};
