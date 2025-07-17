// Quick script to populate categories and brands
const mongoose = require('mongoose');

// Connect to database
mongoose.connect('mongodb://localhost:27017/erp-system');

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

// Brand Schema  
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);
const Brand = mongoose.model('Brand', brandSchema);

async function populateData() {
  try {
    // Sample categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', description: 'Fashion and apparel' },
      { name: 'Books', description: 'Books and literature' },
      { name: 'Sports', description: 'Sports and fitness equipment' },
      { name: 'Home & Garden', description: 'Home and garden supplies' }
    ];

    // Sample brands
    const brands = [
      { name: 'Apple', description: 'Technology company' },
      { name: 'Samsung', description: 'Electronics manufacturer' },
      { name: 'Nike', description: 'Sports apparel brand' },
      { name: 'Generic', description: 'Generic brand products' },
      { name: 'Sony', description: 'Electronics and entertainment' }
    ];

    // Insert categories
    for (const cat of categories) {
      try {
        await Category.create(cat);
        console.log(`✅ Created category: ${cat.name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Category already exists: ${cat.name}`);
        } else {
          console.error(`❌ Error creating category ${cat.name}:`, error.message);
        }
      }
    }

    // Insert brands
    for (const brand of brands) {
      try {
        await Brand.create(brand);
        console.log(`✅ Created brand: ${brand.name}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Brand already exists: ${brand.name}`);
        } else {
          console.error(`❌ Error creating brand ${brand.name}:`, error.message);
        }
      }
    }

    console.log('🎉 Database population completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating database:', error);
    process.exit(1);
  }
}

populateData();
