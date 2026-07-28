const { Sequelize } = require('sequelize');
require('dotenv').config();

// Defaulting to typical local setup. This should be configured via .env later
const sequelize = new Sequelize(
  process.env.DB_DATABASE || 'kai', 
  process.env.DB_USERNAME || 'msegs', 
  process.env.DB_PASSWORD || 'MSeGS@2024', 
  {
    host: process.env.DB_HOST || '10.48.212.67',
    port: process.env.DB_PORT || '3306', 
    dialect: 'mysql',
    timezone: '+05:30',
    logging: false
  }
);

module.exports = { sequelize };
