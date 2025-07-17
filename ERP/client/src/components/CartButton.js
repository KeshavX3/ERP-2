import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { useCart } from '../context/CartContext';

const CartButton = ({ onClick, variant = "outline-primary" }) => {
  const { getCartItemsCount } = useCart();
  const itemCount = getCartItemsCount();

  return (
    <Button variant={variant} onClick={onClick} className="position-relative">
      <i className="fas fa-shopping-cart me-1"></i>
      Cart
      {itemCount > 0 && (
        <Badge 
          bg="danger" 
          pill 
          className="position-absolute top-0 start-100 translate-middle"
          style={{ fontSize: '0.7rem' }}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;
