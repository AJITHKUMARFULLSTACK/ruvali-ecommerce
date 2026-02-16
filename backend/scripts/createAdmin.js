const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ruvali-ecommerce');
    
    const username = process.argv[2] || 'admin';
    const email = process.argv[3] || 'admin@ruvali.com';
    const password = process.argv[4] || 'admin123';
    const role = process.argv[5] || 'superadmin';

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = new Admin({
      username,
      email,
      password,
      role
    });

    await admin.save();
    console.log(`Admin created successfully!`);
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
