import { useCartStore } from '../../stores/cart.js';
import { getFeaturedProducts } from '../../services/products.js';
import { showToast } from '../ui/Toast.js';

export function FeaturedCards() {
  const featured = getFeaturedProducts(6);
  const cart = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);

  return (
    <section className="section section-alt">
      <div className="section-eyebrow reveal">Featured Selection</div>
      <h2 className="section-title-lg reveal">
        Today's<br /><em style={{ fontStyle: 'italic' }}>Finest</em>
      </h2>
      <div className="section-rule reveal"></div>
      <div id="featured-cards" className="h-scroll" style={{ margin: '0 -24px', padding: '4px 24px 16px' }}>
        {featured.map((p) => {
          const qty = cart[p.id] ?? 0;
          const hasPhoto = p.image && !p.image.startsWith('data:image/svg');
          const imgArea = hasPhoto
            ? `<img src="${p.image}" alt="${p.name}" class="feat-card-img feat-card-img-photo">`
            : `<div class="feat-card-img">${p.emoji}</div>`;

          return (
            <div className="feat-card" key={p.id}>
              {hasPhoto ? (
                <img src={p.image!} alt={p.name} className="feat-card-img feat-card-img-photo" />
              ) : (
                <div className="feat-card-img">{p.emoji}</div>
              )}
              <div className="feat-card-body">
                <div className="feat-card-name">{p.name}</div>
                <div className="feat-card-sub">{p.sub}</div>
                <div className="feat-card-price">
                  {'\u20B9'}{p.price} <span style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 400 }}>/ kg</span>
                </div>
                <div className="feat-card-footer">
                  <div className="qty-row">
                    <button className="qty-btn" onClick={() => updateQty(p.id, -1)}>&minus;</button>
                    <span className="qty-val" id={`feat-qty-${p.id}`}>{qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(p.id, 1)}>+</button>
                  </div>
                  <button className="btn btn-aqua btn-sm" onClick={() => { addItem(p.id); showToast('Added to order'); }}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="section-action reveal">
        <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = '/products'}>
          See All Products &rarr;
        </button>
      </div>
    </section>
  );
}
