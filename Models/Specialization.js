// SpecializationModel.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');

const Specialization = sequelize.define('Specialization', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priority: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isValidPriority(value) {
        try {
          const parsedValue = JSON.parse(value);
          if (!parsedValue || !parsedValue.low || !parsedValue.medium || !parsedValue.high || !parsedValue.urgent) {
            throw new Error('Priority must have low, medium, high, and urgent properties');
          }
          if (!parsedValue.low.price || !parsedValue.medium.price || !parsedValue.high.price || !parsedValue.urgent.price) {
            throw new Error('Each priority degree must have a price property');
          }
        } catch (error) {
          throw new Error('Invalid JSON format for priority');
        }
      },
    },
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },
});

module.exports = { Specialization };
