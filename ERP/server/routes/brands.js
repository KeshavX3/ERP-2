const express = require('express');
const { body, validationResult } = require('express-validator');
const Brand = require('../models/Brand');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateBrand = [
  body('name')
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('website')
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('Please enter a valid URL'),
  body('logo')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Logo path too long')
];

// Get all brands
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const filter = { isActive: true };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const brands = await Brand.find(filter)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Brand.countDocuments(filter);

    res.json({
      brands,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single brand by ID
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json(brand);
  } catch (error) {
    console.error('Get brand error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new brand
router.post('/', authenticateToken, validateBrand, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, description, logo, website } = req.body;

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand already exists' });
    }

    const brand = new Brand({
      name,
      description,
      logo,
      website
    });

    await brand.save();

    res.status(201).json({
      message: 'Brand created successfully',
      brand
    });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update brand
router.put('/:id', authenticateToken, validateBrand, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, description, logo, website } = req.body;

    // Check if brand exists
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Check if name already exists (excluding current brand)
    const existingBrand = await Brand.findOne({ 
      name, 
      _id: { $ne: req.params.id } 
    });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand name already exists' });
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name, description, logo, website },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Brand updated successfully',
      brand: updatedBrand
    });
  } catch (error) {
    console.error('Update brand error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete brand
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Soft delete by setting isActive to false
    await Brand.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
