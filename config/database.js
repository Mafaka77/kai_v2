const { Sequelize } = require('sequelize');
require('dotenv').config();

// Defaulting to typical local setup. This should be configured via .env later
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    timezone: '+05:30',
    logging: false,
    pool: {
      max: 100,
      min: 10,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize };
