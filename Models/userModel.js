// models/userModel.js
const { Sequelize, DataTypes } = require('sequelize');

// Assuming your database configuration is in the same file
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'cryptopa_lawyerApp',
  password: process.env.DB_PASSWORD || 'XKO&1y;O{()U',
  database: process.env.DB_NAME || 'nodeJs',
  logging: false,
});

const User = sequelize.define('User', {
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
});

const EmailVerification = sequelize.define('EmailVerification', {
  code: { type: DataTypes.STRING, allowNull: false },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
});

// Define associations
User.hasOne(EmailVerification, { foreignKey: 'userId' });
EmailVerification.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, EmailVerification };
