# 🏢 ERP System - Complete Enterprise Resource Planning Solution

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)

A modern, full-stack ERP (Enterprise Resource Planning) system built with React.js, Node.js, Express, and MongoDB. Features comprehensive authentication, product management, email verification, and Google OAuth integration.

## 🚀 **Features**

### 🔐 **Authentication & Security**
- **Email OTP Verification** - Secure 6-digit OTP system with 10-minute expiration
- **Google OAuth Integration** - One-click sign-in with Google accounts
- **JWT Token Authentication** - Secure session management
- **Password Encryption** - bcrypt hashing for secure password storage
- **Role-based Access Control** - Admin and user roles with different permissions

### 📧 **Email System**
- **Professional Email Templates** - Beautiful HTML emails with branding
- **OTP Verification Emails** - Secure verification codes with security warnings
- **Welcome Emails** - Automated welcome messages for new users
- **Gmail SMTP Integration** - Reliable email delivery via Gmail

### 🛍️ **Product Management**
- **Product CRUD Operations** - Complete product lifecycle management
- **Category Management** - Organize products by categories
- **Brand Management** - Track product brands and manufacturers
- **Image Upload** - Secure file upload with image optimization
- **Guest Browsing** - Allow visitors to browse products without registration

### 🎨 **User Experience**
- **Responsive Design** - Mobile-first Bootstrap 5 interface
- **Real-time Validation** - Instant form validation and feedback
- **Loading States** - Professional loading indicators and progress bars
- **Toast Notifications** - User-friendly success/error messages
- **Dark/Light Themes** - Modern gradient designs and animations

---

## 📁 **Project Structure**

```
ERP/
├── 📄 README.md                    # This comprehensive guide
├── 📄 package.json                 # Backend dependencies
├── 📄 .env                         # Environment variables
├── 📄 .gitignore                   # Git ignore rules
│
├── 🔧 server/                      # Backend (Node.js + Express)
│   ├── 📄 index.js                 # Main server file
│   ├── 🔐 middleware/
│   │   ├── auth.js                 # JWT authentication middleware
│   │   └── upload.js               # File upload middleware
│   ├── 🗃️ models/
│   │   ├── User.js                 # User schema with OTP fields
│   │   ├── Product.js              # Product schema
│   │   ├── Category.js             # Category schema
│   │   └── Brand.js                # Brand schema
│   ├── 🛣️ routes/
│   │   ├── auth.js                 # Authentication endpoints
│   │   ├── googleAuth.js           # Google OAuth endpoints
│   │   ├── products.js             # Product management APIs
│   │   ├── categories.js           # Category management APIs
│   │   ├── brands.js               # Brand management APIs
│   │   └── upload.js               # File upload APIs
│   ├── 📧 services/
│   │   └── emailService.js         # Email sending service
│   └── 🔧 utils/
│       └── otpUtils.js             # OTP generation utilities
│
├── 💻 client/                      # Frontend (React.js)
│   ├── 📄 package.json             # Frontend dependencies
│   ├── 🔧 src/
│   │   ├── 📄 App.jsx               # Main React component
│   │   ├── 📄 index.js              # React entry point
│   │   ├── 🔧 components/           # Reusable React components
│   │   ├── 📱 pages/                # Main application pages
│   │   │   ├── Login.js             # Login page with verification check
│   │   │   ├── Register.js          # Registration with OTP flow
│   │   │   ├── VerifyEmail.js       # OTP verification page
│   │   │   ├── Products.js          # Product catalog
│   │   │   ├── Categories.js        # Category management
│   │   │   └── Brands.js            # Brand management
│   │   ├── 🔗 context/              # React Context providers
│   │   │   ├── AuthContext.js       # Authentication state
│   │   │   └── CartContext.js       # Shopping cart state
│   │   └── 🔧 services/             # API service layers
│   │       └── authService.js       # Authentication API calls
│   └── 🔧 public/                   # Static assets
│
└── 📁 uploads/                     # User uploaded files
```

