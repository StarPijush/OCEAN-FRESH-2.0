import { useNavigate } from 'react-router-dom';

import { useCartStore } from '../../services/cart.service.js';

export function FloatingCart() {
  const navigate = useNavigate();
  const count = useCartStore((s) => Object.values(s.items).reduce((a, b) => a + b, 0));

  return (
    <div id="floating-cart" className={count > 0 ? 'show' : ''} onClick={() => navigate('/order')}>
      <span>{'\u{1F6D2}'}</span>
      <span id="floating-cart-count">{count}</span>
      <span style={{ letterSpacing: '0.06em' }}>View Order</span>
    </div>
  );
}
