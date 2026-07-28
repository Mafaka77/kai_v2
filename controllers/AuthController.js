const { User, Role, Otp } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const smsService = require('../services/smsService');

module.exports = {
  login: async (request, reply) => {
    try {
      const { mobile, password } = request.body;
      const user = await User.findOne({ 
        where: { mobile },
        include: [{ model: Role, as: 'Roles' }]
      });
      if (!user) {
        return reply.code(401).send({ status: 'error', message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.code(401).send({ status: 'error', message: 'Invalid credentials' });
      }

      const token = request.server.jwt.sign({ 
        id: user.id, 
        mobile: user.mobile, 
        full_name: user.full_name,
        role: user.role
      });
      
      return { 
        status: 'success', 
        data: { 
          user: { 
            id: user.id, 
            full_name: user.full_name, 
            mobile: user.mobile,
            role: user.role
          },
          token 
        },
        message: 'Login successful' 
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  sendOtp: async (request, reply) => {
    try {
      const { mobile } = request.body;
      if (!mobile) {
        return reply.code(400).send({ status: 'error', message: 'Mobile number is required' });
      }

      const user = await User.findOne({ where: { mobile } });
      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'Mobile number is not registered in system' });
      }

      // Generate 4-digit numeric OTP
      const otpCode = process.env.NODE_ENV === 'development'
        ? (Math.floor(1000 + Math.random() * 9000)).toString()
        : (Math.floor(1000 + Math.random() * 9000)).toString();

      // Invalidate existing unused OTPs for this recipient
      await Otp.update(
        { used: true },
        { where: { recipient: mobile, used: false } }
      );

      // Create new OTP record
      await Otp.create({
        recipient: mobile,
        otp: otpCode,
        used: false
      });

      // Send SMS
      await smsService.sendOtp(mobile, otpCode);

      return {
        status: 'success',
        message: 'OTP sent successfully to your mobile number'
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  verifyOtp: async (request, reply) => {
    try {
      const { mobile, otp } = request.body;
      if (!mobile || !otp) {
        return reply.code(400).send({ status: 'error', message: 'Mobile number and OTP are required' });
      }

      const otpRecord = await Otp.findOne({
        where: {
          recipient: mobile,
          otp: otp.toString(),
          used: false
        },
        order: [['id', 'DESC']]
      });

      if (!otpRecord) {
        return reply.code(400).send({ status: 'error', message: 'Invalid or expired OTP' });
      }

      return {
        status: 'success',
        message: 'OTP verified successfully'
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  resetPassword: async (request, reply) => {
    try {
      const { mobile, otp, newPassword } = request.body;
      if (!mobile || !otp || !newPassword) {
        return reply.code(400).send({ status: 'error', message: 'Mobile, OTP, and new password are required' });
      }

      if (newPassword.length < 4) {
        return reply.code(400).send({ status: 'error', message: 'Password must be at least 4 characters' });
      }

      const user = await User.findOne({ where: { mobile } });
      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User not found' });
      }

      const otpRecord = await Otp.findOne({
        where: {
          recipient: mobile,
          otp: otp.toString(),
          used: false
        },
        order: [['id', 'DESC']]
      });

      if (!otpRecord) {
        return reply.code(400).send({ status: 'error', message: 'Invalid or expired OTP session' });
      }

      // Hash new password and update user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });

      // Mark OTP as used
      await otpRecord.update({ used: true });

      return {
        status: 'success',
        message: 'Password reset successfully. You can now login with your new password.'
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  me: async (request, reply) => {
    return { status: 'success', data: request.user };
  }
};
