const mongoose = require('mongoose');
const User = require('./server/models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB using environment variable or default
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-system';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@erp.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      // Update existing admin to ensure it's active and verified
      existingAdmin.isEmailVerified = true;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('Admin user updated - now active and verified');
    } else {
      // Create new admin user
      const adminUser = new User({
        name: 'Administrator',
        username: 'admin',
        email: 'admin@erp.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true,
        isActive: true
      });
      
      await adminUser.save();
      console.log('Admin user created successfully!');
    }

    console.log('\n🎉 Admin Login Credentials:');
    console.log('📧 Email: admin@erp.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
