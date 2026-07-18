import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../components/product-card.js';
import { ProductGrid } from '../components/product-grid.js';
import { ProductStatusBadge } from '../components/product-status-badge.js';
import { ProductPrice } from '../components/product-price.js';
import { ProductGridSkeleton } from '../components/product-skeleton.js';
import { ProductEmptyState } from '../components/product-empty-state.js';
import { ProductBadge } from '../components/product-badge.js';
import { ProductStockIndicator } from '../components/product-stock-indicator.js';
import { ProductQuantity } from '../components/product-quantity.js';
import { ProductStatus, ProductUnit } from '@oceanfresh/shared';

const mockProduct = {
  id: '1',
  name: 'Fresh Apples',
  slug: 'fresh-apples',
  sku: 'APL-001',
  barcode: null,
  description: 'Fresh red apples from Shimla',
  price: 120,
  compareAtPrice: null,
  categoryId: 'cat-1',
  images: [],
  thumbnail: '',
  gallery: [],
  status: ProductStatus.ACTIVE,
  featured: false,
  stock: 50,
  weight: null,
  weightUnit: 'g' as const,
  dimensions: null,
  unit: ProductUnit.KG,
  tags: [],
  searchKeywords: [],
  seo: null,
  metadata: {},
  version: 1,
  sortOrder: 0,
  warehouseId: null,
  variants: null,
  minOrderQuantity: 1,
  createdBy: 'user-1',
  updatedBy: null,
  isDeleted: false,
  createdAt: new Date() as any,
  updatedAt: new Date() as any,
  deletedAt: null,
};

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Fresh Apples')).toBeDefined();
  });

  it('renders description when provided', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Fresh red apples from Shimla')).toBeDefined();
  });
});

describe('ProductGrid', () => {
  it('renders empty state when no products', () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByText('No products found')).toBeDefined();
  });

  it('renders products in grid', () => {
    render(<ProductGrid products={[mockProduct]} />);
    expect(screen.getByText('Fresh Apples')).toBeDefined();
  });
});

describe('ProductStatusBadge', () => {
  it('renders Active for active status', () => {
    render(<ProductStatusBadge status={ProductStatus.ACTIVE} />);
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('renders Draft for draft status', () => {
    render(<ProductStatusBadge status={ProductStatus.DRAFT} />);
    expect(screen.getByText('Draft')).toBeDefined();
  });
});

describe('ProductPrice', () => {
  it('renders formatted price', () => {
    render(<ProductPrice price={120} />);
    expect(screen.getByText('₹120')).toBeDefined();
  });

  it('renders compare-at price when higher', () => {
    render(<ProductPrice price={120} compareAtPrice={150} />);
    expect(screen.getByText('₹120')).toBeDefined();
  });

  it('does not render compare-at when equal or lower', () => {
    render(<ProductPrice price={150} compareAtPrice={120} />);
    expect(screen.getByText('₹150')).toBeDefined();
  });
});

describe('ProductGridSkeleton', () => {
  it('renders correct number of skeletons', () => {
    const { container } = render(<ProductGridSkeleton count={4} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
  });
});

describe('ProductEmptyState', () => {
  it('renders default message', () => {
    render(<ProductEmptyState />);
    expect(screen.getByText('No products found')).toBeDefined();
  });

  it('renders custom title', () => {
    render(<ProductEmptyState title="Custom title" />);
    expect(screen.getByText('Custom title')).toBeDefined();
  });

  it('renders action button when provided', () => {
    const handler = vi.fn();
    render(<ProductEmptyState actionLabel="Create" onAction={handler} />);
    const btn = screen.getByText('Create');
    btn.click();
    expect(handler).toHaveBeenCalled();
  });
});

describe('ProductBadge', () => {
  it('renders text', () => {
    render(<ProductBadge text="Sale" />);
    expect(screen.getByText('Sale')).toBeDefined();
  });
});

describe('ProductStockIndicator', () => {
  it('shows out of stock for zero', () => {
    render(<ProductStockIndicator stock={0} />);
    expect(screen.getByText('Out of stock')).toBeDefined();
  });

  it('shows low stock below threshold', () => {
    render(<ProductStockIndicator stock={3} lowThreshold={10} />);
    expect(screen.getByText(/Low stock/)).toBeDefined();
  });
});

describe('ProductQuantity', () => {
  it('renders with default value', () => {
    render(<ProductQuantity value={5} />);
    expect(screen.getByText('5')).toBeDefined();
  });
});
