const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const District = sequelize.define('District', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(2), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(25), allowNull: false, unique: true },
}, {
  tableName: 'districts',
  timestamps: true,
  underscored: true
});

module.exports = District;
