'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Eventfollow = loader.database.define(
  'eventfollows',
  {
    follow: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    eventfollowed: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    followname: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timpstamps: false,
    indexes: [
      {
        fields: ['follow']
      }
    ]
  }
);

module.exports = Eventfollow;