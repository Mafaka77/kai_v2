const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attachment = sequelize.define('Attachment', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  path: { type: DataTypes.STRING, allowNull: false },
  notification_message_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  full_path: {
    type: DataTypes.VIRTUAL,
    get() {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      return `${appUrl}/storage/${this.path}`;
    }
  }
}, {
  tableName: 'attachments',
  timestamps: true,
  underscored: true
});

module.exports = Attachment;
