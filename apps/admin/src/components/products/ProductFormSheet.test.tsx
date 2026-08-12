import { type Category, CategoryStatus, type Product, type Timestamp } from '@oceanfresh/shared';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductFormSheet } from './ProductFormSheet';

vi.mock('../../services/product-image', () => ({
  pickAndCompressImage: vi.fn(async () => null),
}));

function makeTimestamp(date = new Date('2026-01-01T00:00:00.000Z')): Timestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
    toMillis: () => date.getTime(),
  };
}

function makeCategory(id: string, name: string): Category {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const timestamp = makeTimestamp();
  return {
    id,
    name,
    slug,
    description: '',
    parentId: null,
    path: slug,
    level: 1,
    sortOrder: 0,
    status: CategoryStatus.ACTIVE,
    visibility: 'public',
    featured: false,
    thumbnail: null,
    banner: null,
    icon: null,
    seo: null,
    metadata: {},
    productCount: 0,
    createdBy: 'system',
    updatedBy: null,
    version: 1,
    isDeleted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };
}

const CATEGORIES: Category[] = [
  makeCategory('cat-freshwater-0001', 'Freshwater Fish'),
  makeCategory('cat-sea-0002', 'Sea Fish'),
];

const onSave = vi.fn();
const onClose = vi.fn();

function renderSheet(product: Product | null = null) {
  return render(
    <ProductFormSheet
      visible
      product={product}
      categories={CATEGORIES}
      saving={false}
      error={null}
      onSave={onSave}
      onClose={onClose}
    />,
  );
}

describe('ProductFormSheet', () => {
  beforeEach(() => {
    onSave.mockReset();
    onClose.mockReset();
  });

  it('submits the selected category by its UUID, never by a slug', () => {
    renderSheet();
    fireEvent.change(screen.getByLabelText('Product Name *'), { target: { value: 'Rohu' } });
    fireEvent.change(screen.getByLabelText('Price (₹) *'), { target: { value: '320' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sea Fish' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Product' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const values = onSave.mock.calls[0][0];
    expect(values.categoryId).toBe('cat-sea-0002');
    expect(values.categoryId).not.toBe('sea');
    expect(values.categoryId).not.toBe('fresh');
  });

  it('defaults to the first category when creating', () => {
    renderSheet();
    fireEvent.change(screen.getByLabelText('Product Name *'), { target: { value: 'Rohu' } });
    fireEvent.change(screen.getByLabelText('Price (₹) *'), { target: { value: '320' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Product' }));
    expect(onSave.mock.calls[0][0].categoryId).toBe('cat-freshwater-0001');
  });

  it('pre-selects the product category when editing', () => {
    renderSheet({
      id: 'p1',
      name: 'Pomfret',
      price: 450,
      categoryId: 'cat-sea-0002',
      status: 'ACTIVE',
      stock: 5,
      unit: 'KG',
      minOrderQuantity: 1,
      featured: false,
      thumbnail: '',
    } as unknown as Product);
    fireEvent.click(screen.getByRole('button', { name: 'Save Product' }));
    expect(onSave.mock.calls[0][0].categoryId).toBe('cat-sea-0002');
  });

  it('shows validation errors and does not save without a price', () => {
    renderSheet();
    fireEvent.change(screen.getByLabelText('Product Name *'), { target: { value: 'Rohu' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Product' }));
    expect(screen.getByText('Enter a price above ₹0.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
