import { useNavigate } from 'react-router-dom';

import { useCartStore } from '../../services/cart.service.js';
import { CartIcon } from '../ui/Icons.js';

export function FloatingCart() {
  const navigate = useNavigate();
  const count = useCartStore((s) => Object.keys(s.items).length);

  return (
    <div id="floating-cart" className={count > 0 ? 'show' : ''} onClick={() => navigate('/order')}>
      <CartIcon size={20} aria-hidden="true" />
      <span id="floating-cart-count">{count}</span>
    </div>
  );
}
