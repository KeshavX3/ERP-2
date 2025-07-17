import React, { useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const GoogleAuthButton = ({ onSuccess, onError, buttonText = "Continue with Google", disabled = false }) => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Only initialize if Google Client ID is properly configured
    if (!googleClientId || googleClientId === 'your-google-client-id-here') {
      return;
    }

    // Initialize Google Identity Services when component mounts
    const initializeGoogleAuth = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        // Render the Google button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "continue_with",
              shape: "rectangular"
            }
          );
        }
      } else {
        // Retry if Google services not loaded yet
        setTimeout(initializeGoogleAuth, 100);
      }
    };

    initializeGoogleAuth();
  }, [googleClientId]);

  const handleCredentialResponse = async (response) => {
    try {
      console.log("Google credential response:", response);
      
      if (response.credential) {
        // Pass the credential to the parent component (AuthModal)
        // The AuthModal will handle calling the backend via AuthContext
        onSuccess({ credential: response.credential });
      }
    } catch (error) {
      console.error('Google credential processing error:', error);
      if (onError) {
        onError(error);
      } else {
        toast.error(`Google authentication failed: ${error.message}`);
      }
    }
  };

  // Don't render if no Google Client ID is configured
  if (!googleClientId || googleClientId === 'your-google-client-id-here') {
    return (
      <div className="google-auth-placeholder">
        <Button variant="outline-secondary" className="w-100" disabled>
          <i className="fas fa-cog me-2"></i>
          Google OAuth Not Configured
        </Button>
        <small className="text-muted mt-1 d-block text-center">
          Please configure REACT_APP_GOOGLE_CLIENT_ID in .env file
        </small>
      </div>
    );
  }

  return (
    <div className="google-auth-container">
      {/* Custom styled wrapper */}
      <div 
        ref={googleButtonRef} 
        style={{ 
          width: '100%',
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto'
        }}
      />
    </div>
  );
};

export default GoogleAuthButton;
