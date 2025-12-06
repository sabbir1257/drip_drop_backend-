const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const email = 'admin@dripdrop.com';
    const password = 'admin123';

    // Find user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      console.log('Run: npm run seed:admin to create admin user');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('User role:', user.role);
    console.log('User ID:', user._id);

    // Test password
    const isMatch = await user.comparePassword(password);
    
    if (isMatch) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does not match!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();

