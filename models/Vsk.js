const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vsk = sequelize.define('Vsk', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  office_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  mobile: { type: DataTypes.STRING, allowNull: true },
  signin_at: { type: DataTypes.DATE, allowNull: true },
  type: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: 'vsks',
  timestamps: true,
  underscored: true
});

module.exports = Vsk;
