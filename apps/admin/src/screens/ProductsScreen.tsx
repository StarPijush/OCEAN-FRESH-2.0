import { type Product, ProductStatus } from '@oceanfresh/shared';
import { useCallback, useDeferredValue, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ConfirmDialog } from '../components/ActionSheet';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProductFormSheet, type ProductFormValues } from '../components/products/ProductFormSheet';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useSetProductStatus,
  useToggleFeatured,
  useUpdateProduct,
} from '../hooks/use-products';
import { removeStoredProductImage, uploadProductImage } from '../services/product-image';
import { colors, radius, spacing } from '../theme';
import { formatCurrency } from '../utils/format';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED'] as const;

/** Storage path convention mirrors the web admin: products/{id}/thumbnail.webp */
const thumbnailPath = (id: string) => `products/${id}/thumbnail.webp`;

interface RowProps {
  item: Product;
  categoryName: string;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

function ProductRow({ item, categoryName, onEdit, onDelete }: RowProps) {
  const toggleFeatured = useToggleFeatured();
  const setStatus = useSetProductStatus();
  const available = item.status === ProductStatus.ACTIVE && (item.stock ?? 0) > 0;
  const busy = toggleFeatured.isPending || setStatus.isPending;

  const handleToggleAvailable = () => {
    if (available) {
      setStatus.mutate({ id: item.id, status: ProductStatus.OUT_OF_STOCK, updatedBy: 'admin' });
    } else {
      setStatus.mutate({ id: item.id, status: ProductStatus.ACTIVE, updatedBy: 'admin' });
    }
  };

  return (
    <Card style={styles.row}>
      <Image source={{ uri: item.thumbnail || item.images?.[0] }} style={styles.thumb} />
      <View style={styles.rowBody}>
        <AppText variant="bodySemiBold" numberOfLines={1}>
          {item.name}
        </AppText>
        <AppText variant="caption" color="muted">
          {categoryName} · {item.status.replace('_', ' ')}
        </AppText>
        <View style={styles.rowMeta}>
          <AppText variant="bodyMedium">{formatCurrency(item.price)}</AppText>
          {item.featured ? (
            <View style={styles.featuredPill}>
              <AppText variant="caption" color="gold">
                ★ Featured
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.rowActions}>
        <Pressable
          onPress={handleToggleAvailable}
          disabled={busy}
          hitSlop={8}
          style={[styles.avail, available && styles.availOn]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.mutedBright} />
          ) : (
            <AppText variant="label" color={available ? 'bg' : 'mutedBright'}>
              {available ? '• In stock' : '• Out of stock'}
            </AppText>
          )}
        </Pressable>
        <View style={styles.iconRow}>
          <Pressable
            onPress={() => toggleFeatured.mutate(item)}
            disabled={busy}
            hitSlop={8}
            style={[styles.icon, item.featured && styles.iconActive]}
          >
            <AppText variant="label" color={item.featured ? 'gold' : 'muted'}>
              ★
            </AppText>
          </Pressable>
          <Pressable onPress={() => onEdit(item)} hitSlop={8} style={styles.icon}>
            <AppText variant="label" color="aqua">
              ✎
            </AppText>
          </Pressable>
          <Pressable onPress={() => onDelete(item)} hitSlop={8} style={styles.icon}>
            <AppText variant="label" color="warn">
              ✕
            </AppText>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

export function ProductsScreen() {
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [categoryId, setCategoryId] = useState('all');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const categories = useCategories();
  const { data, isLoading, isError, error, refetch } = useProducts({
    search: deferredSearch,
    status,
    categoryId,
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const categoryNames = useCallback(
    (id: string) => categories.data?.find((c) => c.id === id)?.name ?? '',
    [categories.data],
  );

  const openCreate = () => {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFormError(null);
    setFormOpen(true);
  };

  const handleSave = async (values: ProductFormValues) => {
    setFormError(null);
    const statusFor = values.available ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK;
    const stockFor = values.available ? 10 : 0;
    try {
      if (editing) {
        let thumbnail = editing.thumbnail;
        if (values.image) {
          const uploaded = await uploadProductImage(editing.id, values.image.localUri);
          thumbnail = uploaded.url;
        } else if (values.removeImage) {
          await removeStoredProductImage(thumbnailPath(editing.id));
          thumbnail = '';
        }
        await updateProduct.mutateAsync({
          id: editing.id,
          data: {
            name: values.name,
            description: values.description,
            price: values.price,
            categoryId: values.categoryId,
            status: statusFor,
            stock: stockFor,
            featured: values.featured,
            thumbnail,
            updatedBy: 'admin',
          },
        });
      } else {
        const id = crypto.randomUUID();
        let thumbnail = '';
        if (values.image) {
          const uploaded = await uploadProductImage(id, values.image.localUri);
          thumbnail = uploaded.url;
        }
        await createProduct.mutateAsync({
          id,
          name: values.name,
          description: values.description,
          price: values.price,
          categoryId: values.categoryId,
          status: statusFor,
          stock: stockFor,
          featured: values.featured,
          thumbnail,
          createdBy: 'admin',
        });
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      if (deleteTarget.categoryId) void removeStoredProductImage(thumbnailPath(deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteTarget(null);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products…"
            placeholderTextColor={colors.muted}
            style={styles.search}
          />
          <Pressable onPress={openCreate} style={styles.addBtn}>
            <AppText variant="label" color="bg">
              ＋ Add
            </AppText>
          </Pressable>
        </View>
        {categories.data && categories.data.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScroll}
          >
            <FilterChip
              label="All"
              active={categoryId === 'all'}
              onPress={() => setCategoryId('all')}
            />
            {categories.data.map((c) => (
              <FilterChip
                key={c.id}
                label={c.name}
                active={categoryId === c.id}
                onPress={() => setCategoryId(c.id === categoryId ? 'all' : c.id)}
              />
            ))}
          </ScrollView>
        ) : null}
        <View style={styles.chips}>
          {STATUS_FILTERS.map((s) => (
            <FilterChip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState message={error?.message ?? null} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <EmptyState title="No products" hint="Try a different search, category or status filter." />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProductRow
              item={item}
              categoryName={categoryNames(item.categoryId)}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          )}
        />
      )}

      <ProductFormSheet
        visible={formOpen}
        product={editing}
        categories={categories.data ?? []}
        saving={createProduct.isPending || updateProduct.isPending}
        error={formError}
        onSave={handleSave}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete product"
        message={`Delete “${deleteTarget?.name ?? ''}”? This removes it from the store.`}
        confirmLabel="Delete"
        danger
        loading={deleteProduct.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <AppText variant="label" color={active ? 'bg' : 'mutedBright'}>
        {label.replace('_', ' ')}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: spacing.md },
  toolbar: { paddingHorizontal: spacing.lg, gap: spacing.md },
  searchRow: { flexDirection: 'row', gap: spacing.md },
  search: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    color: colors.cream,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  addBtn: {
    backgroundColor: colors.aqua,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  chipScroll: { gap: spacing.sm, flexGrow: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipActive: { backgroundColor: colors.aqua, borderColor: colors.aqua },
  list: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.surfaceAlive },
  rowBody: { flex: 1, gap: 2 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featuredPill: {
    backgroundColor: colors.goldDim,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  rowActions: { gap: spacing.sm, alignItems: 'flex-end' },
  avail: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  availOn: { backgroundColor: colors.greenDim, borderColor: colors.green },
  iconRow: { flexDirection: 'row', gap: spacing.sm },
  icon: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  iconActive: { borderColor: colors.gold, backgroundColor: colors.goldDim },
});
