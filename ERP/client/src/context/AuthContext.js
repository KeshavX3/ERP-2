import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authService.register(username, email, password);
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors || [];
      
      // Show specific validation errors if available
      if (errors.length > 0) {
        errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(message);
      }
      
      return { success: false, error: message, errors };
    }
  };

  const googleAuth = async (credential) => {
    try {
      console.log("🔍 AuthContext: Calling backend with credential");
      const response = await authService.googleAuth(credential);
      console.log("🔍 AuthContext: Raw response from backend:", response);
      console.log("🔍 AuthContext: Response type:", typeof response);
      console.log("🔍 AuthContext: Response keys:", Object.keys(response || {}));
      
      // Check if user needs email verification
      if (response && response.requiresVerification) {
        console.log("✅ AuthContext: User needs verification, returning verification data");
        console.log("✅ AuthContext: Verification data:", {
          userId: response.userId,
          email: response.email,
          message: response.message
        });
        
        toast.success(response.message || 'Please verify your email with the OTP sent to your email address');
        return { 
          success: true, 
          requiresVerification: true,
          userId: response.userId,
          email: response.email
        };
      }
      
      // If no verification needed, proceed with normal login
      console.log("🔍 AuthContext: No verification needed, proceeding with login");
      const { user, token } = response;
      
      if (!user || !token) {
        console.error("❌ AuthContext: Missing user or token in response");
        throw new Error("Invalid response from server - missing user or token");
      }
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success(`Welcome ${user.name}! Login successful!`);
      return { success: true };
    } catch (error) {
      console.error("❌ AuthContext: Google auth error:", error);
      console.error("❌ AuthContext: Error response:", error.response);
      console.error("❌ AuthContext: Error data:", error.response?.data);
      
      const message = error.response?.data?.message || 'Google authentication failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: User logging out, clearing data');
    localStorage.removeItem('token');
    localStorage.removeItem('cart'); // Clear cart data on logout
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
  };

  // Complete verification after OTP success
  const completeVerification = async (token, userEmail) => {
    try {
      // Store the token
      localStorage.setItem('token', token);
      
      // Get user data from the backend using the token
      const response = await authService.getCurrentUser();
      
      if (response && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log("✅ AuthContext: User authenticated after verification:", response.user);
        return { success: true };
      } else {
        throw new Error("Failed to get user data after verification");
      }
    } catch (error) {
      console.error("❌ AuthContext: Failed to complete verification:", error);
      localStorage.removeItem('token');
      return { success: false, error: error.message };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  // Helper functions for role-based access control
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const hasPermission = (permission) => {
    // Guest users can view products, categories, and brands
    const guestPermissions = [
      'view_products',
      'view_categories', 
      'view_brands'
    ];
    
    if (guestPermissions.includes(permission)) {
      return true; // Allow guest access to viewing content
    }
    
    if (!user) return false; // All other permissions require authentication
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Define user permissions
    const userPermissions = [
      'view_products',
      'view_categories', 
      'view_brands',
      'add_to_cart',
      'remove_from_cart',
      'make_payment'
    ];
    
    const adminPermissions = [
      ...userPermissions,
      'create_product',
      'edit_product', 
      'delete_product',
      'create_category',
      'edit_category',
      'delete_category',
      'create_brand',
      'edit_brand',
      'delete_brand'
    ];
    
    const permissions = user.role === 'admin' ? adminPermissions : userPermissions;
    return permissions.includes(permission);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    googleAuth,
    logout,
    completeVerification,
    updateUser,
    isAdmin,
    isUser,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
