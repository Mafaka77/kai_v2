const ConfigController = require('../controllers/ConfigController');

module.exports = async function (fastify, opts) {
  fastify.get('/web/config/offices',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    ConfigController.index
  );

  fastify.get('/web/config/offices/:id',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    ConfigController.show
  );

  fastify.put('/web/config/offices/:id',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    ConfigController.update
  );

  fastify.put('/web/config/global',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    ConfigController.updateGlobal
  );

  fastify.get('/web/config/districts',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    ConfigController.districts
  );

  // Legacy route kept for backwards compatibility
  fastify.get('/web/config/qrcodes',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    ConfigController.index
  );
};
