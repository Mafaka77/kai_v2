const { Office, District } = require('../models');

module.exports = {
  index: async (request, reply) => {
    try {
      const { search, page, limit = 10 } = request.query;
      let where = {};
      
      if (search) {
        const { Op } = require('sequelize');
        where.name = { [Op.like]: `%${search}%` };
      }

      if (page) {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const offset = (pageNum - 1) * limitNum;

        const { count, rows } = await Office.findAndCountAll({
          where,
          include: [{ model: District }],
          order: [['name', 'ASC']],
          limit: limitNum,
          offset: offset,
          distinct: true
        });

        const totalPages = Math.ceil(count / limitNum);

        return {
          status: 'success',
          data: rows,
          pagination: {
            total: count,
            page: pageNum,
            limit: limitNum,
            totalPages: totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        };
      }
      
      const offices = await Office.findAll({
        where,
        include: [{ model: District }],
        order: [['name', 'ASC']]
      });
      return { status: 'success', data: offices };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },
  
  store: async (request, reply) => {
    try {
      const { name, district_id, lat, lng, radius, grace_period, start_time, close_time } = request.body;
      const office = await Office.create({
        name, district_id, lat, lng, radius, grace_period, start_time, close_time
      });
      return { status: 'success', data: office, message: 'Office created successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },
  
  update: async (request, reply) => {
    try {
      const { id } = request.params;
      const office = await Office.findByPk(id);
      
      if (!office) {
        return reply.code(404).send({ status: 'error', message: 'Office not found' });
      }
      
      await office.update(request.body);
      return { status: 'success', data: office, message: 'Office updated successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },
  
  destroy: async (request, reply) => {
    try {
      const { id } = request.params;
      const office = await Office.findByPk(id);
      
      if (!office) {
        return reply.code(404).send({ status: 'error', message: 'Office not found' });
      }
      
      await office.destroy();
      return { status: 'success', message: 'Office deleted successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  }
};
