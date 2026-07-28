const { PostingRequest, Office, User, UserOffice, sequelize } = require('../models');
const { Op } = require('sequelize');

const STATUSES = { SUBMITTED: 'Submitted', APPROVED: 'Approved', REJECTED: 'Rejected' };

module.exports = {
  // GET /api/posting-requests — Manager/Admin sees requests for their offices
  index: async (request, reply) => {
    try {
      const { status, page = 1, limit = 15 } = request.query;
      const pageNum   = Math.max(1, parseInt(page));
      const limitNum  = Math.max(1, parseInt(limit));
      const offset    = (pageNum - 1) * limitNum;

      const where = {};
      if (status) where.status = status;

      const isAdmin = request.user.role === 'Admin';
      if (!isAdmin) {
        // Scope to the manager's assigned offices
        const loggedInUser = await User.findByPk(request.user.id, {
          include: [{ model: Office, as: 'Offices' }]
        });
        const managedOfficeIds = (loggedInUser?.Offices || []).map(o => o.id);
        where.office_id = { [Op.in]: managedOfficeIds };
      }

      const { count, rows } = await PostingRequest.findAndCountAll({
        where,
        include: [
          { 
            model: User,   
            as: 'User',   
            attributes: ['id', 'full_name', 'mobile', 'employee_no', 'designation'],
            include: [
              { model: Office, as: 'Offices', attributes: ['id', 'name'] }
            ]
          },
          { model: Office, as: 'Office', attributes: ['id', 'name'] }
        ],
        order: [['id', 'DESC']],
        limit: limitNum,
        offset,
        distinct: true
      });

      const totalPages = Math.ceil(count / limitNum);

      return {
        status: 'success',
        data: rows,
        pagination: {
          total: count, page: pageNum, limit: limitNum,
          totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // POST /api/posting-requests — User submits a change-office request
  store: async (request, reply) => {
    try {
      const { office_id, remark } = request.body;
      if (!office_id) {
        return reply.code(400).send({ status: 'error', message: 'Target office is required' });
      }

      const office = await Office.findByPk(office_id);
      if (!office) {
        return reply.code(404).send({ status: 'error', message: 'Office not found' });
      }

      // Prevent duplicate pending requests for the same office
      const duplicate = await PostingRequest.findOne({
        where: { user_id: request.user.id, office_id, status: STATUSES.SUBMITTED }
      });
      if (duplicate) {
        return reply.code(409).send({ status: 'error', message: 'You already have a pending request for this office' });
      }

      const posting = await PostingRequest.create({
        user_id:   request.user.id,
        office_id,
        status:    STATUSES.SUBMITTED,
        remark:    remark || null
      });

      return { status: 'success', message: 'Office change request submitted successfully', data: posting };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // PUT /api/posting-requests/:id/approve
  approve: async (request, reply) => {
    const t = await sequelize.transaction();
    try {
      const { id } = request.params;
      const posting = await PostingRequest.findByPk(id, { transaction: t });
      if (!posting) {
        await t.rollback();
        return reply.code(404).send({ status: 'error', message: 'Posting request not found' });
      }
      if (posting.status !== STATUSES.SUBMITTED) {
        await t.rollback();
        return reply.code(400).send({ status: 'error', message: `Request is already ${posting.status}` });
      }

      // Remove all previous office assignments for this user
      await UserOffice.destroy({ where: { user_id: posting.user_id }, transaction: t });

      // Assign the new office
      await UserOffice.create({
        user_id:   posting.user_id,
        office_id: posting.office_id
      }, { transaction: t });

      // Update status
      await posting.update({ status: STATUSES.APPROVED }, { transaction: t });

      await t.commit();
      return { status: 'success', message: 'Posting request approved. User reassigned to new office.' };
    } catch (error) {
      await t.rollback();
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // PUT /api/posting-requests/:id/reject
  reject: async (request, reply) => {
    const t = await sequelize.transaction();
    try {
      const { id } = request.params;
      const { remark } = request.body || {};
      const posting = await PostingRequest.findByPk(id, { transaction: t });
      if (!posting) {
        await t.rollback();
        return reply.code(404).send({ status: 'error', message: 'Posting request not found' });
      }
      if (posting.status !== STATUSES.SUBMITTED) {
        await t.rollback();
        return reply.code(400).send({ status: 'error', message: `Request is already ${posting.status}` });
      }

      await posting.update({ status: STATUSES.REJECTED, remark: remark || posting.remark }, { transaction: t });

      await t.commit();
      return { status: 'success', message: 'Posting request rejected.' };
    } catch (error) {
      await t.rollback();
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // GET /api/my-posting-requests — regular user fetches their own submitted requests
  myRequests: async (request, reply) => {
    try {
      const { page = 1, limit = 15 } = request.query || {};
      const pageNum  = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset   = (pageNum - 1) * limitNum;

      const { count, rows } = await PostingRequest.findAndCountAll({
        where: { user_id: request.user.id },
        include: [
          { model: Office, as: 'Office', attributes: ['id', 'name'] }
        ],
        order: [['id', 'DESC']],
        limit: limitNum,
        offset,
        distinct: true
      });

      const totalPages = Math.ceil(count / limitNum);

      return {
        status: 'success',
        data: rows,
        pagination: {
          total: count, page: pageNum, limit: limitNum,
          totalPages, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};

