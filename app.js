// app.js

const express = require('express');
const userRoutes = require('./Routes/userRoute');




const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Import and use user routes
const base = "/LawyerApi";
app.use(`${base}/`, userRoutes);

// Define a welcome route
app.get(`${base}/`, (req, res) => {
  res.send('Hello, Lawyer app!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
