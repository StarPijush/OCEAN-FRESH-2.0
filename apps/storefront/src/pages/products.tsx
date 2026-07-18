import { useState, useMemo } from 'react';
import { useReveal } from '../hooks/useReveal.js';
import { useCartStore } from '../stores/cart.js';
import { getProducts } from '../services/products.js';
import { showToast } from '../components/ui/Toast.js';
import { useNavigate } from 'react-router-dom';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'fresh', label: 'Fresh Fish' },
  { key: 'sea', label: 'Sea Fish' },
  { key: 'prawns', label: 'Prawns' },
  { key: 'crabs', label: 'Crabs' },
];

export function ProductsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const cart = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  useReveal();

  const products = useMemo(() => {
    let list = getProducts();
    if (filter !== 'all') list = list.filter((p) => p.category === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, search]);

  return (
    <div id="page-products" className="page active">
      <div className="page-header" style={{ top: '56px' }}>
        <div className="filter-scroll">
          {FILTERS.map((f) => (
            <div
              key={f.key}
              className={`filter-chip${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </div>
          ))}
        </div>
        <div className="search-wrap">
          <input
            type="text"
            className="search-input"
            placeholder="Search fish\u2026"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div
        id="prod-count-label"
        style={{ padding: '16px 20px 0', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}
      >
        {products.length} Product{products.length !== 1 ? 's' : ''} Available
      </div>

      <div id="product-list" className="prod-list">
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{'\u{1F50D}'}</div>
            <div className="empty-title">Nothing found</div>
            <div className="empty-sub">Try a different filter or search term.</div>
          </div>
        ) : (
          products.map((p) => {
            const qty = cart[p.id] ?? 0;
            const hasPhoto = p.image && !p.image.startsWith('data:image/svg');
            return (
              <div className="prod-item" key={p.id} style={p.available ? undefined : { opacity: 0.5 }}>
                {hasPhoto ? (
                  <div className="prod-emoji-box">
                    <img src={p.image!} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }} />
                  </div>
                ) : (
                  <div className="prod-emoji-box">{p.emoji}</div>
                )}
                <div className="prod-info">
                  <div className="prod-sub">{p.sub}</div>
                  <div className="prod-name">{p.name}</div>
                  {p.available ? (
                    <div className="prod-price">{'\u20B9'}{p.price} / kg</div>
                  ) : (
                    <div className="prod-oos">Out of stock</div>
                  )}
                </div>
                <div className="prod-actions">
                  {p.available ? (
                    <>
                      <div className="qty-row">
                        <button className="qty-btn qty-btn-dark" onClick={() => updateQty(p.id, -1)}>&minus;</button>
                        <span className="qty-val qty-val-dark">{qty}</span>
                        <button className="qty-btn qty-btn-dark" onClick={() => updateQty(p.id, 1)}>+</button>
                      </div>
                      <button className="btn btn-aqua btn-sm" onClick={() => { addItem(p.id); showToast('Added to order'); }}>
                        Add
                      </button>
                    </>
                  ) : (
                    <span className="tag-pill">Unavailable</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
