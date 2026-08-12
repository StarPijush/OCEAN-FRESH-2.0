import { type Product, ProductStatus } from '@oceanfresh/shared';
import { useCallback, useDeferredValue, useState } from 'react';

import { ConfirmDialog } from '../components/ActionSheet';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { FilterChip } from '../components/FilterChip';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { ProductFormSheet, type ProductFormValues } from '../components/products/ProductFormSheet';
import { SearchInput } from '../components/SearchInput';
import { Skeleton } from '../components/Skeleton';
import { EmptyState, ErrorState } from '../components/StateViews';
import { useBreakpoint } from '../hooks/use-breakpoint';
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
import { breakpoints, colors, radius, spacing } from '../theme';
import { errorToMessage } from '../utils/error';
import { formatCurrency } from '../utils/format';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED'] as const;

/** Storage path convention mirrors the web admin: products/{id}/thumbnail.webp */
const thumbnailPath = (id: string) => `products/${id}/thumbnail.webp`;

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  [ProductStatus.ACTIVE]: { label: 'Active', color: colors.green, bg: colors.greenDim },
  [ProductStatus.DRAFT]: { label: 'Draft', color: colors.mutedBright, bg: colors.surfaceAlive },
  [ProductStatus.OUT_OF_STOCK]: { label: 'Out of stock', color: colors.warn, bg: colors.warnDim },
  [ProductStatus.ARCHIVED]: { label: 'Archived', color: colors.muted, bg: colors.surfaceAlive },
  [ProductStatus.COMING_SOON]: { label: 'Coming soon', color: colors.gold, bg: colors.goldDim },
  [ProductStatus.HIDDEN]: { label: 'Hidden', color: colors.muted, bg: colors.surfaceAlive },
  [ProductStatus.PREORDER]: { label: 'Preorder', color: colors.gold, bg: colors.goldDim },
  [ProductStatus.DISCONTINUED]: {
    label: 'Discontinued',
    color: colors.muted,
    bg: colors.surfaceAlive,
  },
};

function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const meta = STATUS_META[status] ?? {
    label: status.replace('_', ' '),
    color: colors.mutedBright,
    bg: colors.surfaceAlive,
  };
  return (
    <AppText
      variant="caption"
      style={{
        color: meta.color,
        backgroundColor: meta.bg,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 3,
        paddingBottom: 3,
        borderRadius: radius.full,
        overflow: 'hidden',
        alignSelf: 'flex-start',
      }}
    >
      {meta.label}
    </AppText>
  );
}

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
    <Card style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      {item.thumbnail || item.images?.[0] ? (
        <img
          src={item.thumbnail || item.images?.[0]}
          alt={item.name}
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceAlive,
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceAlive,
          }}
        />
      )}
      <div style={{ flex: 1, gap: 3, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppText variant="bodySemiBold" numberOfLines={1}>
          {item.name}
        </AppText>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            flexWrap: 'wrap',
          }}
        >
          {categoryName ? (
            <AppText variant="caption" color="muted">
              {categoryName}
            </AppText>
          ) : null}
          <ProductStatusBadge status={item.status} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            flexWrap: 'wrap',
            marginTop: 2,
          }}
        >
          <AppText variant="bodyMedium" color="cream">
            {formatCurrency(item.price)}
          </AppText>
          <AppText variant="caption" color="muted">
            {item.stock > 0 ? `${item.stock} in stock` : 'No stock'}
          </AppText>
          {item.featured ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: colors.goldDim,
                borderRadius: radius.sm,
                paddingLeft: spacing.sm,
                paddingRight: spacing.sm,
                paddingTop: 2,
                paddingBottom: 2,
              }}
            >
              <Icon name="star" size={11} color={colors.gold} />
              <AppText variant="caption" color="gold">
                Featured
              </AppText>
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          gap: spacing.sm,
          alignItems: 'flex-end',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <button
          type="button"
          onClick={handleToggleAvailable}
          disabled={busy}
          className="of-btn"
          aria-label={available ? 'Mark out of stock' : 'Mark in stock'}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            borderRadius: radius.sm,
            paddingLeft: spacing.md,
            paddingRight: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
            backgroundColor: available ? colors.greenDim : colors.surface,
            border: `1px solid ${available ? colors.green : colors.borderStrong}`,
            minHeight: 34,
          }}
        >
          <Icon
            name={available ? 'checkmark-circle' : 'ellipse-outline'}
            size={15}
            color={available ? colors.green : colors.mutedBright}
          />
          <AppText variant="label" color={available ? 'bg' : 'mutedBright'}>
            {available ? 'In stock' : 'Out of stock'}
          </AppText>
        </button>
        <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.sm }}>
          <button
            type="button"
            onClick={() => toggleFeatured.mutate(item)}
            disabled={busy}
            className="of-btn"
            aria-label={item.featured ? 'Remove from featured' : 'Mark as featured'}
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: item.featured ? colors.goldDim : colors.surface,
              border: `1px solid ${item.featured ? colors.gold : colors.borderStrong}`,
            }}
          >
            <Icon
              name={item.featured ? 'star' : 'star-outline'}
              size={18}
              color={item.featured ? colors.gold : colors.mutedBright}
            />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="of-btn"
            aria-label={`Edit ${item.name}`}
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              border: `1px solid ${colors.borderStrong}`,
            }}
          >
            <Icon name="pencil-outline" size={18} color={colors.aqua} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="of-btn"
            aria-label={`Delete ${item.name}`}
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              border: `1px solid ${colors.borderStrong}`,
            }}
          >
            <Icon name="trash-outline" size={18} color={colors.warn} />
          </button>
        </div>
      </div>
    </Card>
  );
}

