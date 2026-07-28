const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LateList = sequelize.define('LateList', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  office_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  mobile: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'late_lists',
  timestamps: true,
  underscored: true
});

module.exports = LateList;
