require('./config')
const express = require('express');
const app = express();
const port = 4000;
app.use(express.json());

// Import routes
const userRoutes = require('./routes/userRoute');
const base = "/lawyer-BackEnd";



// Use routes
app.use(`${base}/`, userRoutes);

// Define a welcome route
app.get(`${base}/`, (req, res) => {
  res.send('Hello, Lawyer app!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
