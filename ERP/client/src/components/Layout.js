import React, { useState } from 'react';
import { Navbar, Nav, Button, Dropdown, Container } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartButton from './CartButton';
import Cart from './Cart';

const ModernHeader = ({ onShowCart }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Redirect to products page after logout to ensure guest access
    navigate('/products');
  };
  
  const menuItems = [
    { path: '/products', label: 'Products', icon: 'fas fa-box' },
    { path: '/categories', label: 'Categories', icon: 'fas fa-tags' },
    { path: '/brands', label: 'Brands', icon: 'fas fa-award' },
  ];

  return (
    <Navbar className="modern-navbar" expand="lg" variant="dark" fixed="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/products" className="modern-brand">
          <i className="fas fa-cube me-2"></i>
          <span className="brand-text">ERP</span>
          <span className="brand-accent">Pro</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {menuItems.map((item) => (
              <Nav.Link 
                key={item.path}
                as={Link} 
                to={item.path} 
                className={`nav-item-modern ${location.pathname === item.path ? 'active' : ''}`}
              >
                <i className={`${item.icon} me-2`}></i>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-3">
            <CartButton onClick={onShowCart} variant="outline-light" />
            
            <Dropdown align="end">
              <Dropdown.Toggle variant="user-dropdown" className="user-dropdown-btn">
                <div className="user-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <span className="user-name d-none d-md-inline">{user?.username}</span>
              </Dropdown.Toggle>
              
              <Dropdown.Menu className="user-dropdown-menu">
                <Dropdown.Header>
                  <div className="user-info">
                    <strong>{user?.username}</strong>
                    <small className="text-muted d-block">{user?.email}</small>
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item className="logout-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

const Layout = ({ children }) => {
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <ModernHeader onShowCart={() => setShowCart(true)} />
      <main className="modern-main-content">
        <div className="content-wrapper">{children}</div>
      </main>
      <Cart show={showCart} onHide={() => setShowCart(false)} />
    </>
  );
};

export default Layout;
