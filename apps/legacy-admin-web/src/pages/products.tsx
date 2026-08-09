import { useCallback, useEffect, useState } from 'react';

import { DeleteModal } from '../components/products/DeleteModal';
import { ProductModal } from '../components/products/ProductModal';
import { useAdminToast } from '../components/shared/use-admin-toast.js';
import { productService } from '../services';
import type { ProductData } from '../types.js';
import { formatCurrency } from '../utils/format.js';
import { imageUtils } from '../utils/image.js';

export function ProductsPage() {
  const { toast } = useAdminToast();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ProductData | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await productService.getAll();
      setProducts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleAvailable = async (id: string) => {
    try {
      const p = await productService.toggleAvailable(id);
      if (p) toast(`${p.name} is now ${p.available ? 'available' : 'unavailable'}`, 'success');
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const p = await productService.toggleFeatured(id);
      if (p) toast(`${p.name} ${p.featured ? 'added to' : 'removed from'} featured`, 'success');
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await productService.remove(deleting.id);
      toast(`${deleting.name} deleted`, 'success');
      setDeleting(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const filtered = products.filter((p) => {
    if (filter !== 'all' && p.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.sub ?? '').toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const filterChips = [
    { id: 'all', label: 'All' },
    { id: 'fresh', label: 'Fresh Fish' },
    { id: 'sea', label: 'Sea Fish' },
    { id: 'prawns', label: 'Prawns' },
    { id: 'crabs', label: 'Crabs' },
  ];

  if (error) {
    return (
      <div id="panel-products" className="admin-panel active">
        <div className="panel-header">
          <div className="panel-eyebrow">Inventory</div>
          <h1 className="panel-title">Products</h1>
        </div>
        <div className="empty-state" style={{ padding: '48px 16px' }}>
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">Could not load products</div>
          <div className="empty-state-sub">{error}</div>
          <button className="btn btn-primary" onClick={load} type="button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="panel-products" className="admin-panel active">
      <div className="panel-header">
        <div className="panel-eyebrow">Inventory</div>
        <h1 className="panel-title">Products</h1>
      </div>

      <div className="flex-between" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div className="search-bar" style={{ maxWidth: '240px' }}>
          <span className="search-bar-icon">🔍</span>
          <input
            className="search-bar-inp"
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Product
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            className={`btn btn-sm prod-filter-btn ${filter === chip.id ? 'active' : 'btn-ghost'}`}
            onClick={() => setFilter(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-head">
          <div className="table-head-title" id="prod-count">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Available · Featured</div>
        </div>

        <div className="table-row header-row">
          <div className="col-emoji" />
          <div className="col-name">Product</div>
          <div className="col-cat">Category</div>
          <div className="col-price">Price</div>
          <div className="col-status">Active</div>
          <div className="col-feat">Featured</div>
          <div className="col-actions">Actions</div>
        </div>

        <div id="products-tbody">
          {loading ? (
            <div className="empty-state" style={{ padding: '48px 16px' }}>
              <div className="spinner" aria-label="Loading products" />
              <div className="empty-state-sub">Loading products…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 16px' }}>
              <div className="empty-state-icon">🐟</div>
              <div className="empty-state-title">No products found</div>
              <div className="empty-state-sub">Try a different filter or search term.</div>
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="table-row">
                <div className="col-img">
                  <div className="col-img-thumb">
                    <img
                      src={p.image ?? imageUtils.PLACEHOLDER}
                      alt={p.name}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (img.src !== imageUtils.PLACEHOLDER) img.src = imageUtils.PLACEHOLDER;
                      }}
                    />
                  </div>
                </div>
                <div className="col-name">
                  <div className="cell-name-main">{p.name}</div>
                  <div className="cell-name-sub">{p.sub}</div>
                </div>
                <div className="col-cat">
                  <span className="badge badge-muted">{p.category}</span>
                </div>
                <div className="col-price" style={{ fontWeight: 600, color: 'var(--aqua)' }}>
                  {formatCurrency(p.price)}
                </div>
                <div className="col-status">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={!!p.available}
                      onChange={() => handleToggleAvailable(p.id)}
                    />
                    <div className="toggle-track" />
                  </label>
                </div>
                <div className="col-feat">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={!!p.featured}
                      onChange={() => handleToggleFeatured(p.id)}
                    />
                    <div className="toggle-track" />
                  </label>
                </div>
                <div className="col-actions">
                  <button className="icon-btn" onClick={() => setEditing(p)} title="Edit">
                    ✏️
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() => setDeleting({ id: p.id, name: p.name })}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAdd && <ProductModal product={null} onClose={() => setShowAdd(false)} onSaved={load} />}
      {editing && (
        <ProductModal product={editing} onClose={() => setEditing(null)} onSaved={load} />
      )}
      {deleting && (
        <DeleteModal
          name={deleting.name}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
