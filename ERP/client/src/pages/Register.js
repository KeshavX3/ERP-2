import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const { googleAuth } = useAuth(); // Only need googleAuth, not register
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('🚀 Form submission started:', formData);
    
    if (!validateForm()) {
      setLoading(false);
      console.log('❌ Form validation failed');
      return;
    }
    
    try {
      console.log('📡 Sending registration request...');
      
      // Show loading state immediately
      setError(''); // Clear any previous errors
      
      // Use the authService directly for registration to get the response
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      console.log('📨 Response status:', response.status);

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok && data.needsVerification) {
        console.log('✅ Registration successful, redirecting to verification...');
        // Clear any existing toasts
        
        // Redirect to verification page with user data
        navigate('/verify-email', {
          state: {
            userData: {
              userId: data.userId,
              email: data.email,
              username: formData.username
            }
          },
          replace: true // Replace current history entry
        });
        
        // Don't show success toast here since we're redirecting
        return; // Exit early to prevent any other code from running
      } else if (response.ok) {
        console.log('✅ Registration successful (old flow)');
        // Regular success (shouldn't happen with new flow)
        navigate('/products');
      } else {
        console.log('❌ Registration failed:', data);
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('💥 Registration error:', error);
      setError('Registration failed. Please try again.');
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
                  }}>Create Account</h2>
                  <p className="text-muted">Join us and start managing your business</p>
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

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Username</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      placeholder="Enter your username" 
                      isInvalid={!!errors.username} 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Email Address</Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="Enter your email" 
                      isInvalid={!!errors.email} 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="Enter your password" 
                      isInvalid={!!errors.password} 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Confirm Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="confirmPassword" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      placeholder="Confirm your password" 
                      isInvalid={!!errors.confirmPassword} 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>

                {/* Google Sign Up Button */}
                <div className="mb-3">
                  <GoogleAuthButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    buttonText="Sign up with Google"
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
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Username</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      placeholder="Enter your username" 
                      isInvalid={!!errors.username} 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Email Address</Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="Enter your email" 
                      isInvalid={!!errors.email} 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="Enter your password" 
                      isInvalid={!!errors.password} 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '600', color: '#2c3e50' }}>Confirm Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="confirmPassword" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      placeholder="Confirm your password" 
                      isInvalid={!!errors.confirmPassword} 
                      required 
                      style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.1)',
                        fontSize: '1rem'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-center">
                  <p className="mb-0" style={{ color: '#7f8c8d' }}>
                    Already have an account? {' '}
                    <Link 
                      to="/login" 
                      style={{ 
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}
                    >
                      Sign in here
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

export default Register;
