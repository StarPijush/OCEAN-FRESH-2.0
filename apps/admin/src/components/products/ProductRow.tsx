import { type Product, ProductStatus } from '@oceanfresh/shared';

import { useSetProductStatus, useToggleFeatured } from '../../hooks/use-products';
import { colors, radius, spacing } from '../../theme';
import { formatCurrency } from '../../utils/format';
import { AppText } from '../AppText';
import { Card } from '../Card';
import { Icon } from '../Icon';

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

interface ProductRowProps {
  item: Product;
  categoryName: string;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export function ProductRow({ item, categoryName, onEdit, onDelete }: ProductRowProps) {
  const toggleFeatured = useToggleFeatured();
  const setStatus = useSetProductStatus();
  const available = item.status === ProductStatus.ACTIVE && (item.stock ?? 0) > 0;
  const busy = toggleFeatured.isPending || setStatus.isPending;

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
          onClick={() => {
            if (available) {
              setStatus.mutate({
                id: item.id,
                status: ProductStatus.OUT_OF_STOCK,
                updatedBy: 'admin',
              });
            } else {
              setStatus.mutate({ id: item.id, status: ProductStatus.ACTIVE, updatedBy: 'admin' });
            }
          }}
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
            minHeight: 44,
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
              width: 44,
              height: 44,
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
              width: 44,
              height: 44,
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
              width: 44,
              height: 44,
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

export function ProductRowSkeleton() {
  return (
    <Card style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.md,
          backgroundColor: 'var(--of-surface-alive)',
          animation: 'of-pulse 1.8s ease-in-out infinite',
        }}
      />
      <div style={{ flex: 1, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            width: '60%',
            height: 16,
            backgroundColor: 'var(--of-surface-alive)',
            animation: 'of-pulse 1.8s ease-in-out infinite',
            borderRadius: 4,
          }}
        />
        <div
          style={{
            width: '40%',
            height: 12,
            backgroundColor: 'var(--of-surface-alive)',
            animation: 'of-pulse 1.8s ease-in-out infinite',
            borderRadius: 4,
          }}
        />
        <div
          style={{
            width: '50%',
            height: 12,
            backgroundColor: 'var(--of-surface-alive)',
            animation: 'of-pulse 1.8s ease-in-out infinite',
            borderRadius: 4,
          }}
        />
      </div>
    </Card>
  );
}
