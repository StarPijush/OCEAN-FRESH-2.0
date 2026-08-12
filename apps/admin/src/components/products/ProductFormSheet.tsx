import { type Category, type Product, ProductUnit } from '@oceanfresh/shared';
import { useEffect, useState } from 'react';

import { pickAndCompressImage, type PickedImage } from '../../services/product-image';
import { colors, radius, spacing } from '../../theme';
import { ActionSheet } from '../ActionSheet';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { TextField } from '../TextField';

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  unit: ProductUnit;
  minOrderQuantity: number;
  available: boolean;
  featured: boolean;
  /** A newly picked image to upload on save. */
  image?: PickedImage;
  /** True when the existing photo should be removed. */
  removeImage?: boolean;
}

interface Props {
  visible: boolean;
  /** Existing product when editing, null when creating. */
  product: Product | null;
  categories: Category[];
  saving: boolean;
  error: string | null;
  onSave: (values: ProductFormValues) => void;
  onClose: () => void;
}

interface Errors {
  name?: string;
  price?: string;
  category?: string;
  stock?: string;
  minOrder?: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <AppText variant="caption" color="muted" style={styles.sectionLabel}>
      {children}
    </AppText>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        backgroundColor: value ? colors.aqua : colors.surfaceAlive,
        border: `1px solid ${value ? colors.aqua : colors.borderStrong}`,
        display: 'flex',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: value ? colors.white : colors.mutedBright,
          alignSelf: value ? 'flex-end' : undefined,
        }}
      />
    </button>
  );
}

