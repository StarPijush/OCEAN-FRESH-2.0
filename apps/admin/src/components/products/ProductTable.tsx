import type { Product } from '@oceanfresh/shared';

import { colors, radius, spacing } from '../../theme';
import { EmptyState, ErrorState } from '../StateViews';
import { ProductRow, ProductRowSkeleton } from './ProductRow';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  categoryNames: (id: string) => string;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  search: string;
  categoryId: string;
  status: string;
  onAddProduct: () => void;
}

export function ProductTable({
  products,
  isLoading,
  isError,
  error,
  refetch,
  categoryNames,
  onEdit,
  onDelete,
  search,
  categoryId,
  status,
  onAddProduct,
}: ProductTableProps) {
  const openCreate = onAddProduct;

  if (isLoading) {
    return (
      <div
        style={{ padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: spacing.lg }}>
        <ErrorState message={error?.message ?? 'Failed to load products'} onRetry={refetch} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
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
          )
        }
      />
    );
  }

  return (
    <div style={{ padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      {products.map((item) => (
        <ProductRow
          key={item.id}
          item={item}
          categoryName={categoryNames(item.categoryId)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
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
