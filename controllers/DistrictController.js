const { District } = require('../models');

module.exports = {
  index: async (request, reply) => {
    try {
      const { search } = request.query;
      let where = {};
      if (search) {
        // fastify.sequelize.Op isn't directly available without fastify context, require it locally or via server
        const { Op } = require('sequelize');
        where.name = { [Op.like]: `%${search}%` };
      }
      
      const districts = await District.findAll({ where });
      return { status: 'success', data: districts };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },
  
  store: async (request, reply) => {
    try {
      const { code, name } = request.body;
      const district = await District.create({ code, name });
      return { status: 'success', data: district, message: 'District Created Successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },
  
  update: async (request, reply) => {
    try {
      const { id } = request.params;
      const { code, name } = request.body;
      const district = await District.findByPk(id);
      
      if (!district) {
        return reply.code(404).send({ status: 'error', message: 'District not found' });
      }
      
      await district.update({ code, name });
      return { status: 'success', data: district, message: 'District Updated Successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },
  
  destroy: async (request, reply) => {
    try {
      const { id } = request.params;
      const district = await District.findByPk(id);
      
      if (!district) {
        return reply.code(404).send({ status: 'error', message: 'District not found' });
      }
      
      await district.destroy();
      return { status: 'success', message: 'District Deleted Successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  }
};
