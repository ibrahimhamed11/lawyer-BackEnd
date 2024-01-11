// app.js

const express = require('express');
const path = require('path');

const userRoutes = require('./Routes/userRoute');
const ConsultationRoute = require('./Routes/Consultation');
const Specialization = require('./Routes/Specialization');





const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

const base = "/LawyerApi";
app.use(`${base}/`, userRoutes);
app.use(`${base}/`, Specialization);
app.use(`${base}/`, ConsultationRoute);


// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve HTML file from the 'views' directory
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'upload.html'));
});


app.get(`${base}/`, (req, res) => {
  res.send('Hello, Lawyer app!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
