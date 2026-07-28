const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AppealAttendance = sequelize.define('AppealAttendance', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  attendance_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  office_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: true },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.STRING, defaultValue: 'Submitted' },
  type: { type: DataTypes.STRING, allowNull: true },
  reason: { type: DataTypes.TEXT, allowNull: true },
  signin_time: { type: DataTypes.TIME, allowNull: true },
}, {
  tableName: 'appeal_attendances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AppealAttendance;
