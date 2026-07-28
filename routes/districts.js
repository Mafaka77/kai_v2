const DistrictController = require('../controllers/DistrictController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/districts', { preValidation: [fastify.authenticate] }, DistrictController.index);
  fastify.post('/web/districts', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, DistrictController.store);
  fastify.put('/web/districts/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] }, DistrictController.update);
  fastify.delete('/web/districts/:id', { preValidation: [fastify.authenticate, fastify.authorize(['Admin'])] }, DistrictController.destroy);
}
