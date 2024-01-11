// create_specializations_table.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Specializations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      priority: {
        type: Sequelize.TEXT, // Use TEXT for JSON data in MySQL
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
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Specializations');
  },
};
