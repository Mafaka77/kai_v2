const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserOffice = sequelize.define('UserOffice', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  office_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
}, {
  tableName: 'user_offices',
  timestamps: true,
  underscored: true // maps camelCase to snake_case in db
});

module.exports = UserOffice;
