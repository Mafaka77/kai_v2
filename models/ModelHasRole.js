const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Spatie pivot table: model_has_roles
// Columns: role_id (BIGINT UNSIGNED), model_type (string), model_id (BIGINT UNSIGNED)
// The model_type for users is typically 'App\\Models\\User'
const ModelHasRole = sequelize.define('ModelHasRole', {
  role_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  model_type: { type: DataTypes.STRING, allowNull: false },
  model_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
}, {
  tableName: 'model_has_roles',
  timestamps: false,
  underscored: false,
});

module.exports = ModelHasRole;
