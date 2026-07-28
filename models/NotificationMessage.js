const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationMessage = sequelize.define('NotificationMessage', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: true },
  url: { type: DataTypes.STRING, allowNull: true },
  schedule_at: { type: DataTypes.DATE, allowNull: true },
  office_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true }
}, {
  tableName: 'notification_messages',
  timestamps: true,
  underscored: true
});

module.exports = NotificationMessage;
