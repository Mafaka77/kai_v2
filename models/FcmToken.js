const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FcmToken = sequelize.define('FcmToken', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  token: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'fcm_tokens',
  timestamps: true,
  underscored: true
});

module.exports = FcmToken;
