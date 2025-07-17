import React from 'react';
import { Modal, Row, Col, Badge, Button } from 'react-bootstrap';
import ImageWithFallback from './ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductModal = ({ show, onHide, product, onAuthRequired }) => {
  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = () => {
    if (isAuthenticated) {
      addToCart(product);
    } else if (onAuthRequired) {
      onAuthRequired(product);
    } else {
      addToCart(product); // Fallback to original behavior
    }
  };

  if (!product) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <ImageWithFallback src={product.image} alt={product.name} className="product-detail-image" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
          </Col>
          <Col md={6}>
            <h4>{product.name}</h4>
            
            <div className="mb-3">
              <h5>Price</h5>
              {product.discount > 0 ? (
                <div>
                  <span className="text-decoration-line-through text-muted me-2">{formatPrice(product.price)}</span>
                  <span className="h4 text-success">{formatPrice(product.discountPrice)}</span>
                  <Badge bg="success" className="ms-2">{product.discount}% OFF</Badge>
                </div>
              ) : (
                <span className="h4">{formatPrice(product.price)}</span>
              )}
            </div>

            <div className="mb-3">
              <h5>Category</h5>
              <p>{product.category?.name}</p>
            </div>

            <div className="mb-3">
              <h5>Brand</h5>
              <p>{product.brand?.name}</p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="mb-3">
                <h5>Tags</h5>
                <div>
                  {product.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Button
                variant={isInCart(product._id) ? "success" : "primary"}
                size="lg"
                className="w-100"
                onClick={handleAddToCart}
              >
                {isInCart(product._id) ? (
                  <>
                    <i className="fas fa-check me-2"></i>
                    In Cart ({getItemQuantity(product._id)}) - Add More
                  </>
                ) : (
                  <>
                    <i className="fas fa-cart-plus me-2"></i>
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </Col>
        </Row>
        
        {product.description && (
          <Row className="mt-4">
            <Col>
              <h5>Description</h5>
              <p>{product.description}</p>
            </Col>
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ProductModal;
