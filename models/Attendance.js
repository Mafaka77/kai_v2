const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  office_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  device_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  signin_at: { type: DataTypes.DATE, allowNull: false },
  signout_at: { type: DataTypes.DATE, allowNull: true },
  lat: { type: DataTypes.STRING, allowNull: false },
  lng: { type: DataTypes.STRING, allowNull: false },
  signout_lat: { type: DataTypes.STRING, allowNull: true },
  signout_lng: { type: DataTypes.STRING, allowNull: true },
  type: { type: DataTypes.STRING, defaultValue: 'present' },
  in_remark: { type: DataTypes.STRING, allowNull: true },
  out_remark: { type: DataTypes.STRING, allowNull: true },
  mobile: { type: DataTypes.STRING, allowNull: true },
  leaveType: { type: DataTypes.STRING, allowNull: true, field: 'leaveType' },
  start_date: { type: DataTypes.DATEONLY, allowNull: true, field: 'start_date' },
  end_date: { type: DataTypes.DATEONLY, allowNull: true, field: 'end_date' },
  no_of_days: { type: DataTypes.DECIMAL(5, 2), allowNull: true, field: 'no_of_days' },
}, {
  tableName: 'attendances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_attendance_user_signin',
      fields: ['user_id', 'signin_at']
    }
  ]
});

module.exports = Attendance;
