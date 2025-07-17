import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Component to sync auth state with cart state
const AuthCartSync = () => {
  const { isAuthenticated } = useAuth();
  const { clearCartOnLogout } = useCart();
  const previousAuthState = useRef(isAuthenticated);

  useEffect(() => {
    // Only clear cart when user goes from authenticated to not authenticated
    if (previousAuthState.current === true && isAuthenticated === false) {
      console.log('🗑️ AuthCartSync: User logged out, clearing cart');
      clearCartOnLogout();
    }
    
    // Update the previous state
    previousAuthState.current = isAuthenticated;
  }, [isAuthenticated]); // Removed clearCartOnLogout from dependencies

  return null; // This component doesn't render anything
};

export default AuthCartSync;
