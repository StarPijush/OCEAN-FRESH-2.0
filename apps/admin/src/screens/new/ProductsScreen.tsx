import { type Product, ProductStatus, ProductUnit } from '@oceanfresh/shared';
import { useDeferredValue, useState } from 'react';

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
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const categories = useCategories();
  const { data, isLoading, isError, error, refetch } = useProducts({
    search: deferredSearch,
    status,
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

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
    // stock/minOrderQuantity kept for DB compatibility (NOT NULL constraint), but ignored in UI
    const stockFor = values.available ? 10 : 0;
    const minQtyFor = 1;
    try {
      if (editing) {
        let thumbnail = editing.thumbnail;
        if (values.image) {
          const uploaded = await uploadProductImage(editing.id, values.image.localUri);
          thumbnail = uploaded.url;
          // P2: release temporary blob: URL after successful upload (not remote https)
          if (values.image.localUri.startsWith('blob:')) URL.revokeObjectURL(values.image.localUri);
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
            unit: ProductUnit.KG,
            minOrderQuantity: minQtyFor,
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
          if (values.image.localUri.startsWith('blob:')) URL.revokeObjectURL(values.image.localUri);
        }
        await createProduct.mutateAsync({
          id,
          name: values.name,
          description: values.description,
          price: values.price,
          categoryId: values.categoryId,
          status: statusFor,
          stock: stockFor,
          unit: ProductUnit.KG,
          minOrderQuantity: minQtyFor,
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
    <div style={{ flex: 1, background: '#F4F6F5', minHeight: '100%' }}>
      <div style={{ padding: '32px 24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#0B130F',
                lineHeight: 1.2,
              }}
            >
              Products
            </div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.875rem',
                color: '#6C7E75',
                marginTop: 4,
              }}
            >
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
          STATUS_FILTERS={STATUS_FILTERS}
        />
      </div>

      {isLoading ? (
        <div
          style={{ padding: 24, color: '#879A91', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Loading…
        </div>
      ) : isError ? (
        <div style={{ padding: 24 }}>
          <div
            style={{
              color: '#EF4444',
              marginBottom: 12,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {errorToMessage(error)}
          </div>
          <Button variant="ghost" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <ProductList products={data?.items ?? []} onEdit={openEdit} onDelete={setDeleteTarget} />
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
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(11,19,15,0.5)',
            backdropFilter: 'blur(4px)',
            padding: 20,
            animation: 'fadeIn 200ms var(--ease-out)',
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(11,19,15,0.06)',
              borderRadius: 18,
              padding: 24,
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 30px 60px rgba(11,19,15,0.12)',
              animation: 'scaleIn 200ms var(--ease-out)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#0B130F',
                marginBottom: 8,
              }}
            >
              Delete product
            </div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14,
                color: '#6C7E75',
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
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
