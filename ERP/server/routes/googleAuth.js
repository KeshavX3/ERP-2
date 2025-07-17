const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { generateToken } = require('../middleware/auth');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { generateOTP, generateOTPExpiration } = require('../utils/otpUtils');

const router = express.Router();

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login route
router.post('/google', async (req, res) => {
  console.log('=== Google OAuth Route Hit ===');
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      // Update user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
      }
      
      // Check if user is already verified and active
      if (user.isEmailVerified && user.isActive) {
        // User is already fully verified, login directly
        const token = generateToken(user._id);
        
        return res.status(200).json({
          success: true,
          message: 'Google authentication successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified
          }
        });
      }
      
      // User exists but not verified, send OTP for verification
      const otp = generateOTP();
      user.emailVerificationOTP = otp;
      user.otpExpires = generateOTPExpiration();
      await user.save();
      
      // Send OTP email
      try {
        await emailService.sendOTPEmail(user.email, user.name, otp);
        console.log(`📧 OTP sent to existing Google user ${user.email}`);
      } catch (emailError) {
        console.error(`⚠️ Failed to send OTP to ${user.email}:`, emailError.message);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Please verify your email with the OTP sent to your email address',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
    } else {
      // Create new user
      console.log('Creating new Google user:', { name, email, googleId });
      
      // For Google users, generate a unique username from email
      let username = email.split('@')[0];
      
      // Check if username already exists and make it unique if needed
      let existingUser = await User.findOne({ username: username });
      let counter = 1;
      while (existingUser) {
        username = `${email.split('@')[0]}${counter}`;
        existingUser = await User.findOne({ username: username });
        counter++;
      }
      
      // Generate OTP for email verification
      const otp = generateOTP();
      
      user = new User({
        name: name,
        username: username,  // Unique username for Google users
        email: email,
        googleId: googleId,
        avatar: picture,
        role: 'user', // Default role for Google sign-up users
        isEmailVerified: false, // Google users also need to verify their email with OTP
        isActive: false, // Will be activated after OTP verification
        emailVerificationOTP: otp,
        otpExpires: generateOTPExpiration()
        // Note: password is not required for Google users due to the function check
      });

      console.log('New user object created:', user);
      await user.save();
      console.log('New user saved successfully:', user._id);
      
      // Send OTP email for verification
      try {
        await emailService.sendOTPEmail(email, name, otp);
        console.log(`📧 OTP verification email sent to new Google user ${email}`);
      } catch (emailError) {
        console.error(`⚠️ Failed to send OTP to new Google user ${email}:`, emailError.message);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Account created! Please verify your email with the OTP sent to your email address',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
    }

  } catch (error) {
    console.error('Google OAuth error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.message && error.message.includes('Token used too early')) {
      return res.status(400).json({ message: 'Invalid token timing. Please try again.' });
    }
    
    if (error.message && error.message.includes('Invalid token')) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    // Check for MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'User creation failed', 
        errors: validationErrors 
      });
    }

    // Check for duplicate key errors
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyPattern);
      return res.status(400).json({ 
        message: 'User with this email or Google ID already exists' 
      });
    }

    res.status(500).json({ 
      message: 'Google authentication failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
