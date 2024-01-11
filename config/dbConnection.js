// File: dbConnection.js

const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize({
//     dialect: 'mysql',
//     host: process.env.DB_HOST || 'localhost',
//     username: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || '',
//     database: process.env.DB_NAME || 'lawyerApp',
//     logging: false,
// });



const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'cryptopa_lawyerApp',
  password: process.env.DB_PASSWORD || 'DW,C7nx)feUn',
  database: process.env.DB_NAME || 'cryptopa_lawyerApp',
  logging: false,
});




sequelize
  .authenticate()
  .then(() => {
    console.log('Connection to the database successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

  

module.exports = sequelize;
