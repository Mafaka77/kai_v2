const AuthController = require('../controllers/AuthController');

module.exports = async function (fastify, opts) {
  fastify.post('/web/auth/login', AuthController.login);
  fastify.post('/web/auth/send-otp', AuthController.sendOtp);
  fastify.post('/web/auth/verify-otp', AuthController.verifyOtp);
  fastify.post('/web/auth/reset-password', AuthController.resetPassword);
  fastify.get('/web/auth/me', { preValidation: [fastify.authenticate] }, AuthController.me);
};
