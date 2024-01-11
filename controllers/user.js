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
const sendVerificationEmail = async (email, otp, lang, action) => {
  let subject, text, html;

  
  if (action === 'confirmEmail') {
    subject = lang === 'ar' ? 'كود تأكيد البريد الإلكتروني' : 'Email Verification Code';
    text = lang === 'ar' ? `كود التحقق الخاص بك لتأكيد البريد الإلكتروني: ${otp}` : `Your email verification code: ${otp}`;
    html = lang === 'ar' ? `<p>كود التحقق الخاص بك لتأكيد البريد الإلكتروني: <strong>${otp}</strong></p>` : `<p>Your email verification code: <strong>${otp}</strong></p>`;
  } else if (action === 'resetPassword') {
    subject = lang === 'ar' ? 'كود إعادة تعيين كلمة المرور' : 'Password Reset Code';
    text = lang === 'ar' ? `كود التحقق الخاص بك لإعادة تعيين كلمة المرور: ${otp}` : `Your password reset code: ${otp}`;
    html = lang === 'ar' ? `<p>كود التحقق الخاص بك لإعادة تعيين كلمة المرور: <strong>${otp}</strong></p>` : `<p>Your password reset code: <strong>${otp}</strong></p>`;
  } else {
    subject = lang === 'ar' ? 'كود تأكيد البريد الإلكتروني' : 'Email Verification Code';
    text = lang === 'ar' ? `كود التحقق الخاص بك لتأكيد البريد الإلكتروني: ${otp}` : `Your email verification code: ${otp}`;
    html = lang === 'ar' ? `<p>كود التحقق الخاص بك لتأكيد البريد الإلكتروني: <strong>${otp}</strong></p>` : `<p>Your email verification code: <strong>${otp}</strong></p>`;
  }

  const mailOptions = {
    from: '"محامي" <contact@cryptopaydubai.net>',
    to: email,
    subject,
    text,
    html,
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
    emailAlreadyVerified: 'البريد الإلكتروني مفعل .',
    invalidOTP: 'رمز التحقق غير صحيح.',
    internalServerError: 'خطأ داخلي في الخادم.',
    emailNotVerified: 'البريد الإلكتروني غير مفعل.',
    incorrectPassword: 'كلمة المرور غير صحيحة.',
    userAlreadyExists: 'البريد الإلكتروني موجود بالفعل.',
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
      specialization,
      role,
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
      password: hashedPassword, 
      specialization,
      role
    });

    // Create email verification record
    await EmailVerification.create({
      code: otp,
      verified: false,
      userId: newUser.id,
    });

    await sendVerificationEmail(email, otp, lang, 'confirmEmail');

    // Return user data along with the success message
    res.json({
      message: lang === 'ar' ? 'تم تسجيل المستخدم تحقق من بريدك  .' : 'User registered,Check your email.',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        countryCode: newUser.countryCode,
        gender: newUser.gender,
        address: newUser.address,
        country: newUser.country,
        role:newUser.role,
        specialization:newUser.specialization,

      },
    });
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




const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lang = getLanguageFromHeaders(req.headers);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: errorMessages[lang].incorrectPassword });
    }
    const emailVerification = await EmailVerification.findOne({ where: { userId: user.id } });
    const isActive = emailVerification ? emailVerification.verified : false;
    const token = jwt.sign({ userId: user.id, role: user.role }, 'lawyer', {
      expiresIn: '100h', 
    });
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      countryCode: user.countryCode,
      gender: user.gender,
      address: user.address,
      country: user.country,
      role:user.role,
      specialization:user.specialization,
      isActive: isActive
    };
    res.json({ message: lang === 'ar' ? 'تم تسجيل الدخول بنجاح.' : 'Login successful.', token, user: userData });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};


// Forgot Password: Retrieve phone number
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const lang = getLanguageFromHeaders(req.headers);

    // Find the user with the provided email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }

    res.json({ phoneNumber: user.phone });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};



