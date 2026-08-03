const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  office_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  device_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  signin_at: { type: DataTypes.DATE, allowNull: true },
  signout_at: { type: DataTypes.DATE, allowNull: true },
  lat: { type: DataTypes.STRING, allowNull: true },
  lng: { type: DataTypes.STRING, allowNull: true },
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
    },
    {
      name: 'attendances_id_index',
      fields: ['id']
    },
    {
      name: 'attendances_signout_at_index',
      fields: ['signout_at']
    },
    {
      name: 'attendances_signout_lat_index',
      fields: ['signout_lat']
    },
    {
      name: 'attendances_signout_lng_index',
      fields: ['signout_lng']
    },
    {
      name: 'attendances_out_remark_index',
      fields: ['out_remark']
    },
    {
      name: 'attendances_signin_at_index',
      fields: ['signin_at']
    },
    {
      name: 'attendances_user_id_index',
      fields: ['user_id']
    },
    {
      name: 'attendances_office_id_index',
      fields: ['office_id']
    },
    {
      name: 'attendances_start_date_index',
      fields: ['start_date']
    },
    {
      name: 'attendances_end_date_index',
      fields: ['end_date']
    }
  ]
});

module.exports = Attendance;
