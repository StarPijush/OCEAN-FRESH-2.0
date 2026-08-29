import { getCategoryRepository } from '@oceanfresh/category/repository';
import type { Category } from '@oceanfresh/shared';
import { useEffect, useMemo, useState } from 'react';

import { ProductFilterButton } from '../components/products/ProductFilterButton.js';
import { ProductFilterDrawer } from '../components/products/ProductFilterDrawer.js';
import { ProductSearch } from '../components/products/ProductSearch.js';
import { showToast } from '../components/ui/toastController.js';
import { useReveal } from '../hooks/useReveal.js';
import { productService, type ProductVM, useCartStore } from '../services/index.js';

const ALL_FILTER = { key: 'all', label: 'All' };

export function ProductsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
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
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedCategories, search, products]);

  return (
    <div id="page-products" className="page active">
      <div className="page-header" style={{ top: '56px' }}>
        <div className="product-controls">
          <div className="search-wrapper">
            <ProductSearch value={search} onChange={setSearch} />
          </div>
          <div className="filter-wrapper">
            <ProductFilterButton onClick={() => setFilterOpen(true)} />
          </div>
        </div>
      </div>

      <ProductFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        options={filters}
        selected={selectedCategories}
        onSelectedChange={setSelectedCategories}
        resultCount={filtered.length}
      />

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
                className="prod-item prod-premium"
                key={p.id}
                style={p.available ? undefined : { opacity: 0.52 }}
              >
                <div className="prod-media">
                  {hasPhoto ? (
                    <img
                      className="prod-media-img"
                      src={p.image ?? ''}
                      alt={p.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="prod-media-fallback" aria-hidden="true">
                      <span className="prod-media-emoji">{p.emoji}</span>
                    </div>
                  )}
                  {!p.available ? <span className="prod-badge oos">Out of stock</span> : null}
                </div>

                <div className="prod-body">
                  <div className="prod-info">
                    <div className="prod-name">{p.name}</div>
                    <div className="prod-sub">{p.sub}</div>
                    {p.available ? (
                      <div className="prod-price-row">
                        <span className="prod-price">
                          {'\u20B9'}
                          {p.price}
                        </span>
                      </div>
                    ) : (
                      <div className="prod-oos">Out of stock</div>
                    )}
                  </div>

                  {p.available ? (
                    <>
                      <div className="prod-qty">
                        <div className="prod-qty-row">
                          <button
                            className="qty-btn"
                            type="button"
                            aria-label={`Decrease ${p.name} quantity`}
                            onClick={() => updateQty(p.id, -1)}
                          >
                            −
                          </button>
                          <span className="qty-val" aria-live="polite">
                            {qty}
                          </span>
                          <button
                            className="qty-btn"
                            type="button"
                            aria-label={`Increase ${p.name} quantity`}
                            onClick={() => updateQty(p.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="prod-cta">
                        <button
                          className="btn btn-teal"
                          type="button"
                          onClick={() => {
                            addItem(p.id);
                            showToast('Added to order');
                          }}
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="prod-unavailable">
                      <span className="tag-pill">Unavailable</span>
                    </div>
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
