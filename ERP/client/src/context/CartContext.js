import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload)
      };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item._id !== action.payload.id)
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const initializeCart = () => {
      const savedCart = localStorage.getItem('cart');
      const token = localStorage.getItem('token');
      
      console.log('🛒 CartContext: Initializing cart', { hasCart: !!savedCart, hasToken: !!token });
      
      // Only load cart if user is authenticated
      if (savedCart && token) {
        try {
          const cartItems = JSON.parse(savedCart);
          console.log('📦 CartContext: Loading saved cart items:', cartItems.length);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('❌ Error loading cart from localStorage:', error);
        }
      } else if (!token) {
        // Clear cart if no token (user not authenticated)
        console.log('🗑️ CartContext: No token found, clearing cart data');
        localStorage.removeItem('cart');
        dispatch({ type: 'CLEAR_CART' });
      }
    };

    // Delay initialization slightly to let auth context initialize first
    const timer = setTimeout(initializeCart, 100);
    return () => clearTimeout(timer);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } else {
      localStorage.removeItem('cart');
    }
  }, [state.items]);

  // Monitor authentication changes and clear cart when user logs out
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token was removed (user logged out)
        dispatch({ type: 'CLEAR_CART' });
        localStorage.removeItem('cart');
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addToCart = (product, onAuthRequired) => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      // If onAuthRequired callback is provided, call it to show auth modal
      if (onAuthRequired) {
        onAuthRequired();
        return;
      }
      // Fallback to toast warning if no callback provided
      toast.warning('Please login to add items to cart');
      return;
    }

    // Calculate discountPrice for cart
    const productWithDiscountPrice = {
      ...product,
      discountPrice: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price
    };
    dispatch({ type: 'ADD_TO_CART', payload: productWithDiscountPrice });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    toast.info('Item removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cart');
    toast.info('Cart cleared');
  };

  const clearCartOnLogout = () => {
    console.log('🗑️ CartContext: Clearing cart on logout');
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cart');
    // Don't show toast for logout cart clearing
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return state.items.some(item => item._id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCartOnLogout,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