// Send Reset OTP: Send OTP for password reset
const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const lang = getLanguageFromHeaders(req.headers);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }
    const otp = generateOTP();
    // Save the OTP and its expiration time in the user record
    user.resetOtp = otp;
    user.resetOtpExpiration = new Date(Date.now() + 60 * 60 * 1000); // Set OTP expiration to 1 hour
    await user.save();
    await sendVerificationEmail(email, otp, lang,"resetPassword");
    const successMessage = {
      en: 'Reset OTP sent successfully.',
      ar: 'تم إرسال رمز التحقق لإعادة تعيين كلمة المرور بنجاح.'
    };
    res.json({ message: successMessage[lang] });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    const errorMessage = {
      en: errorMessages[lang].internalServerError,
      ar: 'حدث خطأ داخلي في الخادم.'
    };
    res.status(500).json({ error: errorMessage[lang] });
  }
};






// Reset Password: Verify OTP with email and return user data and token
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const lang = getLanguageFromHeaders(req.headers);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }
    if (user.resetOtp !== otp || new Date() > new Date(user.resetOtpExpiration)) {
      return res.status(400).json({ error: errorMessages[lang].invalidOTP });
    }
    user.resetOtp = null;
    user.resetOtpExpiration = null;
    await user.save();
    const token = jwt.sign({ userId: user.id, role: user.role }, 'lawyer', {
      expiresIn: '100h',
    });

    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      country: user.country,
    };

    const message = lang === 'ar'
      ? 'تم التحقق من رمز OTP بنجاح.'
      : 'OTP verification successful.';

    res.json({ message, token, user: userData });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};







// Get User Info: Get user information
const getUserInfo = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - User ID not provided' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const token = req.headers.authorization;
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      country: user.country,
    };

    res.json({ token, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error.' });
  }
};







// Update User Info: Update user information (including password if provided)
const updateUserInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, phone, country, oldPassword, newPassword } = req.body;
    const lang = getLanguageFromHeaders(req.headers);
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }
    if (oldPassword) {
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: errorMessages[lang].incorrectPassword });
      }
    }
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: errorMessages[lang].passwordTooShort });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();

    const successMessage = {
      en: 'User information updated successfully.',
      ar: 'تم تحديث معلومات المستخدم بنجاح.'
    };

    const passwordMessage = newPassword
      ? lang === 'ar' ? 'تم التحديث بنجاح.' : 'Updated successfully.'
      : '';
    res.json({ message: `${successMessage[lang]}` });
  } catch (error) {
    console.error(error);

    const errorMessage = {
      en: 'Internal Server Error.',
      ar: 'خطأ داخلي في الخادم.'
    };

    const lang = getLanguageFromHeaders(req.headers); 
    res.status(500).json({ error: errorMessage[lang] });
  }
};


const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.userId; // Extract user ID from the authenticated token
    const lang = getLanguageFromHeaders(req.headers);

    // Find the user by ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح.' : 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};





const getAllUsers = async (req, res) => {
  try {
    const lang = getLanguageFromHeaders(req.headers);

    // Find all users (excluding the password field)
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    const lang = getLanguageFromHeaders(req.headers);
    res.status(500).json({ error: errorMessages[lang].internalServerError });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id; // Extract user ID from the URL parameter
    const lang = getLanguageFromHeaders(req.headers);

    // Find the user by ID
    const userToDelete = await User.findByPk(userIdToDelete);

    if (!userToDelete) {
      return res.status(404).json({ error: errorMessages[lang].userNotFound });
    }

    // Delete the user
    await userToDelete.destroy();

    res.json({ message: lang === 'ar' ? 'تم حذف المستخدم بنجاح.' : 'User deleted successfully.' });
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
  forgotPassword,
  sendResetOTP,
  verifyOTP,
  getUserInfo,
  updateUserInfo,
  updatePassword,
  getAllUsers,
  deleteUser
};
