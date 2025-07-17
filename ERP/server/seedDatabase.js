const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Product = require('./models/Product');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/erp-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@erp.com',
      password: 'admin123', // Let the model handle hashing
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Clothing', description: 'Fashion and apparel' },
      { name: 'Books', description: 'Books and educational materials' },
      { name: 'Home & Garden', description: 'Home improvement and gardening' },
      { name: 'Sports', description: 'Sports equipment and accessories' }
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const category = new Category(cat);
      await category.save();
      createdCategories.push(category);
      console.log(`Created category: ${category.name}`);
    }

    // Create brands
    const brands = [
      { name: 'Apple', description: 'Premium technology products' },
      { name: 'Samsung', description: 'Innovative electronics' },
      { name: 'Nike', description: 'Athletic footwear and apparel' },
      { name: 'Adidas', description: 'Sports equipment and clothing' },
      { name: 'Sony', description: 'Entertainment and electronics' }
    ];

    const createdBrands = [];
    for (const brand of brands) {
      const newBrand = new Brand(brand);
      await newBrand.save();
      createdBrands.push(newBrand);
      console.log(`Created brand: ${newBrand.name}`);
    }

    // Create products
    const products = [
      {
        name: 'iPhone 14 Pro',
        description: 'Latest iPhone with advanced camera system',
        price: 999.99,
        discount: 10,
        category: createdCategories[0]._id, // Electronics
        brand: createdBrands[0]._id, // Apple
        tags: ['smartphone', 'apple', 'premium'],
        createdBy: adminUser._id
      },
      {
        name: 'Samsung Galaxy S23',
        description: 'Flagship Android smartphone',
        price: 899.99,
        discount: 15,
        category: createdCategories[0]._id, // Electronics
        brand: createdBrands[1]._id, // Samsung
        tags: ['smartphone', 'android', 'camera'],
        createdBy: adminUser._id
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes',
        price: 150.00,
        discount: 20,
        category: createdCategories[4]._id, // Sports
        brand: createdBrands[2]._id, // Nike
        tags: ['shoes', 'running', 'comfort'],
        createdBy: adminUser._id
      },
      {
        name: 'Adidas Ultra Boost',
        description: 'High-performance running shoes',
        price: 180.00,
        discount: 0,
        category: createdCategories[4]._id, // Sports
        brand: createdBrands[3]._id, // Adidas
        tags: ['shoes', 'running', 'performance'],
        createdBy: adminUser._id
      },
      {
        name: 'Sony WH-1000XM4',
        description: 'Noise-canceling wireless headphones',
        price: 349.99,
        discount: 25,
        category: createdCategories[0]._id, // Electronics
        brand: createdBrands[4]._id, // Sony
        tags: ['headphones', 'wireless', 'noise-canceling'],
        createdBy: adminUser._id
      }
    ];

    for (const prod of products) {
      const product = new Product(prod);
      await product.save();
      console.log(`Created product: ${product.name} - $${product.price} (${product.discount}% off)`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('📧 Email: admin@erp.com');
    console.log('🔑 Password: admin123');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();