---

## 🛠️ **Installation & Setup**

### **Prerequisites**
- **Node.js** 18.x or higher
- **MongoDB** 6.x or higher
- **Git** for version control
- **Gmail account** for email services

### **1. Clone Repository**
```bash
git clone <repository-url>
cd ERP
```

### **2. Install Dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### **3. Environment Configuration**
Create `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/erp-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### **4. Gmail Setup for Email Service**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account Settings → Security
   - 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use the 16-character password (no spaces!)

### **5. Google OAuth Setup**
1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project
   - Enable Google+ API

2. **Configure OAuth Credentials:**
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized origins: `http://localhost:3000`
   - Copy Client ID and Secret to `.env`

### **6. Database Setup**
```bash
# Start MongoDB (if installed locally)
mongod

# Or use MongoDB Atlas for cloud database
# Update MONGODB_URI in .env with Atlas connection string
```

---

## 🚀 **Running the Application**

### **Development Mode**
```bash
# Terminal 1 - Start Backend Server
npm run dev
# Server runs on: http://localhost:5000

# Terminal 2 - Start Frontend Development Server
cd client
npm start
# React app runs on: http://localhost:3000
```

### **Production Mode**
```bash
# Build React app
cd client
npm run build
cd ..

# Start production server
npm start
```

### **Available Scripts**
```bash
npm run dev          # Start backend with nodemon
npm run client       # Start React development server
npm run build        # Build React app for production
npm run seed         # Seed database with sample data (if available)
```

---

## 🔐 **Authentication System**

### **Registration Flow**
1. **User fills registration form** → Username, Email, Password
2. **System generates 6-digit OTP** → Stored with 10-minute expiration
3. **OTP sent via email** → Professional HTML template with security warnings
4. **User redirected to verification page** → Real-time countdown timer
5. **OTP verification** → Account activated, welcome email sent
6. **Auto-login** → User redirected to products page

### **Login Flow**
1. **Existing users** → Standard email/password login
2. **Unverified users** → Redirected to verification page
3. **Google OAuth users** → One-click sign-in
4. **JWT token generated** → Secure session management

### **Google OAuth Flow**
1. **Click "Continue with Google"** → Google sign-in popup
2. **Account selection** → Google account verification
3. **User creation/login** → Automatic account creation for new users
4. **Immediate activation** → Google users skip email verification
5. **Products page** → Direct access to application

---

## 📧 **Email System Details**

### **OTP Verification Email**
```html
🔐 Email Verification - Complete your ERP System registration

Hello [User Name]!

Your verification code: 123456
⏰ Code expires in 10 minutes

Security Notice:
• Never share this code with anyone
• Code is valid for 10 minutes only  
• Can only be used once

[Professional HTML styling with gradients and branding]
```

### **Welcome Email**
```html
🎉 Welcome to ERP System!
Your account has been created successfully

Hello [User Name]!
Thank you for signing up with ERP System.

What you can do now:
🛍️ Browse Products
🛒 Add to Cart  
👤 Manage Profile
📊 Track Orders

[Beautiful welcome template with call-to-action buttons]
```

---

## 🛡️ **Security Features**

### **Authentication Security**
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **JWT Tokens** - Secure session management
- ✅ **OTP Expiration** - 10-minute security window
- ✅ **Email Verification** - Mandatory for account activation
- ✅ **Input Validation** - Server-side validation with express-validator
- ✅ **Rate Limiting** - Protection against brute force attacks

### **Data Protection**
- ✅ **CORS Configuration** - Proper cross-origin resource sharing
- ✅ **Helmet.js** - Security headers
- ✅ **Environment Variables** - Sensitive data protection
- ✅ **Password Requirements** - Minimum 6 characters
- ✅ **Unique Constraints** - Email and username uniqueness

---

## 🎨 **Frontend Features**

