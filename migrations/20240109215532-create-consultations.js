'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Consultations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      lawyerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      priority: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      voiceNote: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      consultationSpecialization: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      Files: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      basePrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      negotiationPrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: false,
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
    await queryInterface.dropTable('Consultations');
  },
};
