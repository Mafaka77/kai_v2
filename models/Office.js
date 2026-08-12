const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Office = sequelize.define('Office', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  district_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  lat: { type: DataTypes.STRING, allowNull: false },
  lng: { type: DataTypes.STRING, allowNull: false },
  lat2: { type: DataTypes.STRING, allowNull: true },
  lng2: { type: DataTypes.STRING, allowNull: true },
  radius: { type: DataTypes.DECIMAL, allowNull: false },
  grace_period: { type: DataTypes.INTEGER, allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  close_time: { type: DataTypes.TIME, allowNull: false },
}, {
  tableName: 'offices',
  timestamps: true,
  underscored: true
});

module.exports = Office;
