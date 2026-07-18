import { useState, useRef, useEffect } from 'react';
import { productRepository, imageRepository } from '../../repositories';
import type { ProductData } from '../../repositories/types';
import { useAdminToast } from '../shared/AdminToast';

interface Props {
  product: ProductData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductModal({ product, onClose, onSaved }: Props) {
  const isEdit = !!product;
  const { toast } = useAdminToast();
  const [name, setName] = useState(product?.name ?? '');
  const [sub, setSub] = useState(product?.sub ?? '');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [cat, setCat] = useState(product?.category ?? 'fresh');
  const [available, setAvailable] = useState(product?.available ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [emoji, setEmoji] = useState(imageRepository.extractEmoji(product?.image ?? '') || '🐟');
  const [imageData, setImageData] = useState<string | null>(product?.image ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isRealPhoto = imageData !== null && !imageData.startsWith('data:image/svg');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSub(product.sub ?? '');
      setPrice(String(product.price));
      setCat(product.category ?? 'fresh');
      setAvailable(product.available ?? true);
      setFeatured(product.featured ?? false);
      setEmoji(imageRepository.extractEmoji(product.image ?? '') || '🐟');
      setImageData(product.image ?? null);
    }
  }, [product]);

  const handleImageUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast('Image is too large. Max 2MB.', 'error');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImageData(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageData(null);
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    if (!name.trim()) { toast('Product name is required', 'error'); return; }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) { toast('Enter a valid price', 'error'); return; }

    setSaving(true);
    try {
      let finalImage = imageData;

      if (imageFile && imageData) {
        finalImage = await imageRepository.compressImage(imageData, 600, 0.7);
      } else if (!finalImage || finalImage.startsWith('data:image/svg')) {
        finalImage = imageRepository.generateEmojiImage(emoji);
      }

      const data = {
        name: name.trim(),
        sub: sub.trim(),
        price: parsedPrice,
        category: cat,
        available,
        featured,
        image: finalImage,
        emoji,
        updated_at: Date.now(),
      };

      if (isEdit && product?.id) {
        await productRepository.update(product.id, data);
        toast(`✓ ${name} updated successfully`, 'success');
      } else {
        await productRepository.create(data);
        toast(`✓ ${name} added successfully`, 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Product' : 'Add New Product'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-grp">
          <label className="form-lbl">Product Name</label>
          <input className="form-inp" type="text" placeholder="e.g. Fresh Pomfret" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-grp">
          <label className="form-lbl">Subtitle</label>
          <input className="form-inp" type="text" placeholder="e.g. Whole, medium-sized" value={sub} onChange={e => setSub(e.target.value)} />
        </div>

        <div className="modal-form-grid">
          <div className="form-grp">
            <label className="form-lbl">Price (₹/kg)</label>
            <input className="form-inp" type="number" step="0.01" min="0" placeholder="450" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className="form-grp">
            <label className="form-lbl">Category</label>
            <select className="form-inp" value={cat} onChange={e => setCat(e.target.value)}>
              <option value="fresh">Fresh Fish</option>
              <option value="sea">Sea Fish</option>
              <option value="prawns">Prawns</option>
              <option value="crabs">Crabs</option>
            </select>
          </div>
        </div>

        <div className="modal-form-grid">
          <div className="form-grp">
            <label className="form-lbl">Available</label>
            <label className="toggle" style={{ marginTop: '6px' }}>
              <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} />
              <div className="toggle-track" />
            </label>
          </div>
          <div className="form-grp">
            <label className="form-lbl">Featured</label>
            <label className="toggle" style={{ marginTop: '6px' }}>
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
              <div className="toggle-track" />
            </label>
          </div>
        </div>

        <div className="form-grp">
          <label className="form-lbl">Emoji (fallback)</label>
          <input className="form-inp" type="text" maxLength={2} placeholder="🐟" value={emoji} onChange={e => setEmoji(e.target.value)} />
        </div>

        <div className="form-grp">
          <label className="form-lbl">Product Image</label>
          {isRealPhoto ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <div className="col-img-thumb">
                <img src={imageData!} alt="Preview" />
              </div>
              <button className="btn btn-sm btn-danger" onClick={removeImage}>Remove</button>
            </div>
          ) : (
            <div
              id="prod-img-upload-placeholder"
              style={{
                border: '1px dashed var(--border2)', borderRadius: '3px',
                padding: '16px', textAlign: 'center', cursor: 'pointer', marginTop: '6px',
                color: 'var(--muted)', fontSize: '0.75rem',
              }}
              onClick={() => fileRef.current?.click()}
            >
              Click to upload image (max 2MB)
            </div>
          )}
          <input
            ref={fileRef}
            id="prod-modal-img-file"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
