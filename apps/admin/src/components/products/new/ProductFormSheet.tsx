import { type Category, type Product, ProductUnit } from '@oceanfresh/shared';
import { useEffect, useState } from 'react';

import { pickAndCompressImage } from '../../../services/product-image';
import { Button } from '../../ui/new/Button';
import { Checkbox } from '../../ui/new/Checkbox';
import { Input } from '../../ui/new/Input';
import { Select } from '../../ui/new/Select';
import { Sheet } from '../../ui/new/Sheet';
import { Textarea } from '../../ui/new/Textarea';

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  unit: ProductUnit;
  minOrderQuantity: number;
  featured: boolean;
  available: boolean;
  image: { localUri: string } | null;
  removeImage: boolean;
}

interface Props {
  visible: boolean;
  product: Product | null;
  categories: Category[];
  saving: boolean;
  error: string | null;
  onSave: (values: ProductFormValues) => Promise<void>;
  onClose: () => void;
}

export function ProductFormSheet({
  visible,
  product,
  categories,
  saving,
  error,
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState<ProductUnit>(ProductUnit.KG);
  const [minQty, setMinQty] = useState('1');
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [image, setImage] = useState<{ localUri: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? '');
      setPrice(String(product.price));
      setCategoryId(product.categoryId);
      setStock(String(product.stock));
      setUnit(product.unit ?? ProductUnit.KG);
      setMinQty(String(product.minOrderQuantity ?? 1));
      setFeatured(!!product.featured);
      setAvailable(product.status === 'ACTIVE');
      setImage(null);
      setImagePreview(product.thumbnail || null);
      setRemoveImage(false);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(categories[0]?.id ?? '');
      setStock('10');
      setUnit(ProductUnit.KG);
      setMinQty('1');
      setFeatured(false);
      setAvailable(true);
      setImage(null);
      setImagePreview(null);
      setRemoveImage(false);
    }
  }, [product, visible, categories]);

  const handlePick = async () => {
    try {
      const picked = await pickAndCompressImage();
      if (picked) {
        setImage({ localUri: picked.localUri });
        setImagePreview(picked.localUri);
        setRemoveImage(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    const p = parseFloat(price);
    const s = parseInt(stock, 10);
    const m = parseInt(minQty, 10);
    if (!name.trim()) return;
    if (isNaN(p) || p <= 0) return;
    await onSave({
      name: name.trim(),
      description: description.trim(),
      price: p,
      categoryId,
      stock: isNaN(s) ? 0 : s,
      unit,
      minOrderQuantity: isNaN(m) ? 1 : m,
      featured,
      available,
      image,
      removeImage,
    });
  };

  return (
    <Sheet
      isOpen={visible}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add Product'}
      size="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error ? <div style={errStyle}>{error}</div> : null}

        <Input
          label="Product Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rohu"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="River fish, fresh catch..."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Price (₹) *"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="220"
            type="number"
          />
          <Input
            label="Stock *"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="10"
            type="number"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Min Order Qty *"
            value={minQty}
            onChange={(e) => setMinQty(e.target.value)}
            type="number"
          />
          <Select
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as ProductUnit)}
            options={[
              { value: 'KG', label: 'KG' },
              { value: 'PIECE', label: 'PIECE' },
              { value: 'DOZEN', label: 'DOZEN' },
            ]}
          />
        </div>
        <Select
          label="Category *"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Select category"
        />

        <div>
          <span style={labelStyle}>Product Photo</span>
          <div onClick={() => void handlePick()} style={uploadStyle}>
            {imagePreview && !removeImage ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-muted)' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                <div style={{ fontSize: 12 }}>Tap to upload a photo</div>
                <div style={{ fontSize: 10, marginTop: 4, color: 'var(--color-muted2)' }}>
                  JPG, PNG, WEBP · Max 2MB
                </div>
              </div>
            )}
          </div>
          {imagePreview && !removeImage ? (
            <button
              type="button"
              onClick={() => {
                setRemoveImage(true);
                setImage(null);
                setImagePreview(null);
              }}
              style={{
                marginTop: 6,
                fontSize: 11,
                color: 'var(--color-warn)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✕ Remove photo
            </button>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Checkbox
            label="Available"
            checked={available}
            onChange={(e) => setAvailable(e.currentTarget.checked)}
          />
          <Checkbox
            label="Featured on Home"
            checked={featured}
            onChange={(e) => setFeatured(e.currentTarget.checked)}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={() => void handleSave()}>
            {product ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: 'var(--color-muted)',
  marginBottom: 6,
  display: 'block',
};
const uploadStyle: React.CSSProperties = {
  border: '1.5px dashed var(--color-border2)',
  borderRadius: 8,
  cursor: 'pointer',
  overflow: 'hidden',
  background: 'var(--color-surface2)',
  minHeight: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const errStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--color-warn)',
  background: 'var(--color-warn-dim)',
  borderLeft: '2px solid var(--color-warn)',
  padding: '10px 12px',
  borderRadius: 4,
};
