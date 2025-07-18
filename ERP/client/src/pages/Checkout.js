import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryOption, setDeliveryOption] = useState('standard');

  // Redirect if cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    
    if (items.length === 0) {
      toast.info('Your cart is empty');
      navigate('/products');
      return;
    }
  }, [items, isAuthenticated, navigate]);

  // Calculate delivery estimates
  const getDeliveryEstimate = () => {
    const today = new Date();
    const deliveryDays = deliveryOption === 'express' ? 2 : deliveryOption === 'standard' ? 5 : 7;
    const deliveryDate = new Date(today.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
    
    return {
      date: deliveryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      range: `${deliveryDays - 1}-${deliveryDays + 1} business days`
    };
  };

  // Calculate shipping cost
  const getShippingCost = () => {
    switch (deliveryOption) {
      case 'express': return 15.99;
      case 'standard': return 5.99;
      case 'economy': return 0;
      default: return 5.99;
    }
  };

  // Calculate tax (8% for demo)
  const getTax = () => {
    return (getCartTotal() + getShippingCost()) * 0.08;
  };

  // Calculate final total
  const getFinalTotal = () => {
    return getCartTotal() + getShippingCost() + getTax();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missing = required.filter(field => !shippingAddress[field]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const deliveryEstimate = getDeliveryEstimate();
      const estimatedDeliveryDate = new Date();
      const deliveryDays = deliveryOption === 'express' ? 2 : deliveryOption === 'standard' ? 5 : 7;
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + deliveryDays);

      const orderData = {
        items,
        shippingAddress,
        paymentMethod,
        deliveryOption,
        subtotal: getCartTotal(),
        shipping: getShippingCost(),
        tax: getTax(),
        total: getFinalTotal(),
        estimatedDelivery: estimatedDeliveryDate.toISOString()
      };
      
      console.log('Sending order data:', orderData);
      console.log('User token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('Cart items:', items);
      
      // Submit order to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      console.log('Backend response:', result);

      if (!response.ok) {
        console.error('Order creation failed:', result);
        throw new Error(result.message || 'Failed to place order');
      }
      
      console.log('Order created:', result.order);
      
      // Clear cart and show success
      clearCart();
      toast.success('Order placed successfully! You will receive a confirmation email shortly.');
      
      // Redirect to order confirmation or products page
      navigate('/products', { 
        state: { 
          orderSuccess: true, 
          orderId: result.order.formattedOrderId
        }
      });
      
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deliveryEstimate = getDeliveryEstimate();

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="checkout-container">
      <Container className="py-4">
        <div className="text-center mb-4">
          <h2 className="fw-bold checkout-header">
            <i className="fas fa-shopping-bag me-2"></i>
            Checkout
          </h2>
          <p className="text-muted">Review your order and complete your purchase</p>
        </div>

        <Row>
          {/* Order Summary - Left Side */}
          <Col lg={7} className="mb-4">
            <Card className="checkout-card">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-list-alt me-2"></i>
                  Order Summary ({items.length} items)
                </h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {items.map(item => (
                    <ListGroup.Item key={item._id} className="order-summary-item d-flex align-items-center py-3">
                      <div className="me-3">
                        <img 
                          src={item.image ? `http://localhost:5000${item.image}` : '/api/placeholder/80/80'}
                          alt={item.name}
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          className="rounded"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.name}</h6>
                        <p className="text-muted mb-1">{item.category?.name} - {item.brand?.name}</p>
                        <div className="d-flex align-items-center">
                          <Badge bg="secondary" className="me-2">Qty: {item.quantity}</Badge>
                          <span className="text-success fw-bold">
                            ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Delivery Options */}
            <Card className="checkout-card mt-4">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-truck me-2"></i>
                  Delivery Options
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <div className="mb-3">
                    <Form.Check
                      type="radio"
                      id="economy"
                      name="delivery"
                      label={
                        <div>
                          <strong>Economy Delivery - FREE</strong>
                          <div className="text-muted">7-10 business days</div>
                        </div>
                      }
                      checked={deliveryOption === 'economy'}
                      onChange={() => setDeliveryOption('economy')}
                      className="delivery-option"
                    />
                  </div>
                  <div className="mb-3">
                    <Form.Check
                      type="radio"
                      id="standard"
                      name="delivery"
                      label={
                        <div>
                          <strong>Standard Delivery - $5.99</strong>
                          <div className="text-muted">4-6 business days</div>
                        </div>
                      }
                      checked={deliveryOption === 'standard'}
                      onChange={() => setDeliveryOption('standard')}
                      className="delivery-option"
                    />
                  </div>
                  <div className="mb-3">
                    <Form.Check
                      type="radio"
                      id="express"
                      name="delivery"
                      label={
                        <div>
                          <strong>Express Delivery - $15.99</strong>
                          <div className="text-muted">1-3 business days</div>
                        </div>
                      }
                      checked={deliveryOption === 'express'}
                      onChange={() => setDeliveryOption('express')}
                      className="delivery-option"
                    />
                  </div>
                </Form.Group>              <Alert variant="success" className="mt-3">
                <i className="fas fa-calendar-alt me-2"></i>
                <strong>Estimated Delivery:</strong> {deliveryEstimate.date}
                <br />
                <small>({deliveryEstimate.range})</small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>

        {/* Shipping & Payment - Right Side */}
        <Col lg={5}>
          {/* Shipping Address */}
          <Card className="checkout-card mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-map-marker-alt me-2"></i>
                Shipping Address
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmitOrder}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={shippingAddress.firstName}
                        onChange={handleInputChange}
                        className="checkout-form-control"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={shippingAddress.lastName}
                        onChange={handleInputChange}
                        className="checkout-form-control"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className="checkout-form-control"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="checkout-form-control"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    className="checkout-form-control"
                    placeholder="Street address, apartment, suite, etc."
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        className="checkout-form-control"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        className="checkout-form-control"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code *</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleInputChange}
                        className="checkout-form-control"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country *</Form.Label>
                      <Form.Select
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        className="checkout-form-control"
                        required
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Payment Method */}
          <Card className="checkout-card mb-4">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-credit-card me-2"></i>
                Payment Method
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Check
                  type="radio"
                  id="card"
                  name="payment"
                  label={
                    <div>
                      <i className="fas fa-credit-card me-2"></i>
                      Credit/Debit Card
                    </div>
                  }
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="payment-method mb-2"
                />
                <Form.Check
                  type="radio"
                  id="paypal"
                  name="payment"
                  label={
                    <div>
                      <i className="fab fa-paypal me-2"></i>
                      PayPal
                    </div>
                  }
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="payment-method mb-2"
                />
                <Form.Check
                  type="radio"
                  id="cod"
                  name="payment"
                  label={
                    <div>
                      <i className="fas fa-money-bill-wave me-2"></i>
                      Cash on Delivery
                    </div>
                  }
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="payment-method"
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Order Total */}
          <Card className="checkout-card mb-4">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">
                <i className="fas fa-calculator me-2"></i>
                Order Total
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>${getShippingCost().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>${getTax().toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold h5">
                <span>Total:</span>
                <span className="text-success">${getFinalTotal().toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <div className="d-grid gap-2">
            <Button
              variant="success"
              size="lg"
              onClick={handleSubmitOrder}
              disabled={loading}
              className="checkout-btn checkout-btn-success"
            >
              {loading ? (
                <div className="checkout-loading">
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  Processing Order...
                </div>
              ) : (
                <>
                  <i className="fas fa-lock me-2"></i>
                  Place Order - ${getFinalTotal().toFixed(2)}
                </>
              )}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/cart')}
              className="checkout-btn"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Cart
            </Button>
          </div>
        </Col>
      </Row>
      </Container>
    </div>
  );
};

export default Checkout;
