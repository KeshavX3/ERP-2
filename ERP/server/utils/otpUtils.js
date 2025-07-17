// Utility functions for OTP generation and validation

/**
 * Generate a 6-digit OTP code
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP expiration time (10 minutes from now)
 * @returns {Date} Expiration date
 */
const generateOTPExpiration = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Check if OTP has expired
 * @param {Date} expirationTime 
 * @returns {boolean} True if expired
 */
const isOTPExpired = (expirationTime) => {
  return new Date() > expirationTime;
};

/**
 * Validate OTP format (6 digits)
 * @param {string} otp 
 * @returns {boolean} True if valid format
 */
const isValidOTPFormat = (otp) => {
  return /^\d{6}$/.test(otp);
};

module.exports = {
  generateOTP,
  generateOTPExpiration,
  isOTPExpired,
  isValidOTPFormat
};
