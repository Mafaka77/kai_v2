const PostingRequestController = require('../controllers/PostingRequestController');

module.exports = async function (fastify, opts) {
  // Manager/Admin — list requests scoped to their offices
  fastify.get('/web/posting-requests',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    PostingRequestController.index
  );

  // Any authenticated user — fetch their own change-office requests
  fastify.get('/web/my-posting-requests',
    { preValidation: [fastify.authenticate] },
    PostingRequestController.myRequests
  );

  // Any authenticated user — submit a change-office request
  fastify.post('/web/posting-requests',
    { preValidation: [fastify.authenticate] },
    PostingRequestController.store
  );

  // Manager/Admin — approve a pending request
  fastify.put('/web/posting-requests/:id/approve',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    PostingRequestController.approve
  );

  // Manager/Admin — reject a pending request
  fastify.put('/web/posting-requests/:id/reject',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    PostingRequestController.reject
  );
};
