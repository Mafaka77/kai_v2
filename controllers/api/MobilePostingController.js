/**
 * Mobile Posting Controller
 * GET  /api/posting/index  — Returns all posting requests for the authenticated user
 * POST /api/posting/submit — Submits a change-office request
 */
const { PostingRequest, Office } = require('../../models');
const ApiResponseType = require('../../constants/ApiResponseType');

module.exports = {
  /**
   * GET /api/posting/index  [auth required]
   * Returns all posting/change-office requests made by this user with linked office
   */
  index: async (request, reply) => {
    try {
      const postings = await PostingRequest.findAll({
        where: { user_id: request.user.id },
        include: [{ model: Office, as: 'Office', attributes: ['id', 'name'] }],
        order:   [['created_at', 'DESC']]
      });

      return reply.send({ postings });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  /**
   * POST /api/posting/submit  [auth required]
   * Submits a change-office request
   * Body: { office_id }
   */
  submit: async (request, reply) => {
    try {
      const body  = request.body || {};
      const query = request.query || {};
      const office_id = body.office_id || query.office_id;

      if (!office_id) {
        return reply.send({
          status: ApiResponseType.VALIDATION_ERROR,
          errors: { office_id: ['The office_id field is required.'] }
        });
      }

      // Prevent resubmission if user already has a pending/submitted request
      const duplicate = await PostingRequest.findOne({
        where: {
          user_id: request.user.id,
          status:  'Submitted'
        }
      });

      if (duplicate) {
        return reply.send({
          status:  ApiResponseType.ALREADY_EXISTS,
          message: 'Change Office request already applied'
        });
      }

      await PostingRequest.create({
        office_id,
        user_id: request.user.id,
        status:  'Submitted'
      });

      return reply.send({
        status:  ApiResponseType.SUCCESS,
        message: 'Change Office request submitted'
      });
    } catch (error) {
      return reply.code(500).send({ status: 500, message: error.message });
    }
  }
};
