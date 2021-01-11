'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Event = loader.database.define(
  'events',
  {
    eventId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    eventName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    eventPlace: {
      type: Sequelize.STRING,
      allowNull: false
    },
    eventTime: {
      type: Sequelize.DATE,
      allowNull: false
    },
    eventUrl: {
      type: Sequelize.STRING,
      allowNull: false
    },
    eventDesc: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    createdBy: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    createdByName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['createdBy']
      }
    ]
  }
);

module.exports = Event;