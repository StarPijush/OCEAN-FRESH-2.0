import type { Category, Product } from '@oceanfresh/shared';
import { useEffect, useRef, useState } from 'react';

import { pickAndCompressImage } from '../../../services/product-image';
import { Button } from '../../ui/new/Button';
import { Checkbox } from '../../ui/new/Checkbox';
import { Input } from '../../ui/new/Input';
import { Select } from '../../ui/new/Select';
import { Sheet } from '../../ui/new/Sheet';

export interface ProductFormValues {
  name: string;
  description: string;
  /** Canonical price per 1 KG (₹ per 1000g). DB column "price" stores this. */
  price: number;
  categoryId: string;
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
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [image, setImage] = useState<{ localUri: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  // P1: track identity to avoid resetting on categories ref change
  const prevProductId = useRef<string | null>(null);
  const prevVisible = useRef(false);
  // P2: track previous blob: URL for safe revocation (never revoke current)
  const prevBlobRef = useRef<string | null>(null);

  // P1 Effect A — form identity only (open/close or product.id switch)
  useEffect(() => {
    const isOpen = visible && !prevVisible.current;
    const idChanged = (product?.id ?? null) !== prevProductId.current;
    if (isOpen || idChanged) {
      if (product) {
        setName(product.name);
        setPrice(String(product.price));
        setCategoryId(product.categoryId);
        setFeatured(!!product.featured);
        setAvailable(product.status === 'ACTIVE');
        setImage(null);
        setImagePreview(product.thumbnail || null);
        setRemoveImage(false);
        setPickError(null);
        setValidationError(null);
      } else {
        setName('');
        setPrice('');
        // category init deferred to Effect B — do not touch categoryId here
        setFeatured(false);
        setAvailable(true);
        setImage(null);
        setImagePreview(null);
        setRemoveImage(false);
        setPickError(null);
        setValidationError(null);
      }
      prevProductId.current = product?.id ?? null;
    }
    prevVisible.current = visible;
  }, [product, visible]);

  // P1 Effect B — category init only (never touches image state)
  useEffect(() => {
    if (!product && !categoryId && categories.length) {
      setCategoryId(categories[0].id);
    }
  }, [categories, product, categoryId]);

  // P2: revoke previous blob: URL only when replaced (not current)
  useEffect(() => {
    const prev = prevBlobRef.current;
    if (prev && prev !== imagePreview && prev.startsWith('blob:')) {
      URL.revokeObjectURL(prev);
    }
    prevBlobRef.current = imagePreview;
  }, [imagePreview]);

  // P2: unmount/close cleanup — revoke any lingering temporary blob:
  useEffect(() => {
    return () => {
      if (prevBlobRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(prevBlobRef.current);
      }
    };
  }, []);

  const handlePick = async () => {
    try {
      setPickError(null);
      const picked = await pickAndCompressImage();
      if (picked) {
        // P2: revoke old blob: before overwrite (eager, then effect handles prev)
        if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
        setImage({ localUri: picked.localUri });
        setImagePreview(picked.localUri);
        setRemoveImage(false);
      }
    } catch (e) {
      setPickError('Unable to process this image. Please try another JPG, PNG, or WebP image.');
      console.error(e);
    }
  };

  const handleSave = async () => {
    // Validation — strict: pricePerKg must be positive
    if (!name.trim()) {
      setValidationError('Product name is required.');
      return;
    }
    const p = parseFloat(price);
    if (!price.trim() || isNaN(p) || p <= 0) {
      setValidationError('Price must be a positive number.');
      return;
    }
    if (!categoryId) {
      setValidationError('Category is required.');
      return;
    }
    setValidationError(null);
    await onSave({
      name: name.trim(),
      description: product?.description ?? '',
      price: p,
      categoryId,
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
        {pickError ? <div style={errStyle}>{pickError}</div> : null}
        {validationError ? <div style={errStyle}>{validationError}</div> : null}

        <Input
          label="Product Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rohu"
        />
        <Input
          label="Price / KG (₹) *"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="850"
          type="number"
        />
        <div
          style={{
            fontSize: 11,
            color: '#6C7E75',
            marginTop: -8,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Price for 1 kilogram of this product. Example: ₹850 / KG → 500g costs ₹425, 1.5kg costs
          ₹1275. Customer can buy in grams or kilograms; price is always per KG.
        </div>
        <Select
          label="Availability *"
          value={available ? 'AVAILABLE' : 'OUT_OF_STOCK'}
          onChange={(e) => setAvailable(e.target.value === 'AVAILABLE')}
          options={[
            { value: 'AVAILABLE', label: 'Available' },
            { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
          ]}
        />
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
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  maxHeight: 240,
                  objectFit: 'contain',
                  borderRadius: 8,
                  display: 'block',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
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
                if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
                // prevBlobRef will handle the same on next imagePreview change; clear ref
                prevBlobRef.current = null;
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
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontWeight: 700,
  color: '#0B130F',
  marginBottom: 6,
  display: 'block',
};
const uploadStyle: React.CSSProperties = {
  border: '1px dashed rgba(11,19,15,0.12)',
  borderRadius: 14,
  cursor: 'pointer',
  overflow: 'hidden',
  background: '#F8FAF9',
  minHeight: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const errStyle: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 12,
  color: '#EF4444',
  background: 'rgba(239,68,68,0.08)',
  border: '1px solid rgba(239,68,68,0.14)',
  padding: '10px 12px',
  borderRadius: 10,
};
