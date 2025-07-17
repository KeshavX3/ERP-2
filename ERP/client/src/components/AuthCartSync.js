import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Component to sync auth state with cart state
const AuthCartSync = () => {
  const { isAuthenticated } = useAuth();
  const { clearCartOnLogout } = useCart();

  useEffect(() => {
    console.log('🔄 AuthCartSync: Authentication state changed:', isAuthenticated);
    // Clear cart when user logs out
    if (!isAuthenticated) {
      console.log('🗑️ AuthCartSync: User not authenticated, clearing cart');
      clearCartOnLogout();
    }
  }, [isAuthenticated, clearCartOnLogout]);

  return null; // This component doesn't render anything
};

export default AuthCartSync;
