import { type Product, ProductStatus } from '@oceanfresh/shared';
import { useCallback, useDeferredValue, useState } from 'react';

import { ProductFilters, ProductFormSheet, ProductList } from '../../components/products/new';
import type { ProductFormValues } from '../../components/products/new/ProductFormSheet';
import { Button } from '../../components/ui/new/Button';
import { useToast } from '../../components/ui/new/Toast';
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from '../../hooks/use-products';
import { removeStoredProductImage, uploadProductImage } from '../../services/product-image';
import { errorToMessage } from '../../utils/error';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'DRAFT', 'OUT_OF_STOCK', 'ARCHIVED'] as const;
const thumbnailPath = (id: string) => `products/${id}/thumbnail.webp`;

export function ProductsScreen() {
  const { show: toast } = useToast();
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
    <div style={{ flex: 1, background: 'var(--color-bg)', minHeight: '100%' }}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 300,
                color: 'var(--color-cream)',
              }}
            >
              Products
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-muted2)', marginTop: 4 }}>
              Manage what&apos;s for sale and how it looks on the storefront.
            </div>
          </div>
          <Button variant="primary" onClick={openCreate}>
            + Add Product
          </Button>
        </div>
        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={categories.data ?? []}
          STATUS_FILTERS={STATUS_FILTERS}
        />
      </div>

      {isLoading ? (
        <div style={{ padding: 20, color: 'var(--color-muted2)' }}>Loading…</div>
      ) : isError ? (
        <div style={{ padding: 20 }}>
          <div style={{ color: 'var(--color-warn)', marginBottom: 12 }}>
            {errorToMessage(error)}
          </div>
          <Button variant="ghost" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <ProductList
          products={data?.items ?? []}
          categoryNames={categoryNames}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
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

      {deleteTarget ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            padding: 20,
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border2)',
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                color: 'var(--color-cream)',
                marginBottom: 8,
              }}
            >
              Delete product
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-muted2)', marginBottom: 20 }}>
              Delete &quot;{deleteTarget.name}&quot;? This removes it from the store.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleteProduct.isPending}
                onClick={() => void handleDelete()}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
