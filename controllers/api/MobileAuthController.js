/**
 * Mobile Auth Controller
 * Handles registration, login, logout, OTP — preserving exact route structure from api.php
 */
const { User, Device, Office, Otp } = require('../../models');
const bcrypt = require('bcryptjs');
const smsService = require('../../services/smsService');
const ApiResponseType = require('../../constants/ApiResponseType');

module.exports = {
  /**
   * GET /api/registration/create
   * Returns list of offices for registration form
   */
  create: async (request, reply) => {
    try {
      const offices = await Office.findAll({ attributes: ['id', 'name'] });
      return reply.send({ offices });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  /**
   * POST /api/registration
   * Register a new mobile user (requires admin approval — deleted_at set)
   */
  register: async (request, reply) => {
    try {
      const body = request.body || {};
      const query = request.query || {};
      const full_name   = body.full_name   || query.full_name;
      const mobile      = body.mobile      || query.mobile;
      const password    = body.password    || query.password;
      const office_id   = body.office_id   || query.office_id;
      const uid         = body.uid         || query.uid;
      const device_name = body.device_name || query.device_name;
      const designation = body.designation || query.designation;

      // Validate required fields
      const errors = {};
      if (!full_name)   errors.full_name   = ['The full_name field is required.'];
      if (!mobile)      errors.mobile      = ['The mobile field is required.'];
      if (!password)    errors.password    = ['The password field is required.'];
      if (!office_id)   errors.office_id   = ['The office_id field is required.'];
      if (!uid)         errors.uid         = ['The uid field is required.'];
      if (!device_name) errors.device_name = ['The device_name field is required.'];

      if (Object.keys(errors).length > 0) {
        return reply.send({ status: ApiResponseType.VALIDATION_ERROR, errors });
      }

      // Check duplicate mobile
      const existingUser = await User.findOne({ where: { mobile } });
      if (existingUser) {
        return reply.send({
          status: ApiResponseType.VALIDATION_ERROR,
          errors: { mobile: ['The mobile number has already been taken.'] }
        });
      }

      // Check office exists
      const office = await Office.findByPk(office_id);
      if (!office) {
        return reply.send({
          status: ApiResponseType.VALIDATION_ERROR,
          errors: { office_id: ['The selected office is invalid.'] }
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (soft-deleted for approval — same pattern as legacy)
      const user = await User.create({
        full_name,
        mobile,
        password: hashedPassword,
        designation: designation || null,
        deleted_at: new Date() // Needs admin approval — same as legacy laravel $user->delete()
      });

      // Assign office via UserOffice pivot
      const { UserOffice } = require('../../models');
      await UserOffice.create({ user_id: user.id, office_id });

      // Register device (pending approval)
      await Device.create({
        name: device_name,
        uid,
        active: false,
        user_id: user.id,
        status: 'Pending'
      });

      return reply.send({
        status: ApiResponseType.APPROVAL_NEEDED,
        data: user,
        message: 'Hello user, your account needs approval'
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  /**
   * POST /api/registration/login
   * Mobile login — returns Sanctum-style bearer token via JWT
   */
  login: async (request, reply) => {
    try {
      const body = request.body || {};
      const query = request.query || {};
      const mobile = body.mobile || query.mobile;
      const password = body.password || query.password;

      if (!mobile || !password) {
        const errors = {};
        if (!mobile)   errors.mobile   = ['The mobile field is required.'];
        if (!password) errors.password = ['The password field is required.'];
        return reply.send({ status: ApiResponseType.VALIDATION_ERROR, errors });
      }

      const user = await User.findOne({
        where: { mobile },
        paranoid: false // withTrashed — needed to check approval state
      });

      if (!user) {
        return reply.send({ status: ApiResponseType.MODEL_NOT_FOUND });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.send({ status: ApiResponseType.INVALID_CREDENTIAL });
      }

      // Account is soft-deleted = awaiting approval
      if (user.deleted_at) {
        return reply.send({ status: ApiResponseType.APPROVAL_NEEDED });
      }

      // Create JWT
      const token = request.server.jwt.sign({
        id:        user.id,
        mobile:    user.mobile,
        full_name: user.full_name,
        role:      user.role || 'User'
      });

      return reply.send({
        status: ApiResponseType.SUCCESS,
        token,
        user
      });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  },

  /**
   * DELETE /api/registration/logout  [auth required]
   * Invalidate the current token — for JWT we just instruct the app to discard it.
   */
  logout: async (request, reply) => {
    // JWT is stateless; the mobile app should discard the token.
    return reply.send({ data: true, message: 'Logout success' });
  },

  // ─────────────────────────────────────────────────────────────────────
  // OTP Routes — POST /api/otp/send  &  POST /api/otp/verify
  // ─────────────────────────────────────────────────────────────────────

  /**
   * POST /api/otp/send
   */
  sendOtp: async (request, reply) => {
    try {
      const body = request.body || {};
      const query = request.query || {};
      const mobile = body.mobile || query.mobile;

      if (!mobile) {
        return reply.send({
          status: ApiResponseType.VALIDATION_ERROR,
          errors: { mobile: ['The mobile field is required.'] }
        });
      }

      const exists = await User.findOne({ where: { mobile } });
      if (!exists) {
        return reply.send({
          status: ApiResponseType.MODEL_NOT_FOUND,
          message: 'Your mobile no is not yet registered'
        });
      }

      // Generate 4-digit OTP (1111 in debug mode to match legacy)
      const key = process.env.APP_DEBUG === 'true' ? '1111' : String(Math.floor(1000 + Math.random() * 9000));

      // Invalidate old OTPs
      await Otp.update({ used: true }, { where: { recipient: mobile, used: false } });

      const otp = await Otp.create({ recipient: mobile, otp: key, used: false });

      // Send SMS
      await smsService.sendOtp(mobile, key);

      return reply.send({
        status: ApiResponseType.SUCCESS,
        data: otp,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  /**
   * POST /api/otp/verify
   * Verifies OTP and returns a token (same as legacy — token returned on successful OTP verify)
   */
  verifyOtp: async (request, reply) => {
    try {
      const body = request.body || {};
      const query = request.query || {};
      const mobile = body.mobile || query.mobile;
      const otp = body.otp || query.otp;

      if (!mobile || !otp) {
        return reply.send({
          status: ApiResponseType.VALIDATION_ERROR,
          errors: { mobile: ['Mobile and OTP are required.'] }
        });
      }

      const otpRecord = await Otp.findOne({
        where: { recipient: mobile, otp: String(otp), used: false },
        order: [['id', 'DESC']]
      });

      if (!otpRecord) {
        return reply.send({ status: ApiResponseType.MODEL_NOT_FOUND, message: 'Invalid OTP' });
      }

      const user = await User.findOne({ where: { mobile } });

      // Issue token
      const token = request.server.jwt.sign({
        id:        user.id,
        mobile:    user.mobile,
        full_name: user.full_name,
        role:      user.role || 'User'
      });

      // Mark OTP used
      await otpRecord.update({ used: true });

      return reply.send({
        status: ApiResponseType.SUCCESS,
        token,
        user
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