### **User Interface**
- **Modern Design** - Bootstrap 5 with custom gradients
- **Responsive Layout** - Mobile-first approach
- **Loading States** - Professional spinners and progress indicators
- **Form Validation** - Real-time validation with error messages
- **Toast Notifications** - Success/error feedback system

### **Key Components**
- **Layout/GuestLayout** - Different layouts for authenticated/guest users
- **GoogleAuthButton** - Integrated Google Sign-In component
- **VerifyEmail** - OTP verification with countdown timer
- **Products** - Product catalog with search and filters
- **AuthContext** - Global authentication state management

### **Routing**
- **Protected Routes** - Authentication-required pages
- **Guest Routes** - Public access pages
- **Dynamic Redirects** - Based on authentication status
- **Email Verification** - Separate verification flow

---

## 🔧 **API Endpoints**

### **Authentication APIs**
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | User registration with OTP | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/verify-email` | OTP verification | Public |
| POST | `/api/auth/resend-otp` | Resend OTP code | Public |
| POST | `/api/auth/google` | Google OAuth login | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### **Product Management APIs**
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/products` | Get all products | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/categories` | Get categories | Public |
| GET | `/api/brands` | Get brands | Public |

### **File Upload APIs**
| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/upload` | Upload file | Protected |

---

## 🧪 **Testing**

### **Manual Testing Checklist**

#### **Registration Flow Testing**
- [ ] Register with valid email → Receive OTP email
- [ ] Enter correct OTP → Account activated, welcome email sent
- [ ] Try expired OTP → Show error message
- [ ] Resend OTP functionality → New code generated
- [ ] Already registered email → Show appropriate error

#### **Google OAuth Testing**
- [ ] Click Google sign-in → Popup opens
- [ ] Select Google account → Account created/logged in
- [ ] Stay on products page → No redirect to login
- [ ] Check user in database → isActive: true

#### **Login Testing**
- [ ] Verified user login → Success
- [ ] Unverified user login → Redirect to verification
- [ ] Wrong credentials → Show error
- [ ] Google user login → Success

### **Backend Testing**
```bash
# Test server health
curl http://localhost:5000/api/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **"Nothing happens when I sign up"**
**Symptoms:** Registration form submits but no redirect
**Solutions:**
1. Check if both servers are running (port 5000 & 3000)
2. Open browser console for JavaScript errors
3. Verify backend health: http://localhost:5000/api/health
4. Check MongoDB connection
5. Clear browser cache and localStorage

#### **"Google OAuth redirects to login page"**
**Symptoms:** Google sign-in works but immediately redirects to login
**Solutions:**
1. Check if `isActive: true` for Google users in database
2. Verify JWT token generation and validation
3. Check browser console for authentication errors
4. Ensure Google OAuth credentials are correct

#### **"OTP email not received"**
**Symptoms:** Registration successful but no email
**Solutions:**
1. Check spam/junk folder
2. Verify EMAIL_USER and EMAIL_PASS in .env
3. Use Gmail app password (not regular password)
4. Check server logs for email sending errors

#### **"Server connection refused"**
**Symptoms:** Frontend can't connect to backend
**Solutions:**
1. Ensure backend server is running on port 5000
2. Check proxy configuration in client/src/setupProxy.js
3. Verify CORS settings in server/index.js
4. Check firewall/antivirus blocking connections

### **Development Tools**

#### **Server Logs**
Monitor backend server logs for:
- MongoDB connection status
- Email sending confirmations
- Authentication attempts
- Error messages and stack traces

#### **Browser Developer Tools**
- **Console:** JavaScript errors and debug messages
- **Network:** API requests and responses
- **Application:** localStorage tokens and data
- **Sources:** React component debugging

---

## 🏗️ **Architecture Overview**

### **Backend Architecture**
```
Express.js Server
├── Middleware Layer
│   ├── Authentication (JWT)
│   ├── File Upload (Multer)
│   ├── CORS & Security (Helmet)
│   └── Error Handling
├── Routes Layer
│   ├── Authentication Routes
│   ├── Product Management
│   ├── File Upload
│   └── Google OAuth
├── Services Layer
│   ├── Email Service (Nodemailer)
│   ├── OTP Utilities
│   └── Token Generation
└── Data Layer
    ├── MongoDB Models
    ├── Validation Schemas
    └── Database Queries
