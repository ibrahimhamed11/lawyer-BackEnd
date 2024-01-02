// lawyer/src/controllers/user.js
const UserModel = require('../models/userModel');
const nodemailer = require('nodemailer');
require('dotenv').config();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, otp, lang) => {
  const mailOptions = {
    from: '"محامي" <contact@cryptopaydubai.net>',
    to: email,
    subject: lang === 'ar' ? 'كود تأكيد البريد الإلكتروني' : 'Email Verification Code',
    text: lang === 'ar' ? `كود التحقق الخاص بك لتأكيد البريد الإلكتروني: ${otp}` : `Your email verification code: ${otp}`,
    html: lang === 'ar' ? `<p>كود التحقق الخاص بك لتأكيد البريد الإلكتروني: <strong>${otp}</strong></p>` : `<p>Your email verification code: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const getLanguageFromHeaders = (headers) => {
  return headers['lang'] || 'en';
};

const errorMessages = {
  en: {
    userNotFound: 'User not found.',
    emailAlreadyVerified: 'Email already verified.',
    invalidOTP: 'Invalid OTP.',
    internalServerError: 'Internal Server Error.',
    emailNotVerified: 'Email not verified.',
    incorrectPassword: 'Incorrect password.',
    userAlreadyExists: 'User with this email already exists.',
  },
  ar: {
    userNotFound: 'المستخدم غير موجود.',
    emailAlreadyVerified: 'البريد الإلكتروني مفعل بالفعل.',
    invalidOTP: 'رمز التحقق غير صحيح.',
    internalServerError: 'خطأ داخلي في الخادم.',
    emailNotVerified: 'البريد الإلكتروني غير مفعل.',
    incorrectPassword: 'كلمة المرور غير صحيحة.',
    userAlreadyExists: 'المستخدم بتلك البريد الإلكتروني موجود بالفعل.',
  },
};

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      countryCode,
      gender,
      address,
      password,
    } = req.body;
    const otp = generateOTP();
    const lang = getLanguageFromHeaders(req.headers);

    // Check if the user with the provided email already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: errorMessages[lang].userAlreadyExists });
    }

    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      phone,
      country,
      countryCode,
      gender,
      address,
      password,
      emailVerification: {
        code: otp,
        verified: false,
      },
    });

    await newUser.save();
    await sendVerificationEmail(email, otp, lang);

    res.json({ message: lang === 'ar' ? 'تم تسجيل المستخدم. تحقق من بريدك الإلكتروني للتحقق.' : 'User registered. Check your email for verification.' });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const lang = getLanguageFromHeaders(req.headers);

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }

    if (user.emailVerification.verified) {
      return res.json({ message: errorMessages[lang].emailAlreadyVerified });
    }

    if (user.emailVerification.code !== otp) {
      return res.status(400).json({ error: errorMessages[lang].invalidOTP });
    }

    user.emailVerification.verified = true;
    await user.save();

    res.json({ message: lang === 'ar' ? 'تم التحقق من البريد الإلكتروني بنجاح.' : 'Email verified successfully.' });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lang = getLanguageFromHeaders(req.headers);

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }

    if (!user.emailVerification.verified) {
      return res.status(401).json({ error: errorMessages[lang].emailNotVerified });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: errorMessages[lang].incorrectPassword });
    }

    res.json({ message: 'Login successful.' });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
};
