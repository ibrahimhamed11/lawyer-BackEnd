// models/userModel.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConnection');




// const sequelize = new Sequelize({
//   dialect: 'mysql',
//   host: process.env.DB_HOST || 'localhost',
//   username: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'lawyerApp',
//   logging: false,
// });


const User = sequelize.define('users', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false },
  countryCode: { type: DataTypes.STRING, allowNull: false },
  gender: { type: DataTypes.STRING, allowNull: false, validate: { isIn: [['male', 'female', 'other']] } },
  address: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  specialization: { type: DataTypes.STRING, allowNull: true }, 
  resetOtp: { type: DataTypes.STRING, allowNull: true }, // Added for password reset OTP
  resetOtpExpiration: { type: DataTypes.DATE, allowNull: true }, // Added for OTP expiration
  

});

const EmailVerification = sequelize.define('EmailVerifications', {
  code: { type: DataTypes.STRING, allowNull: false },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Define associations
User.hasOne(EmailVerification, { foreignKey: 'userId' });
EmailVerification.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, EmailVerification };
