const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // Make this optional since we store product details directly
  },
  name: {
    type: String,
    required: true
  },
  image: String,
  price: {
    type: Number,
    required: true
  },
  discountPrice: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    name: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  brand: {
    name: String,
    _id: mongoose.Schema.Types.ObjectId
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'cod'],
    required: true
  },
  deliveryOption: {
    type: String,
    enum: ['economy', 'standard', 'express'],
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  estimatedDelivery: {
    type: Date,
    required: true
  },
  actualDelivery: Date,
  orderDate: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

// Add indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });

// Virtual for formatted order ID
orderSchema.virtual('formattedOrderId').get(function() {
  return `ORD-${this.orderId}`;
});

// Method to calculate delivery status
orderSchema.methods.getDeliveryStatus = function() {
  const now = new Date();
  const estimated = new Date(this.estimatedDelivery);
  
  if (this.status === 'delivered') {
    return 'delivered';
  } else if (this.status === 'cancelled') {
    return 'cancelled';
  } else if (now > estimated && this.status !== 'delivered') {
    return 'delayed';
  } else if (this.status === 'shipped') {
    return 'in-transit';
  } else {
    return 'processing';
  }
};

// Method to get estimated delivery days remaining
orderSchema.methods.getDaysToDelivery = function() {
  if (this.status === 'delivered' || this.status === 'cancelled') {
    return 0;
  }
  
  const now = new Date();
  const estimated = new Date(this.estimatedDelivery);
  const diffTime = estimated - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

module.exports = mongoose.model('Order', orderSchema);
