const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  full_name: { type: DataTypes.STRING, allowNull: false },
  designation: { type: DataTypes.STRING, allowNull: true },
  mobile: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  remember_token: { type: DataTypes.STRING, allowNull: true },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  },
  role: {
    type: DataTypes.VIRTUAL,
    get() {
      const roles = this.getDataValue('Roles');
      return (roles && roles.length > 0) ? roles[0].name : 'User';
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deleted_at',
  underscored: true
});

module.exports = User;
