# Guest Access Debug Guide

## Problem: Guest users cannot access brand and categories pages

### Steps to Debug:

#### 1. Check Browser Console
1. Open browser in **incognito/private mode**
2. Navigate to `http://localhost:3000/categories`
3. Open Developer Tools (F12) → Console tab
4. Look for these messages:

**Expected Console Messages:**
```
🏷️ Categories: Component loaded {isAuthenticated: false, hasPermission: true}
🔗 Categories: Testing API connection to: http://localhost:5000/api
✅ Categories: API connection successful
📥 Categories: Loading categories...
✅ Categories: Loaded categories: X
```

**If you see error messages, note them down**

#### 2. Check Backend Server
1. Make sure backend server is running: `cd server && npm start`
2. Test direct API access: `http://localhost:5000/api/categories`
3. Should return JSON with categories data

#### 3. Network Tab Check
1. In browser F12 → Network tab
2. Navigate to categories page
3. Look for failed requests (red status codes)
4. Check if `http://localhost:5000/api/categories` request succeeds

#### 4. Common Issues:

**A. Backend not running:**
- Error: "Network error"
- Solution: Start backend server

**B. Port conflicts:**
- Error: "ECONNREFUSED" 
- Solution: Check if ports 3000 (frontend) and 5000 (backend) are free

**C. CORS issues:**
- Error: "CORS policy"
- Solution: Check server CORS configuration

**D. Database connection:**
- Error: "MongoDB connection failed"
- Solution: Start MongoDB service

#### 5. Manual API Test:
Open new browser tab and go to:
- `http://localhost:5000/api/categories`
- `http://localhost:5000/api/brands`

Both should return JSON data, not errors.

#### 6. Check Authentication Logic:
In console, check if permission system works:
```javascript
// In browser console on categories page:
console.log('Auth state:', window.authState);
```

---

## Quick Fixes to Try:

### Fix 1: Restart servers
```bash
# Terminal 1 (Backend)
cd "e:\New folder\ERP\server"
npm start

# Terminal 2 (Frontend) 
cd "e:\New folder\ERP\client"
npm start
```

### Fix 2: Clear browser cache
1. Clear browser cache/cookies
2. Try incognito mode
3. Hard refresh (Ctrl+F5)

### Fix 3: Check environment
Verify `.env` files have correct settings:
- Frontend: `REACT_APP_API_URL=http://localhost:5000/api`
- Backend: MongoDB connection string

---

**Report back with:**
1. Console error messages
2. Network tab failures  
3. Direct API test results (`http://localhost:5000/api/categories`)
