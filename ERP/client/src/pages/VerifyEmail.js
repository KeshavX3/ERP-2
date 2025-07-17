import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { completeVerification } = useAuth();
  
  // Get user data from registration or Google OAuth
  let userData = location.state?.userData || location.state;
  
  // If no data in location.state, check sessionStorage (for Google OAuth)
  if (!userData || (!userData.userId && !userData.email)) {
    const pendingVerification = sessionStorage.getItem('pendingVerification');
    if (pendingVerification) {
      try {
        userData = JSON.parse(pendingVerification);
        console.log("📋 VerifyEmail: Loaded data from sessionStorage:", userData);
      } catch (error) {
        console.error("❌ VerifyEmail: Error parsing sessionStorage data:", error);
      }
    }
  }
  
  const userEmail = userData?.email || '';
  const userId = userData?.userId || '';
  const fromGoogleAuth = userData?.fromGoogleAuth || false;

  console.log("🔍 VerifyEmail: User data:", { userEmail, userId, fromGoogleAuth });

  useEffect(() => {
    // Redirect if no user data
    if (!userData || !userId || !userEmail) {
      console.error("❌ VerifyEmail: No verification data found");
      toast.error('No verification data found. Please register again.');
      navigate('/register');
      return;
    }
    
    console.log("✅ VerifyEmail: Valid verification data found");

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userData, userId, navigate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          otp: otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Clear any pending verification data
        sessionStorage.removeItem('pendingVerification');
        
        console.log("✅ VerifyEmail: Verification successful, storing token");
        
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        toast.success(data.message || 'Email verified successfully! Welcome!');
        console.log("✅ VerifyEmail: Token stored, redirecting to products");
        
        // Use window.location.href for complete page reload and auth state refresh
        window.location.href = '/products';
        
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New verification code sent to your email!');
        setTimeLeft(600); // Reset timer to 10 minutes
        setCanResend(false);
        setOtp(''); // Clear current OTP
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📧</div>
                <h2 className="fw-bold text-primary mb-3">Verify Your Email</h2>
                <p className="text-muted">
                  We've sent a 6-digit verification code to<br />
                  <strong>{userEmail}</strong>
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="fas fa-key me-2"></i>
                    Verification Code
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit code"
                    className="form-control-lg text-center"
                    style={{ 
                      fontSize: '24px', 
                      letterSpacing: '8px',
                      fontWeight: 'bold'
                    }}
                    maxLength="6"
                    disabled={loading}
                    autoFocus
                  />
                  <Form.Text className="text-muted">
                    Enter the code exactly as received in your email
                  </Form.Text>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-3 fw-semibold"
                  disabled={loading || otp.length !== 6}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle me-2"></i>
                      Verify Email
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                {timeLeft > 0 ? (
                  <div className="text-muted">
                    <i className="fas fa-clock me-2"></i>
                    Code expires in: <strong className="text-danger">{formatTime(timeLeft)}</strong>
                  </div>
                ) : (
                  <div className="text-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Your verification code has expired
                  </div>
                )}
              </div>

              <div className="text-center mt-3">
                <span className="text-muted">Didn't receive the code? </span>
                <Button
                  variant="link"
                  className="p-0 fw-semibold"
                  onClick={handleResendOTP}
                  disabled={!canResend || resendLoading}
                >
                  {resendLoading ? (
                    <>
                      <Spinner size="sm" className="me-1" />
                      Sending...
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="fw-semibold text-primary mb-2">
                  <i className="fas fa-info-circle me-2"></i>
                  Quick Tips:
                </h6>
                <ul className="small text-muted mb-0">
                  <li>Check your spam/junk folder if you don't see the email</li>
                  <li>The code is valid for 10 minutes only</li>
                  <li>Each code can only be used once</li>
                  <li>Make sure you enter all 6 digits</li>
                </ul>
              </div>

              <div className="text-center mt-4">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/register')}
                  className="me-3"
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Register
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => navigate('/login')}
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Already have account?
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyEmail;
