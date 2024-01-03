const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config();

const databaseURL = "mongodb+srv://ibrahimhamed112:pkEQEgVQRJVquywO@cluster0.m39mcwh.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(databaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Cannot connect to the database: ", error);
  });
