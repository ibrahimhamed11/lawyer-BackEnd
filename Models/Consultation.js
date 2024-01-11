// ConsultationModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');

const Consultation = sequelize.define('Consultation', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lawyerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  voiceNote: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  consultationSpecialization: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Files: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  basePrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  negotiationPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0, 
  },
}, {
  timestamps: true, 
});

module.exports = { Consultation };
