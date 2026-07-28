const { QrCode, Office, District, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // GET /api/config/offices — List manager's offices with QR code and district
  index: async (request, reply) => {
    try {
      const { User } = require('../models');
      const loggedInUser = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices', include: [{ model: District }, { model: QrCode }] }]
      });

      const offices = loggedInUser ? loggedInUser.Offices : [];
      return { status: 'success', data: offices };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // GET /api/config/offices/:id — Get a single office with QR and district
  show: async (request, reply) => {
    try {
      const { id } = request.params;
      const office = await Office.findByPk(id, {
        include: [{ model: District }, { model: QrCode }]
      });

      if (!office) {
        return reply.code(404).send({ status: 'error', message: 'Office not found' });
      }

      const districts = await District.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });

      return { status: 'success', data: office, districts };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // PUT /api/config/offices/:id — Update office config + QR code
  update: async (request, reply) => {
    const t = await sequelize.transaction();
    try {
      const { id } = request.params;
      const {
        name, district_id, lat, lng,
        radius, grace_period, start_time, close_time,
        qr_code // the QR code string
      } = request.body;

      // Verify office belongs to the manager
      const { User } = require('../models');
      const loggedInUser = await User.findByPk(request.user.id, {
        include: [{ model: Office, as: 'Offices' }]
      });
      const managed = (loggedInUser?.Offices || []).map(o => o.id);
      if (!managed.includes(parseInt(id))) {
        await t.rollback();
        return reply.code(403).send({ status: 'error', message: 'You do not have access to this office' });
      }

      const office = await Office.findByPk(id, { transaction: t });
      if (!office) {
        await t.rollback();
        return reply.code(404).send({ status: 'error', message: 'Office not found' });
      }

      // Check name uniqueness (excluding self)
      if (name && name !== office.name) {
        const exists = await Office.findOne({ where: { name, id: { [Op.ne]: id } }, transaction: t });
        if (exists) {
          await t.rollback();
          return reply.code(409).send({ status: 'error', message: 'An office with this name already exists' });
        }
      }

      // Update Office
      await office.update({
        name:         name         || office.name,
        district_id:  district_id  || office.district_id,
        lat:          lat          !== undefined ? lat : office.lat,
        lng:          lng          !== undefined ? lng : office.lng,
        radius:       radius       !== undefined ? radius : office.radius,
        grace_period: grace_period !== undefined ? grace_period : office.grace_period,
        start_time:   start_time   || office.start_time,
        close_time:   close_time   || office.close_time,
      }, { transaction: t });

      // Update QR Code
      if (qr_code) {
        const qr = await QrCode.findOne({ where: { office_id: id }, transaction: t });
        if (qr) {
          // Check QR code uniqueness
          const codeExists = await QrCode.findOne({ where: { code: qr_code, id: { [Op.ne]: qr.id } }, transaction: t });
          if (codeExists) {
            await t.rollback();
            return reply.code(409).send({ status: 'error', message: 'This QR code is already used by another office' });
          }
          await qr.update({ code: qr_code }, { transaction: t });
        } else {
          await QrCode.create({ code: qr_code, office_id: id }, { transaction: t });
        }
      }

      await t.commit();

      const updatedOffice = await Office.findByPk(id, {
        include: [{ model: District }, { model: QrCode }]
      });

      return { status: 'success', message: 'Configuration updated successfully', data: updatedOffice };
    } catch (error) {
      await t.rollback();
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // GET /api/config/districts — All districts (for dropdown)
  districts: async (request, reply) => {
    try {
      const districts = await District.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
      return { status: 'success', data: districts };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  },

  // PUT /web/config/global — Apply start_time, close_time, radius, grace_period to all offices at once
  updateGlobal: async (request, reply) => {
    try {
      const { start_time, close_time, radius, grace_period } = request.body;
      const { User } = require('../models');

      const user = request.user;
      let officeWhere = {};

      if (user.role === 'Manager') {
        const loggedInUser = await User.findByPk(user.id, {
          include: [{ model: Office, as: 'Offices' }]
        });
        const managedOfficeIds = (loggedInUser?.Offices || []).map(o => o.id);
        if (managedOfficeIds.length === 0) {
          return reply.code(400).send({ status: 'error', message: 'No offices found to update' });
        }
        const { Op } = require('sequelize');
        officeWhere.id = { [Op.in]: managedOfficeIds };
      }

      const updateData = {};
      if (start_time) updateData.start_time = start_time;
      if (close_time) updateData.close_time = close_time;
      if (radius !== undefined && radius !== '') updateData.radius = radius;
      if (grace_period !== undefined && grace_period !== '') updateData.grace_period = grace_period;

      if (Object.keys(updateData).length === 0) {
        return reply.code(400).send({ status: 'error', message: 'No parameters provided to update' });
      }

      const [affectedCount] = await Office.update(updateData, { where: officeWhere });

      return {
        status: 'success',
        message: `Successfully updated configuration for ${affectedCount} office(s)`
      };
    } catch (error) {
      return reply.code(500).send({ status: 'error', message: error.message });
    }
  }
};
