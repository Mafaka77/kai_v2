const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QrCode = sequelize.define('QrCode', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false },
  office_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'qr_codes',
  timestamps: true,
  underscored: true
});

module.exports = QrCode;