```

### **Frontend Architecture**
```
React.js Application
├── Component Layer
│   ├── Layout Components
│   ├── Form Components
│   ├── UI Components
│   └── Google OAuth Integration
├── State Management
│   ├── Authentication Context
│   ├── Cart Context
│   └── Local Component State
├── Routing Layer
│   ├── Protected Routes
│   ├── Public Routes
│   └── Dynamic Redirects
└── Service Layer
    ├── API Services
    ├── Authentication Utils
    └── HTTP Interceptors
```

---

## 🔄 **Development Workflow**

### **Feature Development**
1. **Create feature branch** from main
2. **Backend development** - Models, routes, middleware
3. **Frontend development** - Components, pages, integration
4. **Testing** - Manual testing and debugging
5. **Documentation** - Update README if needed
6. **Pull request** with detailed description

### **Database Changes**
1. **Update MongoDB models** in `server/models/`
2. **Create migration scripts** if needed
3. **Test with existing data** to ensure compatibility
4. **Update API documentation** for new fields

### **Authentication Changes**
1. **Backend route updates** in `server/routes/auth.js`
2. **Frontend context updates** in `client/src/context/AuthContext.js`
3. **UI updates** in authentication pages
4. **Test all authentication flows** thoroughly

---

## 📈 **Performance Optimization**

### **Backend Optimizations**
- **Database Indexing** - Optimize MongoDB queries
- **Caching** - Implement Redis for session management
- **Compression** - gzip compression for API responses
- **Rate Limiting** - Prevent abuse and improve performance

### **Frontend Optimizations**
- **Code Splitting** - Lazy loading for routes
- **Image Optimization** - Compress and resize images
- **Bundle Analysis** - Identify and reduce bundle size
- **Caching** - Browser caching for static assets

---

## 🚀 **Deployment**

### **Production Environment Setup**
1. **Update environment variables** for production
2. **Configure production database** (MongoDB Atlas recommended)
3. **Set up email service** with production credentials
4. **Configure domain and SSL** certificates
5. **Set up monitoring** and logging

### **Recommended Hosting**
- **Backend:** Heroku, Railway, or DigitalOcean
- **Frontend:** Vercel, Netlify, or Firebase Hosting
- **Database:** MongoDB Atlas
- **File Storage:** AWS S3 or Cloudinary

---

## 🤝 **Contributing**

### **Code Standards**
- **ES6+ JavaScript** with consistent formatting
- **React Hooks** for functional components
- **Error Handling** with try-catch blocks
- **Comments** for complex logic
- **Consistent Naming** conventions

### **Commit Guidelines**
```
feat: add new authentication feature
fix: resolve email sending issue
docs: update README with deployment guide
style: improve UI components styling
refactor: optimize database queries
```

---

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎉 **Success! Your ERP System is Ready**

This comprehensive ERP system provides:
- ✅ **Secure Authentication** with email verification and Google OAuth
- ✅ **Professional Email System** with OTP verification
- ✅ **Modern React UI** with responsive design
- ✅ **Complete Product Management** with CRUD operations
- ✅ **Production-Ready Architecture** with proper security measures

**Quick Start:**
1. Run `npm install` in root and client directories
2. Configure `.env` with your credentials
3. Start servers: `npm run dev` and `cd client && npm start`
4. Visit http://localhost:3000 and start managing your business!

---

**Built with ❤️ using React.js, Node.js, Express.js, and MongoDB**
