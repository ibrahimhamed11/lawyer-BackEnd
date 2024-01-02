const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config();

const databaseURL = process.env.DATABASE_URL;

mongoose.connect(databaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Cannot connect to the database: ", error);
  });
