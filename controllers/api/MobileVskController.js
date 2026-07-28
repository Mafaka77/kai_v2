/**
 * Mobile VSK (Voter Scrutiny / Biometric Sync) Controller
 * POST /api/vsk — Batch-imports VSK attendance records from the VSK portal
 *
 * Mirrors the legacy VskController@store exactly:
 *   - Accepts an array of { mobile, signin_at } entries
 *   - Looks up each user by mobile and their assigned office
 *   - Parses signin_at to determine 'present' vs 'late' vs 'absent'
 *   - Skips duplicates (same user_id on same date)
 *   - Bulk-inserts in chunks of 1000 inside a transaction
 */
const { User, Office, Vsk, sequelize } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');

module.exports = {
  /**
   * POST /api/vsk  (public — called by external VSK portal, no auth required)
   * Body: { data: [{ mobile: '...', signin_at: '2025-01-01 09:00:00' | 'absent' }, ...] }
   */
  store: async (request, reply) => {
    try {
      const { data } = request.body || {};

      if (!data || !Array.isArray(data) || data.length === 0) {
        return reply.code(400).send({
          status:  'error',
          message: 'data array is required. Each entry must have mobile and signin_at fields.'
        });
      }

      // Validate structure
      const invalid = data.find(e => !e.mobile || e.signin_at === undefined);
      if (invalid) {
        return reply.code(400).send({
          status:  'error',
          message: 'Each entry in data must have mobile and signin_at fields.'
        });
      }

      const recordsToInsert = [];
      const now = new Date();

      for (const entry of data) {
        const { mobile, signin_at: signinAtRaw } = entry;

        // Look up user by mobile
        const user = await User.findOne({ where: { mobile } });
        if (!user) continue;

        // Look up user's assigned office
        const offices = await user.getOffices();
        const office  = offices[0] || null;
        if (!office) continue;

        let signinAt = null;
        let type     = 'absent';

        if (typeof signinAtRaw === 'string' && signinAtRaw.toLowerCase() !== 'absent') {
          try {
            const parsed   = moment(signinAtRaw);
            signinAt        = parsed.isValid() ? parsed.toDate() : null;
            const signinTime = parsed.format('HH:mm');
            // Legacy rule: after 09:30 = late
            type = signinTime > '09:30' ? 'late' : 'present';
          } catch (_) {
            signinAt = null;
            type     = 'absent';
          }
        }

        // Skip duplicate: same user on same date
        if (signinAt) {
          const signinDate = moment(signinAt).format('YYYY-MM-DD');
          const exists = await Vsk.findOne({
            where: {
              user_id:   user.id,
              signin_at: {
                [Op.between]: [
                  moment(signinDate).startOf('day').toDate(),
                  moment(signinDate).endOf('day').toDate()
                ]
              }
            }
          });
          if (exists) continue;
        }

        recordsToInsert.push({
          user_id:    user.id,
          office_id:  office.id,
          signin_at:  signinAt,
          mobile,
          type,
          created_at: now,
          updated_at: now
        });
      }

      // Bulk insert in chunks of 1000 inside a transaction (matching legacy behaviour)
      await sequelize.transaction(async (t) => {
        const chunkSize = 1000;
        for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
          const chunk = recordsToInsert.slice(i, i + chunkSize);
          await Vsk.bulkCreate(chunk, { transaction: t });
        }
      });

      return reply.code(201).send({
        message: 'VSK requests stored successfully',
        count:   recordsToInsert.length
      });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
