const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');

// Test route to check if orders endpoint is working
router.get('/test', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Orders route is working', 
    user: req.user ? { id: req.user._id, email: req.user.email } : null 
  });
});

// Create a new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    console.log('User:', req.user);

    const {
      items,
      shippingAddress,
      paymentMethod,
      deliveryOption,
      subtotal,
      shipping,
      tax,
      total,
      estimatedDelivery
    } = req.body;

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!shippingAddress || !paymentMethod || !deliveryOption) {
      return res.status(400).json({ message: 'Missing required order information' });
    }

    // Transform cart items to order items format
    const orderItems = items.map(item => {
      console.log('Processing item:', item);
      return {
        product: item._id || null, // Use the product ID if available
        name: item.name || 'Unknown Product',
        image: item.image || '',
        price: item.price || 0,
        discountPrice: item.discountPrice || null,
        quantity: item.quantity || 1,
        category: item.category || null,
        brand: item.brand || null
      };
    });

    console.log('Transformed order items:', orderItems);

    // Generate unique order ID
    const timestamp = Date.now();
    const orderId = `${timestamp}`;

    // Create the order
    const order = new Order({
      orderId,
      user: req.user._id, // Use _id instead of id
      items: orderItems,
      shippingAddress,
      paymentMethod,
      deliveryOption,
      subtotal,
      shipping,
      tax,
      total,
      estimatedDelivery: new Date(estimatedDelivery),
      status: 'confirmed'
    });

    console.log('Creating order:', order);

    await order.save();

    // Populate product details
    await order.populate('items.product');

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order.toObject(),
        formattedOrderId: `ORD-${order.orderId}`
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors,
        details: error.message
      });
    }
    
    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid data format',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user's orders with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter options
    const filter = { user: req.user._id }; // Use _id consistently
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name image category brand');

    const total = await Order.countDocuments(filter);

    // Add formatted data and delivery status to each order
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      formattedOrderId: `ORD-${order.orderId}`,
      deliveryStatus: order.getDeliveryStatus(),
      daysToDelivery: order.getDaysToDelivery()
    }));

    res.json({
      orders: formattedOrders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
});

// Get single order by ID
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      user: req.user._id // Use _id consistently
    }).populate('items.product', 'name image category brand');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      ...order.toObject(),
      formattedOrderId: `ORD-${order.orderId}`,
      deliveryStatus: order.getDeliveryStatus(),
      daysToDelivery: order.getDaysToDelivery()
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch order',
      error: error.message 
    });
  }
});

// Update order status (for admin/tracking simulation)
router.patch('/:orderId/status', authenticateToken, async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOne({
      orderId: req.params.orderId,
      user: req.user._id // Use _id consistently
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;
    
    // Set delivery date if status is delivered
    if (status === 'delivered' && !order.actualDelivery) {
      order.actualDelivery = new Date();
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order: {
        ...order.toObject(),
        formattedOrderId: `ORD-${order.orderId}`,
        deliveryStatus: order.getDeliveryStatus(),
        daysToDelivery: order.getDaysToDelivery()
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      message: 'Failed to update order status',
      error: error.message 
    });
  }
});

// Cancel order (only if not shipped)
router.patch('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      user: req.user._id // Use _id consistently
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Cannot cancel order that has been shipped or delivered' 
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order: {
        ...order.toObject(),
        formattedOrderId: `ORD-${order.orderId}`,
        deliveryStatus: order.getDeliveryStatus(),
        daysToDelivery: order.getDaysToDelivery()
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      message: 'Failed to cancel order',
      error: error.message 
    });
  }
});

// Get order statistics for user dashboard
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // Use _id consistently

    console.log('Fetching stats for user:', userId);

    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalSpent = await Order.aggregate([
      { $match: { user: userId, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    console.log('Stats calculation results:', {
      totalOrders,
      totalSpent: totalSpent[0]?.total || 0,
      statusBreakdown: stats
    });

    // Recent orders
    const recentOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId status total createdAt estimatedDelivery');

    res.json({
      totalOrders,
      totalSpent: totalSpent[0]?.total || 0,
      statusBreakdown: stats,
      recentOrders: recentOrders.map(order => ({
        ...order.toObject(),
        formattedOrderId: `ORD-${order.orderId}`,
        deliveryStatus: order.getDeliveryStatus(),
        daysToDelivery: order.getDaysToDelivery()
      }))
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch order statistics',
      error: error.message 
    });
  }
});

module.exports = router;
