const { User, Office, Device, Role, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = {
  index: async (request, reply) => {
    try {
      const { status = 'active', office_id, search, page = 1, limit = 15 } = request.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, parseInt(limit));
      const offset = (pageNum - 1) * limitNum;

      const loggedInUser = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });

      const userOffices = loggedInUser ? loggedInUser.Offices : [];
      const managedOfficeIds = userOffices.map(o => o.id);
      const targetOfficeIds = office_id ? [parseInt(office_id)] : managedOfficeIds;

      let userWhere = {};
      if (search) {
        userWhere[Op.or] = [
          { full_name: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status === 'inactive') {
        userWhere.deleted_at = { [Op.not]: null };
      }

      const { count, rows } = await User.findAndCountAll({
        paranoid: status !== 'inactive',
        where: userWhere,
        include: [
          {
            model: Office,
            as: 'Offices',
            required: true,
            where: { id: targetOfficeIds }
          },
          {
            model: Role,
            as: 'Roles',
            through: { attributes: [] }
          }
        ],
        order: [['id', 'DESC']],
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
        },
        offices: userOffices,
        selectedOffice: office_id || (userOffices[0] ? userOffices[0].id : null)
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  show: async (request, reply) => {
    try {
      const { id } = request.params;
      const user = await User.findByPk(id, {
        paranoid: false,
        include: [
          { model: Office, as: 'Offices' },
          { model: Device },
          { model: Role, as: 'Roles', through: { attributes: [] } }
        ]
      });

      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User account not found' });
      }

      return { status: 'success', data: user };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  update: async (request, reply) => {
    try {
      const { id } = request.params;
      const { full_name, mobile, designation, employee_no, password, role, office_ids } = request.body;

      const user = await User.findByPk(id, { paranoid: false });
      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User not found' });
      }

      if (mobile && mobile !== user.mobile) {
        const existing = await User.findOne({ where: { mobile } });
        if (existing) {
          return reply.code(409).send({ status: 'error', message: 'Mobile number already in use by another user' });
        }
      }

      let updateData = {
        full_name: full_name || user.full_name,
        mobile: mobile || user.mobile,
        designation: designation !== undefined ? designation : user.designation,
        employee_no: employee_no !== undefined ? employee_no : user.employee_no
      };

      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password, 10);
      }

      await user.update(updateData);

      if (office_ids && Array.isArray(office_ids)) {
        await user.setOffices(office_ids);
      }

      if (role) {
        const targetRole = await Role.findOne({ where: { name: role } });
        if (targetRole) {
          await user.setRoles([targetRole]);
        }
      }

      const updatedUser = await User.findByPk(id, {
        include: [
          { model: Office, as: 'Offices' },
          { model: Device },
          { model: Role, as: 'Roles', through: { attributes: [] } }
        ]
      });

      return { status: 'success', message: 'Account updated successfully', data: updatedUser };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  deactivate: async (request, reply) => {
    try {
      const { id } = request.params;
      const user = await User.findByPk(id);
      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User not found' });
      }

      await user.destroy(); // Soft delete
      return { status: 'success', message: 'User account deactivated successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  activate: async (request, reply) => {
    try {
      const { id } = request.params;
      const user = await User.findByPk(id, { paranoid: false });
      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User not found' });
      }

      await user.restore(); // Restore soft deleted record
      return { status: 'success', message: 'User account activated successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  destroy: async (request, reply) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = request.params;
      const user = await User.findByPk(id, { paranoid: false });
      if (!user) {
        return reply.code(404).send({ status: 'error', message: 'User not found' });
      }

      await Device.destroy({ where: { user_id: id }, transaction });
      await user.destroy({ force: true, transaction });

      await transaction.commit();
      return { status: 'success', message: 'Account and associated devices permanently deleted' };
    } catch (error) {
      await transaction.rollback();
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  toggleDevice: async (request, reply) => {
    try {
      const { deviceId } = request.params;
      const device = await Device.findByPk(deviceId);
      if (!device) {
        return reply.code(404).send({ status: 'error', message: 'Device not found' });
      }

      await device.update({ active: !device.active });
      return { status: 'success', message: `Device ${device.active ? 'activated' : 'deactivated'} successfully`, data: device };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  deleteDevice: async (request, reply) => {
    try {
      const { deviceId } = request.params;
      const device = await Device.findByPk(deviceId);
      if (!device) {
        return reply.code(404).send({ status: 'error', message: 'Device not found' });
      }

      await device.destroy();
      return { status: 'success', message: 'Device unlinked successfully' };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  approveDevice: async (request, reply) => {
    try {
      const { deviceId } = request.params;
      const device = await Device.findByPk(deviceId);
      if (!device) {
        return reply.code(404).send({ status: 'error', message: 'Device not found' });
      }

      await device.update({ active: true, status: 'Approved' });
      return { status: 'success', message: 'Device request approved successfully', data: device };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  },

  rejectDevice: async (request, reply) => {
    try {
      const { deviceId } = request.params;
      const device = await Device.findByPk(deviceId);
      if (!device) {
        return reply.code(404).send({ status: 'error', message: 'Device not found' });
      }

      await device.update({ active: false, status: 'Rejected' });
      return { status: 'success', message: 'Device request rejected', data: device };
    } catch (error) {
      return reply.code(400).send({ status: 'error', message: error.message });
    }
  }
};
