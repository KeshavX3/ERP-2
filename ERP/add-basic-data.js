const mongoose = require('mongoose');
const Category = require('./server/models/Category');
const Brand = require('./server/models/Brand');
require('dotenv').config();

async function addBasicData() {
  try {
    // Connect to your MongoDB database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to your MongoDB database');

    // Check if categories exist
    const existingCategories = await Category.find();
    console.log(`📂 Found ${existingCategories.length} existing categories`);
    
    if (existingCategories.length === 0) {
      // Create basic categories
      const categories = [
        { name: 'Electronics', description: 'Electronic devices and gadgets' },
        { name: 'Clothing', description: 'Fashion and apparel' },
        { name: 'Books', description: 'Books and educational materials' },
        { name: 'Home & Garden', description: 'Home improvement and gardening' },
        { name: 'Sports', description: 'Sports equipment and accessories' },
        { name: 'Health & Beauty', description: 'Health and beauty products' },
        { name: 'Automotive', description: 'Car and motorcycle accessories' },
        { name: 'Food & Beverage', description: 'Food and drink products' }
      ];

      for (const cat of categories) {
        const category = new Category(cat);
        await category.save();
        console.log(`✅ Created category: ${category.name}`);
      }
    } else {
      console.log('ℹ️  Categories already exist, skipping...');
    }

    // Check if brands exist
    const existingBrands = await Brand.find();
    console.log(`🏷️  Found ${existingBrands.length} existing brands`);
    
    if (existingBrands.length === 0) {
      // Create basic brands
      const brands = [
        { name: 'Apple', description: 'Technology and electronics' },
        { name: 'Samsung', description: 'Electronics and home appliances' },
        { name: 'Nike', description: 'Sports and athletic wear' },
        { name: 'Adidas', description: 'Sports equipment and clothing' },
        { name: 'Sony', description: 'Electronics and entertainment' },
        { name: 'Microsoft', description: 'Software and technology' },
        { name: 'Generic', description: 'Generic brand for unbranded items' },
        { name: 'Custom', description: 'Custom or handmade products' }
      ];

      for (const brand of brands) {
        const brandDoc = new Brand(brand);
        await brandDoc.save();
        console.log(`✅ Created brand: ${brandDoc.name}`);
      }
    } else {
      console.log('ℹ️  Brands already exist, skipping...');
    }

    // Show summary
    const totalCategories = await Category.countDocuments();
    const totalBrands = await Brand.countDocuments();
    
    console.log('\n🎉 Database Setup Complete!');
    console.log(`📂 Total Categories: ${totalCategories}`);
    console.log(`🏷️  Total Brands: ${totalBrands}`);
    console.log('\n✅ Your product forms will now work properly!');
    console.log('📝 You can now:');
    console.log('   • Add new products with categories and brands');
    console.log('   • Edit existing products');
    console.log('   • View dropdowns populated with data');
    
    await mongoose.disconnect();
    console.log('\n✅ Setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addBasicData();
