import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

const GuestLayout = ({ children }) => {
  const { getCartItemsCount } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCartClick = (e) => {
    e.preventDefault();
    setShowAuthModal(true);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowAuthModal(true);
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Guest Navigation */}
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow">
        <Container>
          <Navbar.Brand href="/products" className="fw-bold">
            <i className="fas fa-store me-2"></i>
            ERP Store
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/products">
                <i className="fas fa-box me-1"></i>
                Products
              </Nav.Link>
              <Nav.Link as={Link} to="/categories">
                <i className="fas fa-tags me-1"></i>
                Categories
              </Nav.Link>
              <Nav.Link as={Link} to="/brands">
                <i className="fas fa-award me-1"></i>
                Brands
              </Nav.Link>
            </Nav>
            
            <Nav className="align-items-center">
              {/* Cart Icon (shows auth modal when clicked) */}
              <Nav.Link href="#" className="position-relative me-3" onClick={handleCartClick}>
                <i className="fas fa-shopping-cart"></i>
                {getCartItemsCount() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {getCartItemsCount()}
                  </span>
                )}
              </Nav.Link>
              
              {/* Login/Register Buttons */}
              <Button 
                variant="outline-light" 
                size="sm" 
                className="me-2"
                onClick={handleLoginClick}
              >
                <i className="fas fa-sign-in-alt me-1"></i>
                Login
              </Button>
              <Button 
                variant="light" 
                size="sm"
                onClick={handleLoginClick}
              >
                <i className="fas fa-user-plus me-1"></i>
                Sign Up
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className="flex-grow-1">
        <Container fluid className="py-3">
          {children}
        </Container>
      </main>

      {/* Guest Footer */}
      <footer className="bg-light border-top py-3 mt-auto">
        <Container>
          <div className="row align-items-center">
            <div className="col-md-6">
              <small className="text-muted">
                &copy; 2025 ERP Store. Browse our products freely!
              </small>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Login to add items to cart and make purchases
              </small>
            </div>
          </div>
        </Container>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        onLoginSuccess={() => {
          setShowAuthModal(false);
          // Optionally redirect or refresh the page after login
          window.location.reload();
        }}
      />
    </div>
  );
};

export default GuestLayout;