function ProductRowSkeleton() {
  return (
    <Card style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Skeleton width={56} height={56} radiusValue={radius.md} />
      <div style={{ flex: 1, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="50%" height={12} />
      </div>
    </Card>
  );
}

const addBtnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.sm,
  backgroundColor: colors.aqua,
  borderRadius: radius.md,
  paddingLeft: spacing.lg,
  paddingRight: spacing.lg,
  paddingTop: spacing.md + 2,
  paddingBottom: spacing.md + 2,
  minHeight: 46,
};

export function ProductsScreen() {
  const { width } = useBreakpoint();
  const isDesktop = width >= breakpoints.desktop;
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
    const stockFor = values.available ? Math.max(1, values.stock) : 0;
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
            unit: values.unit,
            minOrderQuantity: values.minOrderQuantity,
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
          unit: values.unit,
          minOrderQuantity: values.minOrderQuantity,
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
    } catch {
      setDeleteTarget(null);
    }
  };

  const categoryChips = (
    <>
      <FilterChip label="All" active={categoryId === 'all'} onPress={() => setCategoryId('all')} />
      {categories.data?.map((c) => (
        <FilterChip
          key={c.id}
          label={c.name}
          active={categoryId === c.id}
          onPress={() => setCategoryId(c.id === categoryId ? 'all' : c.id)}
        />
      ))}
    </>
  );

  return (
    <div style={{ flex: 1, backgroundColor: colors.bg, minHeight: '100%' }}>
      <div
        style={{
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingTop: spacing.lg,
          gap: spacing.md,
          paddingBottom: spacing.sm,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PageHeader
          title="Products"
          subtitle="Manage what's for sale and how it looks on the storefront."
          actions={
            <button type="button" onClick={openCreate} className="of-btn" style={addBtnStyle}>
              <Icon name="add" size={18} color={colors.bg} />
              <AppText variant="label" color="bg">
                Add Product
              </AppText>
            </button>
          }
        />
        <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.md }}>
          <div style={{ flex: 1 }}>
            <SearchInput value={search} onChangeText={setSearch} placeholder="Search products…" />
          </div>
        </div>
        {categories.data && categories.data.length > 0 ? (
          isDesktop ? (
            <div
              style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}
            >
              {categoryChips}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: spacing.sm,
                overflowX: 'auto',
                paddingRight: spacing.sm,
                paddingBottom: 2,
              }}
            >
              {categoryChips}
            </div>
          )
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {STATUS_FILTERS.map((s) => (
            <FilterChip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </div>
      </div>

      {isLoading ? (
        <div
          style={{ padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductRowSkeleton key={i} />
          ))}
        </div>
      ) : isError || !data ? (
        <div style={{ padding: spacing.lg }}>
          <ErrorState message={errorToMessage(error)} onRetry={refetch} />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          title={
            search || categoryId !== 'all' || status !== 'ALL'
              ? 'No products found'
              : 'No products yet'
          }
          hint={
            search || categoryId !== 'all' || status !== 'ALL'
              ? 'Try a different search, category or status filter.'
              : 'Add your first product to start selling.'
          }
          action={
            search || categoryId !== 'all' || status !== 'ALL' ? undefined : (
              <button type="button" onClick={openCreate} className="of-btn" style={addBtnStyle}>
                <Icon name="add" size={18} color={colors.bg} />
                <AppText variant="label" color="bg">
                  Add Product
                </AppText>
              </button>
            )
          }
        />
      ) : (
        <div
          style={{ padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}
        >
          {data.items.map((item) => (
            <ProductRow
              key={item.id}
              item={item}
              categoryName={categoryNames(item.categoryId)}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
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
    </div>
  );
}
