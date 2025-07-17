import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AuthCartSync from './components/AuthCartSync';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import GuestLayout from './components/GuestLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Brands from './pages/Brands';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <AuthCartSync />
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/products" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/products" /> : <Register />} 
          />
          <Route 
            path="/verify-email" 
            element={isAuthenticated ? <Navigate to="/products" /> : <VerifyEmail />} 
          />
          
          {/* Guest Browsing Routes - No authentication required */}
          <Route 
            path="/" 
            element={<Navigate to="/products" />}
          />
          <Route 
            path="/products" 
            element={
              isAuthenticated ? (
                <Layout>
                  <Products />
                </Layout>
              ) : (
                <GuestLayout>
                  <Products />
                </GuestLayout>
              )
            } 
          />
          <Route 
            path="/categories" 
            element={
              <ErrorBoundary>
                {isAuthenticated ? (
                  <Layout>
                    <Categories />
                  </Layout>
                ) : (
                  <GuestLayout>
                    <Categories />
                  </GuestLayout>
                )}
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/brands" 
            element={
              <ErrorBoundary>
                {isAuthenticated ? (
                  <Layout>
                    <Brands />
                  </Layout>
                ) : (
                  <GuestLayout>
                    <Brands />
                  </GuestLayout>
                )}
              </ErrorBoundary>
            } 
          />
        
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/products" />} />
        </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
    </CartProvider>
  );
}

export default App;
