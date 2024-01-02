// src/index.js
const express = require('express');
const app = express();
const port = 3000;






app.get('/lawyer-BackEnd/', (req, res) => {
  res.send('Hello, Lawyer app!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
