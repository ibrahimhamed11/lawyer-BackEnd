const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  country: { type: String, required: true }, 
  countryCode: { type: String, required: true }, 
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
});

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
