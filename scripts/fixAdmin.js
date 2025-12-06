const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const email = 'admin@dripdrop.com';
    const password = 'admin123';

    // Check if admin exists
    let admin = await User.findOne({ email }).select('+password');

    if (admin) {
      console.log('📋 Admin user found:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   ID:', admin._id);

      // Test password
      const isMatch = await admin.comparePassword(password);
      
      if (isMatch) {
        console.log('✅ Password is correct');
      } else {
        console.log('❌ Password mismatch - resetting password...');
        // Reset password
        admin.password = password;
        await admin.save();
        console.log('✅ Password reset successfully');
      }

      // Ensure role is admin
      if (admin.role !== 'admin') {
        console.log('⚠️  Role is not admin - fixing...');
        admin.role = 'admin';
        await admin.save();
        console.log('✅ Role updated to admin');
      }

      // Ensure email is verified
      if (!admin.isEmailVerified) {
        admin.isEmailVerified = true;
        await admin.save();
        console.log('✅ Email verification set to true');
      }
    } else {
      console.log('❌ Admin user not found - creating...');
      // Create admin user
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: email,
        password: password,
        role: 'admin',
        isEmailVerified: true
      });
      console.log('✅ Admin user created successfully!');
    }

    // Final verification
    console.log('\n📊 Final Admin User Details:');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Email Verified:', admin.isEmailVerified);
    console.log('   ID:', admin._id);

    // Test login
    console.log('\n🔐 Testing password...');
    const testUser = await User.findOne({ email }).select('+password');
    const passwordTest = await testUser.comparePassword(password);
    
    if (passwordTest) {
      console.log('✅ Password test passed!');
    } else {
      console.log('❌ Password test failed!');
    }

    console.log('\n✅ Admin user is ready!');
    console.log('   Login with:');
    console.log('   Email: admin@dripdrop.com');
    console.log('   Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin:', error);
    process.exit(1);
  }
};

fixAdmin();