function parseNumber(value: string): number | undefined {
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
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
  const [minOrder, setMinOrder] = useState('');
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!visible) return;
    setName(product?.name ?? '');
    setDescription(product?.description ?? '');
    setPrice(product ? String(product.price) : '');
    setCategoryId(product?.categoryId ?? categories[0]?.id ?? '');
    setStock(product ? String(product.stock ?? 0) : '10');
    setUnit(product?.unit ?? ProductUnit.KG);
    setMinOrder(product?.minOrderQuantity ? String(product.minOrderQuantity) : '1');
    setAvailable(product ? product.status === 'ACTIVE' && (product.stock ?? 0) > 0 : true);
    setFeatured(product?.featured ?? false);
    setImage(null);
    setRemoveExisting(false);
    setErrors({});
  }, [visible, product, categories]);

  const handlePick = async () => {
    setPickerBusy(true);
    try {
      const picked = await pickAndCompressImage();
      if (picked) setImage(picked);
    } catch (err) {
      console.warn('Image pick failed:', err);
    } finally {
      setPickerBusy(false);
    }
  };

  const handleSave = () => {
    const parsedPrice = parseNumber(price);
    const parsedStock = parseNumber(stock);
    const parsedMinOrder = parseNumber(minOrder);

    const nextErrors: Errors = {};
    if (!name.trim()) nextErrors.name = 'Product name is required.';
    if (parsedPrice === undefined || parsedPrice <= 0) nextErrors.price = 'Enter a price above ₹0.';
    if (!categoryId) nextErrors.category = 'Choose a category.';
    if (parsedStock === undefined) nextErrors.stock = 'Enter stock as 0 or more.';
    if (parsedMinOrder === undefined || parsedMinOrder < 1)
      nextErrors.minOrder = 'Minimum order must be at least 1.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice as number,
      categoryId,
      stock: parsedStock as number,
      unit,
      minOrderQuantity: parsedMinOrder as number,
      available,
      featured,
      image: image ?? undefined,
      removeImage: image === null && removeExisting && !!product?.thumbnail ? true : undefined,
    });
  };

  const thumbnailSrc =
    image?.localUri ?? (product?.thumbnail && !removeExisting ? product.thumbnail : null);

  return (
    <ActionSheet
      visible={visible}
      title={product ? 'Edit Product' : 'Add New Product'}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancel" variant="ghost" onPress={onClose} style={styles.actionBtn} />
          <Button
            label="Save Product"
            loading={saving}
            onPress={handleSave}
            style={styles.actionBtn}
          />
        </>
      }
    >
      <SectionLabel>BASIC INFORMATION</SectionLabel>
      <TextField
        label="Product Name *"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Rohu"
        error={errors.name}
      />
      <TextField
        label="Subtitle / Description"
        value={description}
        onChangeText={setDescription}
        placeholder="e.g. River fish, cleaned and cut"
      />

      <div style={styles.grp}>
        <AppText variant="label" color="mutedBright" style={styles.fieldLabel}>
          Category *
        </AppText>
        {categories.length > 0 ? (
          <div style={styles.chips}>
            {categories.map((c) => {
              const active = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  aria-pressed={active}
                  style={active ? { ...styles.chip, ...styles.chipActive } : styles.chip}
                >
                  <AppText variant="label" color={active ? 'bg' : 'mutedBright'}>
                    {c.name}
                  </AppText>
                </button>
              );
            })}
          </div>
        ) : (
          <AppText variant="caption" color="warn">
            No categories available. Add categories first.
          </AppText>
        )}
        {errors.category ? (
          <AppText variant="caption" color="warn">
            {errors.category}
          </AppText>
        ) : null}
      </div>

      <SectionLabel>PRICING</SectionLabel>
      <TextField
        label="Price (₹) *"
        value={price}
        onChangeText={setPrice}
        placeholder="220"
        keyboardType="numeric"
        error={errors.price}
      />

      <SectionLabel>INVENTORY</SectionLabel>
      <div style={styles.rowFields}>
        <div style={styles.half}>
          <TextField
            label="Stock *"
            value={stock}
            onChangeText={setStock}
            placeholder="10"
            keyboardType="numeric"
            error={errors.stock}
            hint="0 hides it from the store."
          />
        </div>
        <div style={styles.half}>
          <TextField
            label="Min order qty *"
            value={minOrder}
            onChangeText={setMinOrder}
            placeholder="1"
            keyboardType="numeric"
            error={errors.minOrder}
          />
        </div>
      </div>

      <div style={styles.grp}>
        <AppText variant="label" color="mutedBright" style={styles.fieldLabel}>
          SOLD IN
        </AppText>
        <div style={styles.chips}>
          {Object.values(ProductUnit).map((u) => {
            const active = unit === u;
            return (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                aria-pressed={active}
                style={active ? { ...styles.chip, ...styles.chipActive } : styles.chip}
              >
                <AppText variant="label" color={active ? 'bg' : 'mutedBright'}>
                  {u === ProductUnit.KG
                    ? 'Per kg'
                    : u === ProductUnit.PIECE
                      ? 'Per piece'
                      : 'Per dozen'}
                </AppText>
              </button>
            );
          })}
        </div>
      </div>

      <SectionLabel>MEDIA</SectionLabel>
      <div style={styles.grp}>
        <button
          type="button"
          onClick={() => void handlePick()}
          disabled={pickerBusy}
          aria-label="Upload product photo"
          style={styles.photoArea}
        >
          {thumbnailSrc ? (
            <img src={thumbnailSrc} alt="Product" style={styles.photo} />
          ) : (
            <span style={styles.photoPlaceholder}>
              <Icon name="image-outline" size={30} color={colors.mutedBright} />
              <AppText variant="caption" color="mutedBright">
                {pickerBusy ? 'Processing…' : 'Tap to upload a photo'}
              </AppText>
            </span>
          )}
        </button>
        {image || (product?.thumbnail && !removeExisting) ? (
          <button
            type="button"
            onClick={() => (image ? setImage(null) : setRemoveExisting(true))}
            style={styles.removePhoto}
          >
            <AppText variant="caption" color="warn">
              Remove photo
            </AppText>
          </button>
        ) : null}
      </div>

      <SectionLabel>VISIBILITY</SectionLabel>
      <div style={styles.toggleRow}>
        <div style={styles.toggleItem}>
          <div style={styles.toggleText}>
            <AppText variant="label" color="mutedBright">
              Available
            </AppText>
            <AppText variant="caption" color="muted">
              Shown in the store when active and in stock.
            </AppText>
          </div>
          <Toggle value={available} onChange={setAvailable} />
        </div>
        <div style={styles.toggleItem}>
          <div style={styles.toggleText}>
            <AppText variant="label" color="mutedBright">
              Featured on Home
            </AppText>
            <AppText variant="caption" color="muted">
              Highlight this product on the storefront.
            </AppText>
          </div>
          <Toggle value={featured} onChange={setFeatured} />
        </div>
      </div>

      {error ? (
        <div style={styles.errorBanner}>
          <Icon name="alert-circle" size={16} color={colors.warn} />
          <AppText variant="caption" color="warn" style={styles.errorText}>
            {error}
          </AppText>
        </div>
      ) : null}
    </ActionSheet>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sectionLabel: {
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    color: colors.aqua,
  },
  grp: { display: 'flex', flexDirection: 'column', gap: spacing.sm },
  fieldLabel: { letterSpacing: 1.6, textTransform: 'uppercase' },
  chips: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    padding: `${spacing.sm + 2}px ${spacing.md}px`,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlive,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    color: colors.mutedBright,
  },
  chipActive: { backgroundColor: colors.aqua, borderColor: colors.aqua, color: colors.bg },
  rowFields: { display: 'flex', flexDirection: 'row', gap: spacing.md },
  half: { flex: 1, minWidth: 0 },
  photoArea: {
    minHeight: 150,
    borderRadius: radius.md,
    border: `1px dashed ${colors.borderStrong}`,
    backgroundColor: colors.surfaceAlive,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    color: colors.mutedBright,
  },
  photo: { width: '100%', minHeight: 150, objectFit: 'cover', display: 'block' },
  photoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
  },
  removePhoto: {
    alignSelf: 'flex-start',
    padding: `${spacing.xs}px 0`,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  toggleRow: { display: 'flex', flexDirection: 'column', gap: spacing.md },
  toggleItem: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggleText: { flex: 1, gap: 1, display: 'flex', flexDirection: 'column' },
  actionBtn: { flex: 1 },
  errorBanner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warnDim,
    border: `1px solid ${colors.warn}`,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { flex: 1, lineHeight: '18px' },
};
