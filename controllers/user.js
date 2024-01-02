// lawyer/src/controllers/authController.js
const userModel = require('../Models/userModel');

const login = (req, res) => {
  // Implement login logic
  res.send('Login route');
};

export const register = async (req, res) => {
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

    // You can add validation logic here if needed

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
    });

    await newUser.save();

    // Get the preferred language from the request headers or use a default language
    const preferredLang = req.headers['accept-language'] || 'en';

    // Define language-specific response messages
    const messages = {
      en: 'User registered successfully',
      ar: 'تم تسجيل المستخدم بنجاح',
    };

    // You can customize the success response according to your needs
    res.json({ message: messages[preferredLang], user: newUser });
  } catch (error) {
    console.error(error);
    
    // Get the preferred language from the request headers or use a default language
    const preferredLang = req.headers['accept-language'] || 'en';

    // Define language-specific error messages
    const errorMessages = {
      en: 'Internal Server Error',
      ar: 'خطأ في الخادم الداخلي',
    };

    // You can customize the error response according to your needs
    res.status(500).json({ error: errorMessages[preferredLang] });
  }
};

module.exports = {
  login,
  register,
};
