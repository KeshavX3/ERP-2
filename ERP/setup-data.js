// Quick script to add basic categories and brands
const mongoose = require('mongoose');
require('dotenv').config();

async function addBasicData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add categories if none exist
    const Category = require('./server/models/Category');
    const categoryCount = await Category.countDocuments();
    
    if (categoryCount === 0) {
      const categories = [
        { name: 'Electronics', description: 'Electronic devices' },
        { name: 'Clothing', description: 'Fashion items' },
        { name: 'Books', description: 'Books and media' },
        { name: 'Sports', description: 'Sports equipment' }
      ];
      
      await Category.insertMany(categories);
      console.log('✅ Added basic categories');
    }

    // Add brands if none exist
    const Brand = require('./server/models/Brand');
    const brandCount = await Brand.countDocuments();
    
    if (brandCount === 0) {
      const brands = [
        { name: 'Apple', description: 'Technology brand' },
        { name: 'Samsung', description: 'Electronics brand' },
        { name: 'Nike', description: 'Sports brand' },
        { name: 'Generic', description: 'Generic brand' }
      ];
      
      await Brand.insertMany(brands);
      console.log('✅ Added basic brands');
    }

    await mongoose.disconnect();
    console.log('✅ Setup complete! Product forms will now work.');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addBasicData();
