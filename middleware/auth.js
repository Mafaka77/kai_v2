const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  // Authentication check (JWT verify)
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ status: 'error', message: 'Unauthorized: Invalid or missing token' })
    }
  })

  // Role-based Authorization check
  fastify.decorate('authorize', function (allowedRoles) {
    return async function (request, reply) {
      if (!request.user) {
        return reply.code(401).send({ status: 'error', message: 'Unauthorized' })
      }
      
      const userRole = request.user.role || 'User'
      if (!allowedRoles.includes(userRole)) {
        return reply.code(403).send({ status: 'error', message: 'Forbidden: Insufficient permissions' })
      }
    }
  })
})
