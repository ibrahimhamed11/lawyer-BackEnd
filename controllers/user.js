// controllers/userController.js
const { User, EmailVerification } = require('../Models/userModel');
const jwt = require('jsonwebtoken');
const transporter = require('../config/cradentials'); // Importing the transporter from credentials.js
const bcrypt = require('bcryptjs');


// Generate 4-digit OTP function
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};


// Send verification email function
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

// Get language from headers function
const getLanguageFromHeaders = (headers) => {
  return headers['lang'] || 'en';
};

// Error messages
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


// User registration function
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
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: errorMessages[lang].userAlreadyExists });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with hashed password
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      country,
      countryCode,
      gender,
      address,
      password: hashedPassword, // Store the hashed password
    });

    // Create email verification record
    await EmailVerification.create({
      code: otp,
      verified: false,
      userId: newUser.id,
    });

    await sendVerificationEmail(email, otp, lang);

    res.json({ message: lang === 'ar' ? 'تم تسجيل المستخدم. تحقق من بريدك الإلكتروني للتحقق.' : 'User registered. Check your email for verification.' });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};







// Email verification function
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const lang = getLanguageFromHeaders(req.headers);

    // Find the user with the provided email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }

    // Check if email is already verified
    const emailVerification = await EmailVerification.findOne({ where: { userId: user.id } });
    if (emailVerification.verified) {
      return res.json({ message: errorMessages[lang].emailAlreadyVerified });
    }

    // Check if the provided OTP is correct
    if (emailVerification.code !== otp) {
      return res.status(400).json({ error: errorMessages[lang].invalidOTP });
    }

    // Update email verification status
    emailVerification.verified = true;
    await emailVerification.save();

    res.json({ message: lang === 'ar' ? 'تم التحقق من البريد الإلكتروني بنجاح.' : 'Email verified successfully.' });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};




// User login function with JWT token
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lang = getLanguageFromHeaders(req.headers);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: errorMessages[lang].incorrectPassword });
    }

    // Check if the user is verified
    const emailVerification = await EmailVerification.findOne({ where: { userId: user.id } });

    // Check if the user is active (verified)
    const isActive = emailVerification ? emailVerification.verified : false;

    // Create and sign a JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, 'lawyer', {
      expiresIn: '100h', // Token expiration time
    });

    // Exclude password from user data in the response
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      countryCode: user.countryCode,
      gender: user.gender,
      address: user.address,
      role: user.role,
      isActive:isActive
    };

    res.json({ message: lang === 'ar' ? 'تم تسجيل الدخول بنجاح.' : 'Login successful.', token, user: userData });
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
