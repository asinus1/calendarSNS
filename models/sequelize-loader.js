'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://trope:57tYp6BvyKGS35RQ@localhost:5432/calendarsns',
  {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false}
      }
  }
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};
