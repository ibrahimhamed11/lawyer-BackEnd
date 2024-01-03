// app.js

const express = require('express');
const { Sequelize } = require('sequelize');
const userRoutes = require('./routes/userRoute');

// Sequelize connection
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'cryptopa_lawyerApp',
  password: process.env.DB_PASSWORD || 'XKO&1y;O{()U',
  database: process.env.DB_NAME || 'cryptopa_lawyerApp',
  logging: false,
});

// Check the connection status
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Import and use user routes
const base = "/lawyer-BackEnd";
app.use(`${base}/`, userRoutes);

// Define a welcome route
app.get(`${base}/`, (req, res) => {
  res.send('Hello, Lawyer app!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
