// credentials.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'cryptopaydubai.net',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@cryptopaydubai.net',
    pass: '@a8&ukvx[dJi~',
  },
});

module.exports = transporter;
