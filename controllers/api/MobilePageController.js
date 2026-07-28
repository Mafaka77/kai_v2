/**
 * Mobile Page Controller
 * GET /api/page/privacy — Returns the privacy policy page content
 * GET /api/page/term    — Returns the terms and conditions page content
 */
const { Page } = require('../../models');

module.exports = {
  /**
   * GET /api/page/privacy
   * Returns the Privacy Policy page content from the pages table
   */
  privacy: async (request, reply) => {
    try {
      const page = await Page.findOne({ where: { type: 'privacy' } });
      return reply.send({ data: page });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  /**
   * GET /api/page/term
   * Returns the Terms & Conditions page content from the pages table
   */
  term: async (request, reply) => {
    try {
      const page = await Page.findOne({ where: { type: 'term' } });
      return reply.send({ data: page });
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
