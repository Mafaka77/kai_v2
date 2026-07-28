const OfficeController = require('../controllers/OfficeController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/offices', { preValidation: [fastify.authenticate] }, OfficeController.index);
  fastify.post('/web/offices', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, OfficeController.store);
  fastify.put('/web/offices/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, OfficeController.update);
  fastify.delete('/web/offices/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin'])] }, OfficeController.destroy);
}
