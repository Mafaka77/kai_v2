const { User, Office, District, Role } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  index: async (request, reply) => {
    try {
      const { search, status = 'active', page = 1, limit = 15 } = request.query;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;
      
      let where = {};
      
      if (search) {
        where[Op.or] = [
          { full_name: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } }
        ];
      }
      
      if (status === 'inactive') {
        where.deleted_at = { [Op.not]: null };
      }
      
      const { count, rows } = await User.findAndCountAll({
        where,
        paranoid: status !== 'inactive',
        attributes: { exclude: ['password', 'remember_token'] },
        include: [
          { model: Office, as: 'Offices' },
          { model: Role, as: 'Roles', through: { attributes: [] } }
        ],
        limit: limitNum,
        offset: offset,
        distinct: true,
        order: [['id', 'ASC']]
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
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  store: async (request, reply) => {
    try {
      const { full_name, mobile, designation, role, password, office_ids } = request.body;
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await User.create({
        full_name,
        mobile,
        designation,
        password: hashedPassword
      });
      
      if (office_ids && Array.isArray(office_ids)) {
        await user.setOffices(office_ids);
      }
      
      if (role) {
        if (role === 'Admin' || role === 'Manager') {
          const roleObj = await Role.findOne({ where: { name: role } });
          if (roleObj) {
            await user.setRoles([roleObj]);
          }
        } else {
          await user.setRoles([]);
        }
      }
      
      return { status: 'success', data: user, message: 'User created successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  update: async (request, reply) => {
    try {
      const { id } = request.params;
      const { full_name, mobile, designation, role, password, office_ids } = request.body;
      const user = await User.findByPk(id, { paranoid: false });
      
      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User not found' });
      }
      
      const updateData = { full_name, mobile, designation };
      if (password) {
        const bcrypt = require('bcryptjs');
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      await user.update(updateData);
      
      if (office_ids && Array.isArray(office_ids)) {
        await user.setOffices(office_ids);
      }
      
      if (role) {
        if (role === 'Admin' || role === 'Manager') {
          const roleObj = await Role.findOne({ where: { name: role } });
          if (roleObj) {
            await user.setRoles([roleObj]);
          }
        } else {
          await user.setRoles([]);
        }
      }
      return { status: 'success', data: user, message: 'User updated successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  destroy: async (request, reply) => {
    try {
      const { id } = request.params;
      const user = await User.findByPk(id);
      
      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User not found' });
      }
      
      await user.destroy();
      return { status: 'success', message: 'User disabled successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  restore: async (request, reply) => {
    try {
      const { id } = request.params;
      const user = await User.findByPk(id, { paranoid: false });
      
      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User not found' });
      }
      
      await user.restore();
      return { status: 'success', message: 'User activated successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  }
};
