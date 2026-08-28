import { type Product, ProductStatus } from '@oceanfresh/shared';
import { useCallback, useDeferredValue, useState } from 'react';

import { ConfirmDialog } from '../components/ActionSheet';
import { PageHeader } from '../components/PageHeader';
import { ProductFilters, ProductFormSheet, ProductTable } from '../components/products';
import type { ProductFormValues } from '../components/products/ProductFormSheet';
import { toast } from '../components/Toast';
import { useBreakpoint } from '../hooks/use-breakpoint';
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from '../hooks/use-products';
import { removeStoredProductImage, uploadProductImage } from '../services/product-image';
import { breakpoints, colors, radius, spacing } from '../theme';
import { errorToMessage } from '../utils/error';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED'] as const;

/** Storage path convention mirrors the web admin: products/{id}/thumbnail.webp */
const thumbnailPath = (id: string) => `products/${id}/thumbnail.webp`;

const addBtnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  backgroundColor: colors.aqua,
  borderRadius: radius.md,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 10,
  paddingBottom: 10,
  minHeight: 46,
};

export function ProductsScreen() {
  const { width } = useBreakpoint();
  const [status, setStatus] = useState<string>('ALL');
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
        toast(`✓ ${values.name} updated`, 'success');
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
        toast(`✓ ${values.name} added`, 'success');
      }
      setFormOpen(false);
    } catch (err) {
      const msg = errorToMessage(err);
      setFormError(msg);
      toast(msg, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      if (deleteTarget.categoryId) void removeStoredProductImage(thumbnailPath(deleteTarget.id));
      toast(`"${name}" deleted`, 'success');
      setDeleteTarget(null);
    } catch (err) {
      toast(errorToMessage(err), 'error');
      setDeleteTarget(null);
    }
  };

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
              <span style={{ fontSize: 18 }}>+</span>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Add Product
              </span>
            </button>
          }
        />
        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={categories.data ?? []}
          isDesktop={width >= breakpoints.desktop}
          STATUS_FILTERS={STATUS_FILTERS}
        />
      </div>

      <ProductTable
        products={data?.items ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={refetch}
        categoryNames={categoryNames}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        search={search}
        categoryId={categoryId}
        status={status}
        onAddProduct={openCreate}
      />

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
        message={`Delete "${deleteTarget?.name ?? ''}"? This removes it from the store.`}
        confirmLabel="Delete"
        danger
        loading={deleteProduct.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
