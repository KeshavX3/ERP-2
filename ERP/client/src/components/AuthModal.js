import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

const AuthModal = ({ show, onHide, redirectAfterLogin = false, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login, register, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email = 'Email is invalid';
    if (!loginData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!signupData.name.trim()) newErrors.name = 'Name is required';
    if (!signupData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signupData.email)) newErrors.email = 'Email is invalid';
    if (!signupData.password) newErrors.password = 'Password is required';
    else if (signupData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success('Welcome back! You can now add items to your cart.');
      onHide();
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      toast.error(error.message || 'Login failed');
      setErrors({ submit: error.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setLoading(true);
    try {
      await register(signupData.name, signupData.email, signupData.password);
      toast.success('Account created successfully! You can now add items to your cart.');
      onHide();
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      setErrors({ submit: error.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleData) => {
    console.log("🔍 AuthModal: handleGoogleSuccess called with:", googleData);
    setLoading(true);
    try {
      // Use the AuthContext googleAuth method instead of manual handling
      console.log("🔍 AuthModal: Calling googleAuth from context");
      const result = await googleAuth(googleData.credential);
      console.log("🔍 AuthModal: Received result from googleAuth:", result);
      
      if (result.success) {
        if (result.requiresVerification) {
          console.log("✅ AuthModal: Verification required, navigating to verify-email");
          console.log("✅ User data:", { userId: result.userId, email: result.email });
          
          // Store verification data in sessionStorage for reliability
          sessionStorage.setItem('pendingVerification', JSON.stringify({
            userId: result.userId,
            email: result.email,
            fromGoogleAuth: true
          }));
          
          // Close modal first
          onHide();
          
          // Use window.location for more reliable navigation
          console.log("🚀 AuthModal: Using window.location to navigate");
          window.location.href = '/verify-email';
          
        } else {
          console.log("🔍 AuthModal: Normal login, no verification needed");
          // Normal successful login
          onHide();
          if (onLoginSuccess) onLoginSuccess();
        }
      } else {
        console.error("❌ AuthModal: Google auth returned error:", result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ AuthModal: Google authentication failed:', error);
      console.error('❌ Full error object:', error);
      toast.error(`Google authentication failed: ${error.message}`);
      setErrors({ submit: error.message || 'Google authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google auth error:', error);
    toast.error('Google authentication failed');
    setErrors({ submit: error.message || 'Google authentication failed' });
  };

  const resetForm = () => {
    setLoginData({ email: '', password: '' });
    setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setActiveTab('login');
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      className="auth-modal"
      backdrop="static"
    >
      <div className="auth-modal-content">
        <Modal.Header className="auth-modal-header border-0">
          <div className="w-100 text-center">
            <div className="auth-modal-icon mb-3">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <Modal.Title className="auth-modal-title">
              Join Our Store
            </Modal.Title>
            <p className="auth-modal-subtitle">
              Please login or create an account to add items to your cart
            </p>
          </div>
          <Button 
            variant="link" 
            className="auth-modal-close" 
            onClick={handleClose}
          >
            <i className="fas fa-times"></i>
          </Button>
        </Modal.Header>

        <Modal.Body className="auth-modal-body">
          {errors.submit && (
            <Alert variant="danger" className="auth-alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {errors.submit}
            </Alert>
          )}

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => {
              setActiveTab(k);
              setErrors({});
            }}
            className="auth-tabs"
            justify
          >
            <Tab eventKey="login" title="Login">
              <Form onSubmit={handleLogin} className="auth-form">
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

                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">
                    <i className="fas fa-envelope me-2"></i>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Enter your email"
                    className={`auth-input ${errors.email ? 'is-invalid' : ''}`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="auth-label">
                    <i className="fas fa-lock me-2"></i>
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    className={`auth-input ${errors.password ? 'is-invalid' : ''}`}
                    disabled={loading}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </Form.Group>

                <Button
                  type="submit"
                  className="auth-submit-btn w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Login to Your Account
                    </>
                  )}
                </Button>
              </Form>
            </Tab>

            <Tab eventKey="signup" title="Sign Up">
              <Form onSubmit={handleSignup} className="auth-form">
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

                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">
                    <i className="fas fa-user me-2"></i>
                    Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    placeholder="Enter your full name"
                    className={`auth-input ${errors.name ? 'is-invalid' : ''}`}
                    disabled={loading}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">
                    <i className="fas fa-envelope me-2"></i>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder="Enter your email"
                    className={`auth-input ${errors.email ? 'is-invalid' : ''}`}
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="auth-label">
                    <i className="fas fa-lock me-2"></i>
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    placeholder="Create a password"
                    className={`auth-input ${errors.password ? 'is-invalid' : ''}`}
                    disabled={loading}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="auth-label">
                    <i className="fas fa-lock me-2"></i>
                    Confirm Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    placeholder="Confirm your password"
                    className={`auth-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                </Form.Group>

                <Button
                  type="submit"
                  className="auth-submit-btn w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>
                      Create Your Account
                    </>
                  )}
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>

        <Modal.Footer className="auth-modal-footer border-0">
          <div className="w-100 text-center">
            <small className="auth-footer-text">
              <i className="fas fa-shield-alt me-1"></i>
              Your information is secure and protected
            </small>
          </div>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default AuthModal;
