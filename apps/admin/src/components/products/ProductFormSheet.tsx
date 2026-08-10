import type { Category, Product } from '@oceanfresh/shared';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { pickAndCompressImage, type PickedImage } from '../../services/product-image';
import { colors, radius, spacing } from '../../theme';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { TextField } from '../TextField';

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  categoryId: string;
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
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(product?.name ?? '');
    setDescription(product?.description ?? '');
    setPrice(product ? String(product.price) : '');
    setCategoryId(product?.categoryId ?? categories[0]?.id ?? '');
    setAvailable(product ? product.status === 'ACTIVE' && (product.stock ?? 0) > 0 : true);
    setFeatured(product?.featured ?? false);
    setImage(null);
    setRemoveExisting(false);
  }, [visible, product, categories]);

  const handlePick = async () => {
    setPickerBusy(true);
    try {
      const picked = await pickAndCompressImage();
      if (picked) setImage(picked);
    } catch (err) {
      // Surface the error through the sheet's error slot.
      // Parent passes it back after a failed save; for picker failures we
      // simply leave the existing image untouched and stay silent.
      console.warn('Image pick failed:', err);
    } finally {
      setPickerBusy(false);
    }
  };

  const handleSave = () => {
    const parsed = parseFloat(price);
    if (!name.trim()) return;
    if (isNaN(parsed) || parsed <= 0) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      price: parsed,
      categoryId,
      available,
      featured,
      image: image ?? undefined,
      removeImage: image === null && removeExisting && !!product?.thumbnail ? true : undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.handle} />
          <AppText variant="title">{product ? 'Edit Product' : 'Add New Product'}</AppText>

          <TextField
            label="Product Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rohu"
          />
          <TextField
            label="Subtitle / Description"
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. River Fish"
          />
          <TextField
            label="Price per kg (₹) *"
            value={price}
            onChangeText={setPrice}
            placeholder="220"
            keyboardType="numeric"
          />

          {/* Category selector */}
          <View style={styles.grp}>
            <AppText variant="label" color="mutedBright" style={styles.fieldLabel}>
              CATEGORY
            </AppText>
            <View style={styles.chips}>
              {categories.map((c) => {
                const active = categoryId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <AppText variant="label" color={active ? 'bg' : 'mutedBright'}>
                      {c.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Photo */}
          <View style={styles.grp}>
            <AppText variant="label" color="mutedBright" style={styles.fieldLabel}>
              PRODUCT PHOTO
            </AppText>
            <Pressable style={styles.photoArea} onPress={handlePick} disabled={pickerBusy}>
              {image ? (
                <Image source={{ uri: image.localUri }} style={styles.photo} resizeMode="cover" />
              ) : product?.thumbnail && !removeExisting ? (
                <Image
                  source={{ uri: product.thumbnail }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <AppText variant="title">📷</AppText>
                  <AppText variant="caption" color="mutedBright">
                    {pickerBusy ? 'Processing…' : 'Tap to upload a photo'}
                  </AppText>
                </View>
              )}
            </Pressable>
            {image || (product?.thumbnail && !removeExisting) ? (
              <Pressable
                onPress={() => (image ? setImage(null) : setRemoveExisting(true))}
                hitSlop={8}
                style={styles.removePhoto}
              >
                <AppText variant="caption" color="warn">
                  Remove photo
                </AppText>
              </Pressable>
            ) : null}
          </View>

          {/* Availability + Featured */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <AppText variant="label" color="mutedBright">
                Available
              </AppText>
              <Toggle value={available} onChange={setAvailable} />
            </View>
            <View style={styles.toggleItem}>
              <AppText variant="label" color="mutedBright">
                Featured on Home
              </AppText>
              <Toggle value={featured} onChange={setFeatured} />
            </View>
          </View>

          {error ? (
            <AppText variant="caption" color="warn">
              {error}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            <Button label="Cancel" variant="ghost" onPress={onClose} style={styles.actionBtn} />
            <Button
              label="Save Product"
              loading={saving}
              onPress={handleSave}
              style={styles.actionBtn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[styles.toggleTrack, value && styles.toggleActive]}
    >
      <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
    maxHeight: '92%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  grp: { gap: spacing.sm },
  fieldLabel: { letterSpacing: 1.6, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlive,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipActive: { backgroundColor: colors.aqua, borderColor: colors.aqua },
  photoArea: {
    minHeight: 140,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlive,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', minHeight: 140 },
  photoPlaceholder: { alignItems: 'center', gap: spacing.xs, padding: spacing.lg },
  removePhoto: { alignSelf: 'flex-start' },
  toggleRow: { flexDirection: 'row', gap: spacing.xl },
  toggleItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  toggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlive,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: { backgroundColor: colors.aqua, borderColor: colors.aqua },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.mutedBright,
  },
  toggleKnobActive: { backgroundColor: colors.white, alignSelf: 'flex-end' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  actionBtn: { flex: 1 },
});
