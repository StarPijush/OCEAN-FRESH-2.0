import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { productService, type ProductVM } from '../../services/index.js';

export function FreshCatch() {
  const [products, setProducts] = useState<ProductVM[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    productService.getAll().then((all) => setProducts(all.filter((p) => p.available)));
  }, []);

  return (
    <section className="section fresh-catch-section">
      <div className="section-eyebrow reveal">Live Availability</div>
      <h2 className="section-title-lg reveal">
        Today&apos;s
        <br />
        Fresh Catch
      </h2>
      <div className="section-rule reveal"></div>
      <div id="fresh-catch-list" style={{ marginTop: '8px' }}>
        {products.map((p) => (
          <div className="catch-row-item reveal" key={p.id}>
            <div>
              <div className="catch-fish-name">
                {p.emoji} {p.name}
              </div>
              <div className="catch-fish-sub">{p.sub}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="catch-price">
                {'\u20B9'}
                {p.price}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: '2px' }}>
                per kg
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '24px' }} className="reveal">
        <button className="btn btn-outline-navy" onClick={() => navigate('/products')}>
          Order Now
        </button>
      </div>
    </section>
  );
}
