const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Device = sequelize.define('Device', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: true },
  uid: { type: DataTypes.STRING, allowNull: true },
  active: { type: DataTypes.BOOLEAN, defaultValue: false },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'devices',
  timestamps: true,
  underscored: true
});

module.exports = Device;
