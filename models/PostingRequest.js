const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostingRequest = sequelize.define('PostingRequest', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  office_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Submitted' }, // 'Submitted', 'Rejected', 'Approved'
  remark: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'posting_requests',
  timestamps: true,
  underscored: true
});

module.exports = PostingRequest;
