const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const jwt = require('@fastify/jwt');
const path = require('path');
const fs = require('fs');
const fastifyStatic = require('@fastify/static');
const { sequelize, User, Office, District, Attendance } = require('./models');
require('./queues/notificationQueue');

fastify.register(cors, { 
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Ensure uploads folder exists & register static file serving
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

fastify.register(fastifyStatic, {
  root: uploadsDir,
  prefix: '/uploads/'
});

// JWT Setup
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret_hr_app_key'
});

// Register Auth & Authorize middleware
fastify.register(require('./middleware/auth'));

// fastify.get('/', async (request, reply) => {
//   return { status: 'success', message: 'Fastify API is running' }
// });

fastify.register(require('./routes/auth'));
fastify.register(require('./routes/districts'));
fastify.register(require('./routes/offices'));
fastify.register(require('./routes/users'));
fastify.register(require('./routes/attendances'));
fastify.register(require('./routes/config'));
fastify.register(require('./routes/dashboard'));
fastify.register(require('./routes/appeals'));
fastify.register(require('./routes/latelist'));
fastify.register(require('./routes/accounts'));
fastify.register(require('./routes/reports'));
fastify.register(require('./routes/postingRequests'));
fastify.register(require('./routes/leaves'));
fastify.register(require('./routes/notifications'));

// ─── Mobile API Routes (/api/*) ─────────────────────────────────────────────
// Mirrors routes/api.php from the legacy Laravel app.
// Route names are preserved exactly as used by the mobile application.
fastify.register(require('./routes/mobile'));

// ─── SPA Fallback for Production Frontend Build ─────────────────────────────
const frontendDist = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'frontend/dist');

if (fs.existsSync(frontendDist)) {
  fastify.register(fastifyStatic, {
    root: frontendDist,
    prefix: '/',
    decorateReply: false
  });

  fastify.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
      reply.code(404).send({ status: 'error', message: 'API Route Not Found' });
      return;
    }
    const stream = fs.createReadStream(path.join(frontendDist, 'index.html'));
    reply.type('text/html').send(stream);
  });
}

fastify.get('/test-db', async (request, reply) => {
  try {
    const userCount = await User.count();
    const officeCount = await Office.count();
    return { status: 'success', data: { userCount, officeCount } }
  } catch (error) {
    return { status: 'error', error: error.message }
  }
});

const start = async () => {
  try { 
    await sequelize.authenticate();
    fastify.log.info('Database connection has been established successfully.');
    
    const port = process.env.PORT || 5001;
    await fastify.listen({ port: parseInt(port), host: '0.0.0.0' });
    fastify.log.info(`Server is running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start();
