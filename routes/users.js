const UserController = require('../controllers/UserController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/users', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, UserController.index);
  fastify.post('/web/users', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, UserController.store);
  fastify.put('/web/users/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, UserController.update);
  fastify.put('/web/users/:id/restore', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, UserController.restore);
  fastify.delete('/web/users/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin'])] }, UserController.destroy);
}
