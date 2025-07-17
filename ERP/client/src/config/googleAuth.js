// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your actual Google Client ID

// For development, you can use a placeholder
// In production, this should be set via environment variables
export const googleConfig = {
  clientId: GOOGLE_CLIENT_ID,
  scope: 'email profile',
  cookiePolicy: 'single_host_origin',
};
