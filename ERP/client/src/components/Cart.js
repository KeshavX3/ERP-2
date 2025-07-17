import React from 'react';
import { Offcanvas, Button, ListGroup, Badge, Form } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import ImageWithFallback from './ImageWithFallback';

const Cart = ({ show, onHide }) => {
  const { items, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (quantity >= 0) {
      updateQuantity(productId, quantity);
    }
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '400px' }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          Shopping Cart 
          {items.length > 0 && <Badge bg="primary" className="ms-2">{items.length}</Badge>}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column">
        {items.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>🛒</div>
            <h5 className="text-muted">Your cart is empty</h5>
            <p className="text-muted">Add some products to get started!</p>
          </div>
        ) : (
          <>
            <div className="flex-grow-1">
              <ListGroup variant="flush">
                {items.map(item => (
                  <ListGroup.Item key={item._id} className="px-0">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.name}</h6>
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <div className="text-success fw-bold">
                              {formatPrice(item.discountPrice || item.price)}
                            </div>
                            {item.discount > 0 && (
                              <small className="text-muted text-decoration-line-through">
                                {formatPrice(item.price)}
                              </small>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <Form.Select
                              size="sm"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                              style={{ width: '70px' }}
                            >
                              {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                              ))}
                            </Form.Select>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeFromCart(item._id)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
            
            <div className="border-top pt-3 mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Total: {formatPrice(getCartTotal())}</h5>
                <Button variant="outline-secondary" size="sm" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
              <div className="d-grid gap-2">
                <Button variant="primary" size="lg">
                  Proceed to Checkout
                </Button>
                <Button variant="outline-primary" onClick={onHide}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Cart;
