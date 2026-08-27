import { getCategoryRepository } from '@oceanfresh/category/repository';
import type { Category } from '@oceanfresh/shared';
import { useEffect, useMemo, useState } from 'react';

import { showToast } from '../components/ui/toastController.js';
import { useReveal } from '../hooks/useReveal.js';
import { productService, type ProductVM, useCartStore } from '../services/index.js';

const ALL_FILTER = { key: 'all', label: 'All' };

export function ProductsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductVM[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cart = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const addItem = useCartStore((s) => s.addItem);
  useReveal();

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      productService.getAll(),
      getCategoryRepository()
        .findAll()
        .catch((err) => {
          console.warn('Failed to load categories; showing All only.', err);
          return [] as Category[];
        }),
    ])
      .then(([list, cats]) => {
        if (cancelled) return;
        setProducts(list);
        setCategories(cats);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filters = useMemo(() => {
    const dynamic = categories.map((c) => ({ key: c.id, label: c.name }));
    return [ALL_FILTER, ...dynamic];
  }, [categories]);

  const filtered = useMemo(() => {
    let list = products;
    if (filter !== 'all') list = list.filter((p) => p.category === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q),
      );
    }
    return list;
  }, [filter, search, products]);

  return (
    <div id="page-products" className="page active">
      <div className="page-header" style={{ top: '56px' }}>
        <div className="filter-scroll">
          {filters.map((f) => (
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
        style={{
          padding: '16px 20px 0',
          fontSize: '0.6rem',
          color: 'var(--muted)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        {filtered.length} Product{filtered.length !== 1 ? 's' : ''} Available
      </div>

      <div id="product-list" className="prod-list">
        {loading ? (
          <div className="empty-state">
            <div className="spinner" aria-label="Loading products" />
            <div className="empty-sub">Loading products…</div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <div className="empty-title">Could not load products</div>
            <div className="empty-sub">{error}</div>
            <button
              className="btn btn-aqua btn-sm"
              onClick={() => window.location.reload()}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{'\u{1F50D}'}</div>
            <div className="empty-title">Nothing found</div>
            <div className="empty-sub">Try a different filter or search term.</div>
          </div>
        ) : (
          filtered.map((p) => {
            const qty = cart[p.id] ?? 0;
            const hasPhoto = p.image && !p.image.startsWith('data:image/svg');
            return (
              <div
                className="prod-item"
                key={p.id}
                style={p.available ? undefined : { opacity: 0.5 }}
              >
                {hasPhoto ? (
                  <div className="prod-emoji-box">
                    <img
                      src={p.image ?? ''}
                      alt={p.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                ) : (
                  <div className="prod-emoji-box">{p.emoji}</div>
                )}
                <div className="prod-info">
                  <div className="prod-sub">{p.sub}</div>
                  <div className="prod-name">{p.name}</div>
                  {p.available ? (
                    <div className="prod-price">
                      {'\u20B9'}
                      {p.price} / kg
                    </div>
                  ) : (
                    <div className="prod-oos">Out of stock</div>
                  )}
                </div>
                <div className="prod-actions">
                  {p.available ? (
                    <>
                      <div className="qty-row">
                        <button
                          className="qty-btn qty-btn-dark"
                          onClick={() => updateQty(p.id, -1)}
                        >
                          &minus;
                        </button>
                        <span className="qty-val qty-val-dark">{qty}</span>
                        <button className="qty-btn qty-btn-dark" onClick={() => updateQty(p.id, 1)}>
                          +
                        </button>
                      </div>
                      <button
                        className="btn btn-aqua btn-sm"
                        onClick={() => {
                          addItem(p.id);
                          showToast('Added to order');
                        }}
                      >
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
