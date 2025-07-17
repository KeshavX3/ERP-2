const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Create a transporter using Gmail SMTP
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASS  // Your Gmail app password
        }
      });

      // Verify the connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      console.log('💡 Please configure EMAIL_USER and EMAIL_PASS in your .env file');
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    if (!this.transporter) {
      console.log('⚠️ Email service not configured, skipping welcome email');
      return false;
    }

    try {
      const mailOptions = {
        from: {
          name: 'ERP System',
          address: process.env.EMAIL_USER
        },
        to: userEmail,
        subject: '🎉 Welcome to ERP System - Account Created Successfully!',
        html: this.generateWelcomeEmailTemplate(userName, userEmail)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully to:', userEmail);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
      return false;
    }
  }

  generateWelcomeEmailTemplate(userName, userEmail) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ERP System</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .header .emoji {
                font-size: 48px;
                margin-bottom: 15px;
                display: block;
            }
            .content {
                padding: 40px 30px;
            }
            .welcome-message {
                font-size: 18px;
                color: #555;
                margin-bottom: 25px;
                text-align: center;
            }
            .user-info {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 25px 0;
                border-radius: 5px;
            }
            .features {
                margin: 30px 0;
            }
            .feature-item {
                display: flex;
                align-items: center;
                margin: 15px 0;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 5px;
            }
            .feature-icon {
                font-size: 24px;
                margin-right: 15px;
                width: 40px;
                text-align: center;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
                color: white;
                text-decoration: none;
            }
            .footer {
                background: #2c3e50;
                color: #ecf0f1;
                padding: 25px 30px;
                text-align: center;
                font-size: 14px;
            }
            .footer a {
                color: #3498db;
                text-decoration: none;
            }
            .social-links {
                margin: 15px 0;
            }
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #3498db;
                font-size: 18px;
                text-decoration: none;
            }
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 0;
                }
                .header, .content, .footer {
                    padding: 20px;
                }
                .header h1 {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="emoji">🎉</span>
                <h1>Welcome to ERP System!</h1>
                <p>Your account has been created successfully</p>
            </div>
            
            <div class="content">
                <div class="welcome-message">
                    <strong>Hello ${userName}!</strong><br>
                    Thank you for signing up with ERP System. We're excited to have you on board!
                </div>
                
                <div class="user-info">
                    <h3 style="margin-top: 0; color: #667eea;">📧 Account Details</h3>
                    <p><strong>Name:</strong> ${userName}</p>
                    <p><strong>Email:</strong> ${userEmail}</p>
                    <p><strong>Account Status:</strong> <span style="color: #27ae60; font-weight: 600;">✅ Active</span></p>
                </div>
                
                <div class="features">
                    <h3 style="color: #667eea;">🚀 What you can do now:</h3>
                    
                    <div class="feature-item">
                        <span class="feature-icon">🛍️</span>
                        <div>
                            <strong>Browse Products</strong><br>
                            <small>Explore our wide range of products and categories</small>
                        </div>
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">🛒</span>
                        <div>
                            <strong>Add to Cart</strong><br>
                            <small>Build your wishlist and manage your shopping cart</small>
                        </div>
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">👤</span>
                        <div>
                            <strong>Manage Profile</strong><br>
                            <small>Update your personal information and preferences</small>
                        </div>
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">📊</span>
                        <div>
                            <strong>Track Orders</strong><br>
                            <small>Monitor your order history and status</small>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/products" class="cta-button">
                        🚀 Start Shopping Now
                    </a>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 25px 0;">
                    <h4 style="margin-top: 0; color: #856404;">💡 Quick Tip:</h4>
                    <p style="margin-bottom: 0; color: #856404;">
                        You can sign in anytime using your email and password, or use the convenient 
                        "Sign in with Google" option for faster access!
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>ERP System Team</strong></p>
                <p>Thank you for choosing us for your business needs!</p>
                
                <div class="social-links">
                    <a href="#" title="Facebook">📘</a>
                    <a href="#" title="Twitter">🐦</a>
                    <a href="#" title="LinkedIn">💼</a>
                    <a href="#" title="Instagram">📷</a>
                </div>
                
                <p style="font-size: 12px; color: #95a5a6; margin-top: 20px;">
                    This email was sent to ${userEmail} because you created an account on ERP System.<br>
                    If you didn't create this account, please contact our support team.
                </p>
                
                <p style="font-size: 12px; color: #95a5a6;">
                    © ${new Date().getFullYear()} ERP System. All rights reserved.<br>
                    <a href="http://localhost:3000" style="color: #3498db;">Visit our website</a> | 
                    <a href="#" style="color: #3498db;">Contact Support</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async sendPasswordResetEmail(userEmail, resetToken) {
    if (!this.transporter) {
      console.log('⚠️ Email service not configured, skipping password reset email');
      return false;
    }

    try {
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: {
          name: 'ERP System',
          address: process.env.EMAIL_USER
        },
        to: userEmail,
        subject: '🔒 Password Reset Request - ERP System',
        html: this.generatePasswordResetTemplate(userEmail, resetLink)
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully to:', userEmail);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      return false;
    }
  }

  generatePasswordResetTemplate(userEmail, resetLink) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - ERP System</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: #e74c3c; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset the password for your ERP System account (${userEmail}).</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Reset My Password</a>
                </div>
                <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} ERP System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async sendOTPEmail(userEmail, userName, otp) {
    if (!this.transporter) {
      console.log('⚠️ Email service not configured, skipping OTP email');
      return false;
    }

    try {
      const mailOptions = {
        from: {
          name: 'ERP System',
          address: process.env.EMAIL_USER
        },
        to: userEmail,
        subject: '🔐 Email Verification Code - ERP System',
        html: this.generateOTPEmailTemplate(userName, userEmail, otp)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully to:', userEmail);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      return false;
    }
  }

  generateOTPEmailTemplate(userName, userEmail, otp) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - ERP System</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .header .emoji {
                font-size: 48px;
                margin-bottom: 15px;
                display: block;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .otp-container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                margin: 30px 0;
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
            }
            .otp-code {
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 8px;
                margin: 15px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .otp-label {
                font-size: 14px;
                opacity: 0.9;
                margin-bottom: 10px;
            }
            .instructions {
                background: #f8f9fa;
                border-left: 4px solid #4CAF50;
                padding: 20px;
                margin: 25px 0;
                border-radius: 5px;
                text-align: left;
            }
            .warning-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 25px 0;
                color: #856404;
            }
            .footer {
                background: #2c3e50;
                color: #ecf0f1;
                padding: 25px 30px;
                text-align: center;
                font-size: 14px;
            }
            .timer {
                background: #ff6b6b;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                display: inline-block;
                margin: 15px 0;
                font-weight: 600;
            }
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 0;
                }
                .header, .content, .footer {
                    padding: 20px;
                }
                .otp-code {
                    font-size: 28px;
                    letter-spacing: 4px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="emoji">🔐</span>
                <h1>Email Verification</h1>
                <p>Complete your ERP System registration</p>
            </div>
            
            <div class="content">
                <h2 style="color: #4CAF50; margin-top: 0;">Hello ${userName}!</h2>
                <p style="font-size: 16px; color: #666;">
                    Thank you for signing up with ERP System! To complete your registration and 
                    secure your account, please verify your email address using the code below.
                </p>
                
                <div class="otp-container">
                    <div class="otp-label">YOUR VERIFICATION CODE</div>
                    <div class="otp-code">${otp}</div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        Enter this code on the verification page
                    </div>
                </div>
                
                <div class="timer">⏰ Code expires in 10 minutes</div>
                
                <div class="instructions">
                    <h4 style="margin-top: 0; color: #4CAF50;">📋 Verification Steps:</h4>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li>Go back to the ERP System verification page</li>
                        <li>Enter the 6-digit code: <strong>${otp}</strong></li>
                        <li>Click "Verify Email" to complete registration</li>
                        <li>Start shopping and exploring our products!</li>
                    </ol>
                </div>
                
                <div class="warning-box">
                    <h4 style="margin-top: 0;">🛡️ Security Notice:</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>This code is valid for <strong>10 minutes only</strong></li>
                        <li>Never share this code with anyone</li>
                        <li>If you didn't request this, please ignore this email</li>
                        <li>The code can only be used once</li>
                    </ul>
                </div>
                
                <p style="margin-top: 30px; color: #666;">
                    Having trouble? The verification page should still be open in your browser. 
                    If not, please return to <a href="http://localhost:3000/verify-email" style="color: #4CAF50;">the verification page</a>.
                </p>
            </div>
            
            <div class="footer">
                <p><strong>ERP System Security Team</strong></p>
                <p>This is an automated security email for account verification.</p>
                
                <p style="font-size: 12px; color: #95a5a6; margin-top: 20px;">
                    This verification code was sent to ${userEmail} for ERP System registration.<br>
                    If you didn't create an account, please ignore this email.
                </p>
                
                <p style="font-size: 12px; color: #95a5a6;">
                    © ${new Date().getFullYear()} ERP System. All rights reserved.<br>
                    <a href="http://localhost:3000" style="color: #3498db;">Visit our website</a> | 
                    <a href="#" style="color: #3498db;">Contact Support</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new EmailService();
