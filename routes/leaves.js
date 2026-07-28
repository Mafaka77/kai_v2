const LeaveController = require('../controllers/LeaveController');

module.exports = async function (fastify, opts) {
  // External POST to store leave
  fastify.post('/web/leaves', LeaveController.store);

  // Managers/Admins — list users on leave today
  fastify.get('/web/leaves',
    { preValidation: [fastify.authenticate, fastify.authorize(['Admin', 'Manager'])] },
    LeaveController.index
  );
};
