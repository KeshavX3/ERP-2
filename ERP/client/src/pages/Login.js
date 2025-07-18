import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, default to '/products'
  const from = location.state?.from || '/products';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Use direct API call to handle verification response
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Successful login
        localStorage.setItem('token', data.token);
        navigate(from); // Navigate to the intended destination
        window.location.reload(); // Refresh to update auth state
      } else if (data.needsVerification) {
        // User needs email verification
        navigate('/verify-email', {
          state: {
            userData: {
              userId: data.userId,
              email: data.email
            }
          }
        });
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleData) => {
    setLoading(true);
    try {
      const result = await googleAuth(googleData.credential || googleData.token);
      if (result.success) {
        navigate('/products');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    setError('Google authentication failed');
  };

  return (
    <div className="auth-container" style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <div className="text-center mb-4">
              <div className="auth-brand mb-4">
                <i className="fas fa-cube" style={{ fontSize: '3rem', color: '#fff', marginBottom: '1rem' }}></i>
                <h1 style={{ color: '#fff', fontWeight: '800', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  ERP<span style={{ color: '#4ecdc4' }}>Pro</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>Enterprise Resource Planning</p>
              </div>
            </div>
            
            <Card className="auth-card" style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
              <Card.Body style={{ padding: '3rem' }}>
                <div className="text-center mb-4">
                  <h2 className="mb-3" style={{ 
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Welcome Back</h2>
                  <p className="text-muted">Sign in to access your dashboard</p>
                </div>

                {error && (
                  <Alert variant="danger" style={{ 
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    color: 'white'
                  }}>
                    {error}
                  </Alert>
                )}

                {/* Google Login Button */}
                <div className="mb-3">
                  <GoogleAuthButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    buttonText="Sign in with Google"
                    disabled={loading}
                  />
                </div>

                <div className="divider-container mb-3">
                  <div className="divider-line"></div>
                  <span className="divider-text">or</span>
                  <div className="divider-line"></div>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Email Address</Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="Enter your email" 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="Enter your password" 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                  </Form.Group>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-100 mb-3" 
                    disabled={loading}
                    style={{
                      padding: '0.8rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-center">
                  <p className="mb-0" style={{ color: '#7f8c8d' }}>
                    Don't have an account? {' '}
                    <Link 
                      to="/register" 
                      style={{ 
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
