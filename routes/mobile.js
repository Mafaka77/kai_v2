/**
 * Mobile API Routes — mirrors routes/api.php exactly
 * All routes preserve the original path names used by the mobile application.
 *
 * Public  (no auth):
 *   POST /api/otp/send
 *   POST /api/otp/verify
 *   GET  /api/page/privacy
 *   GET  /api/page/term
 *   GET  /api/registration/create
 *   POST /api/registration
 *   POST /api/registration/login
 *
 * Protected (auth:sanctum → JWT Bearer):
 *   DELETE /api/registration/logout
 *   GET    /api/index
 *   POST   /api/fcm/token
 *   POST   /api/office/signin
 *   PUT    /api/office/:model/signout        [throttle-safe, high-frequency endpoint]
 *   POST   /api/device/request
 *   GET    /api/profile
 *   GET    /api/profile/devices
 *   GET    /api/attendance/index
 *   GET    /api/attendance/:model/show
 *   GET    /api/notification/index
 *   GET    /api/notification/:model/show
 *   GET    /api/appeal/index
 *   POST   /api/appeal/appeal_onDuty
 *   POST   /api/appeal/:model/appeal_lateReason
 *   POST   /api/appeal/:model/appeal_leftEarly
 *   GET    /api/posting/index
 *   POST   /api/posting/submit
 */

const MobileAuthController         = require('../controllers/api/MobileAuthController');
const MobileHomeController         = require('../controllers/api/MobileHomeController');
const MobileProfileController      = require('../controllers/api/MobileProfileController');
const MobileDeviceController       = require('../controllers/api/MobileDeviceController');
const MobileAttendanceController   = require('../controllers/api/MobileAttendanceController');
const MobileNotificationController = require('../controllers/api/MobileNotificationController');
const MobileAppealController       = require('../controllers/api/MobileAppealController');
const MobilePostingController      = require('../controllers/api/MobilePostingController');
const MobilePageController         = require('../controllers/api/MobilePageController');
const MobileVskController          = require('../controllers/api/MobileVskController');
const LeaveController              = require('../controllers/LeaveController');

module.exports = async function (fastify, opts) {

  // ─────────────────────────────────────────────────────────────────────
  // PUBLIC ROUTES — No authentication required
  // ─────────────────────────────────────────────────────────────────────

  // OTP: send & verify
  fastify.post('/api/otp/send',   MobileAuthController.sendOtp);
  fastify.post('/api/otp/verify', MobileAuthController.verifyOtp);

  // Static pages
  fastify.get('/api/page/privacy', MobilePageController.privacy);
  fastify.get('/api/page/term',    MobilePageController.term);

  // Registration
  fastify.get('/api/registration/create', MobileAuthController.create);
  fastify.post('/api/registration',       MobileAuthController.register);
  fastify.post('/api/registration/login', MobileAuthController.login);

  // ─── E-Leave Portal (public — called by external e-leave system) ──────────
  // POST /api/leaves           — Store a leave request from the e-leave portal
  // GET  /api/late_list        — Get mobiles of users late 3+ days this week
  // POST /api/store_late_list  — Store late-list mobile entries from e-leave
  fastify.post('/api/leaves',          LeaveController.store);
  fastify.get('/api/late_list',        LeaveController.late_list);
  fastify.post('/api/store_late_list', LeaveController.store_late_list);

  // ─── VSK Portal (public — called by external VSK biometric portal) ─────────
  // POST /api/vsk — Batch import biometric attendance records
  fastify.post('/api/vsk', MobileVskController.store);

  // ─────────────────────────────────────────────────────────────────────
  // PROTECTED ROUTES — Requires valid JWT Bearer token
  // ─────────────────────────────────────────────────────────────────────

  // Logout
  fastify.delete('/api/registration/logout',
    { preValidation: [fastify.authenticate] },
    MobileAuthController.logout
  );

  // Home / Dashboard
  fastify.get('/api/index',
    { preValidation: [fastify.authenticate] },
    MobileHomeController.index
  );

  // FCM Push Token
  fastify.post('/api/fcm/token',
    { preValidation: [fastify.authenticate] },
    MobileHomeController.updateToken
  );

  // Office Sign-in / Sign-out
  fastify.post('/api/office/signin',
    { preValidation: [fastify.authenticate] },
    MobileAttendanceController.signin
  );

  // Sign-out — high-frequency (equivalent to throttle:3000,1 in Laravel)
  fastify.put('/api/office/:model/signout',
    { preValidation: [fastify.authenticate] },
    MobileAttendanceController.signout
  );

  // Device registration request
  fastify.post('/api/device/request',
    { preValidation: [fastify.authenticate] },
    MobileDeviceController.registerNewDevice
  );

  // Profile
  fastify.get('/api/profile',
    { preValidation: [fastify.authenticate] },
    MobileProfileController.index
  );
  fastify.get('/api/profile/devices',
    { preValidation: [fastify.authenticate] },
    MobileProfileController.devices
  );

  // Attendance history
  fastify.get('/api/attendance/index',
    { preValidation: [fastify.authenticate] },
    MobileAttendanceController.index
  );
  fastify.get('/api/attendance/:model/show',
    { preValidation: [fastify.authenticate] },
    MobileAttendanceController.show
  );

  // Notifications
  fastify.get('/api/notification/index',
    { preValidation: [fastify.authenticate] },
    MobileNotificationController.index
  );
  fastify.get('/api/notification/:model/show',
    { preValidation: [fastify.authenticate] },
    MobileNotificationController.show
  );

  // Appeals
  fastify.get('/api/appeal/index',
    { preValidation: [fastify.authenticate] },
    MobileAppealController.index
  );
  fastify.post('/api/appeal/index',
    { preValidation: [fastify.authenticate] },
    MobileAppealController.index
  );
  fastify.post('/api/appeal/appeal_onDuty',
    { preValidation: [fastify.authenticate] },
    MobileAppealController.appeal_onDuty
  );
  fastify.post('/api/appeal/:model/appeal_lateReason',
    { preValidation: [fastify.authenticate] },
    MobileAppealController.appeal_lateReason
  );
  fastify.post('/api/appeal/:model/appeal_leftEarly',
    { preValidation: [fastify.authenticate] },
    MobileAppealController.appeal_leftEarly
  );

  // Posting (change-office requests)
  fastify.get('/api/posting/index',
    { preValidation: [fastify.authenticate] },
    MobilePostingController.index
  );
  fastify.post('/api/posting/submit',
    { preValidation: [fastify.authenticate] },
    MobilePostingController.submit
  );
};
