import { getCategoryRepository } from '@oceanfresh/category/repository';
import type { Category } from '@oceanfresh/shared';
import { parseWeightInput, type WeightMode } from '@oceanfresh/shared/domain';
import { useEffect, useMemo, useState } from 'react';

import { ProductFilterButton } from '../components/products/ProductFilterButton.js';
import { ProductFilterDrawer } from '../components/products/ProductFilterDrawer.js';
import { ProductSearch } from '../components/products/ProductSearch.js';
import { WeightSelector } from '../components/products/WeightSelector.js';
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
  const cartItems = useCartStore((s) => s.items);
  const setWeight = useCartStore((s) => s.setWeight);
  const [selections, setSelections] = useState<Record<string, string | null>>({});
  const [selectionErrors, setSelectionErrors] = useState<Record<string, string | null>>({});
  const [modes, setModes] = useState<Record<string, WeightMode>>({});
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

  const handleSelectionChange = (
    productId: string,
    display: string | null,
    _grams: number | null,
    err: string | null,
  ) => {
    setSelections((prev) => ({ ...prev, [productId]: display }));
    setSelectionErrors((prev) => ({ ...prev, [productId]: err }));
  };

  const handleModeChange = (productId: string, next: WeightMode) => {
    setModes((prev) => ({ ...prev, [productId]: next }));
    setSelections((prev) => ({ ...prev, [productId]: null }));
    setSelectionErrors((prev) => ({ ...prev, [productId]: null }));
  };

  const handleAddToCart = (p: ProductVM) => {
    if (!p.available) {
      showToast('Out of stock');
      return;
    }
    const mode = modes[p.id] ?? 'GRAM';
    const display = selections[p.id] ?? null;
    if (!display) {
      showToast('Please select a weight');
      return;
    }
    const parsed = parseWeightInput(display, mode);
    if (!parsed.success || parsed.grams == null) {
      showToast(parsed.error ?? 'Invalid weight');
      return;
    }
    if (!parsed.display) return;
    setWeight(p.id, parsed.display, parsed.grams, mode, p.pricePerKg);
    showToast(`Added ${p.name} ${parsed.display} to order`);
  };

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
            const hasPhoto = p.image && !p.image.startsWith('data:image/svg');
            const mode = modes[p.id] ?? 'GRAM';
            const selected = selections[p.id] ?? null;
            const selError = selectionErrors[p.id] ?? null;
            const inCart = cartItems[p.id];
            const canAdd = !!selected && !selError && p.available;
            const categoryName = categories.find((c) => c.id === p.category)?.name ?? '';
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
                    <div
                      className="prod-category"
                      style={{
                        fontSize: '0.62rem',
                        color: 'var(--color-text-light-secondary)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        minHeight: '14px',
                        marginTop: '2px',
                        lineHeight: 1.2,
                      }}
                      aria-hidden={categoryName ? undefined : true}
                    >
                      {categoryName}
                    </div>
                    <div className="prod-price-row">
                      <span className="prod-price">
                        {'\u20B9'}
                        {p.pricePerKg}
                      </span>
                      <span
                        className="prod-price-unit"
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--color-text-light-secondary)',
                          marginLeft: 4,
                        }}
                      >
                        / kg
                      </span>
                    </div>
                    {!p.available ? <div className="prod-oos">Out of stock</div> : null}
                  </div>

                  <div style={{ padding: '8px 10px 0' }}>
                    <WeightSelector
                      pricePerKg={p.pricePerKg}
                      mode={mode}
                      value={selected}
                      onModeChange={(m) => handleModeChange(p.id, m)}
                      onChange={(d, g, e) => handleSelectionChange(p.id, d, g, e)}
                      disabled={!p.available}
                    />
                  </div>
                  <div
                    style={{
                      padding: '6px 10px 0',
                      fontSize: 11,
                      color: '#0f766e',
                      textAlign: 'center',
                      fontWeight: 600,
                      minHeight: '18px',
                      visibility: inCart ? 'visible' : 'hidden',
                    }}
                    aria-hidden={!inCart}
                  >
                    {inCart
                      ? `In cart: ${inCart.display} · ₹${inCart.lineTotal}`
                      : 'In cart: placeholder'}
                  </div>
                  <div className="prod-cta">
                    <button
                      className="btn btn-teal"
                      type="button"
                      disabled={!canAdd}
                      aria-disabled={!canAdd}
                      onClick={() => handleAddToCart(p)}
                      title={!selected ? 'Select weight first' : (selError ?? undefined)}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
