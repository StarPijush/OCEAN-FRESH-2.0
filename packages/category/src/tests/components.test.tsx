import { CategoryStatus } from '@oceanfresh/shared';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CategoryBadge } from '../components/category-badge.js';
import { CategoryBreadcrumb } from '../components/category-breadcrumb.js';
import { CategoryCard } from '../components/category-card.js';
import { CategorySkeleton } from '../components/category-skeleton.js';
import { CategoryStatusBadge } from '../components/category-status-badge.js';
import { CategoryTable } from '../components/category-table.js';
import { CategoryTree } from '../components/category-tree.js';

const mockCategory = {
  id: '1',
  name: 'Fresh Seafood',
  slug: 'fresh-seafood',
  description: 'All types of fresh seafood',
  parentId: null,
  path: '',
  level: 0,
  sortOrder: 1,
  status: CategoryStatus.ACTIVE,
  visibility: 'public' as const,
  featured: true,
  thumbnail: null,
  banner: null,
  icon: null,
  seo: null,
  metadata: {},
  productCount: 42,
  createdBy: 'user-1',
  updatedBy: null,
  version: 1,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('CategoryCard', () => {
  it('renders category name', () => {
    render(<CategoryCard category={mockCategory} />);
    expect(screen.getByText('Fresh Seafood')).toBeDefined();
  });

  it('renders description when provided', () => {
    render(<CategoryCard category={mockCategory} />);
    expect(screen.getByText('All types of fresh seafood')).toBeDefined();
  });

  it('renders product count', () => {
    render(<CategoryCard category={mockCategory} />);
    expect(screen.getByText('42 products')).toBeDefined();
  });
});

describe('CategoryStatusBadge', () => {
  it('renders Active for active status', () => {
    render(<CategoryStatusBadge status={CategoryStatus.ACTIVE} />);
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('renders Draft for draft status', () => {
    render(<CategoryStatusBadge status={CategoryStatus.DRAFT} />);
    expect(screen.getByText('Draft')).toBeDefined();
  });

  it('renders Hidden for hidden status', () => {
    render(<CategoryStatusBadge status={CategoryStatus.HIDDEN} />);
    expect(screen.getByText('Hidden')).toBeDefined();
  });
});

describe('CategoryBadge', () => {
  it('renders text', () => {
    render(<CategoryBadge text="Popular" />);
    expect(screen.getByText('Popular')).toBeDefined();
  });
});

describe('CategoryTree', () => {
  it('renders empty state when no categories', () => {
    render(<CategoryTree categories={[]} />);
    expect(screen.getByText('No categories found')).toBeDefined();
  });

  it('renders tree nodes', () => {
    const nested = [{ ...mockCategory, children: [] }];
    render(<CategoryTree categories={nested} />);
    expect(screen.getByText('Fresh Seafood')).toBeDefined();
  });
});

describe('CategoryBreadcrumb', () => {
  it('renders ancestors and current', () => {
    const ancestors = [{ ...mockCategory, id: '1', name: 'Food' }];
    const current = { ...mockCategory, id: '2', name: 'Seafood' };
    render(<CategoryBreadcrumb ancestors={ancestors} current={current} />);
    expect(screen.getByText('Food')).toBeDefined();
    expect(screen.getByText('Seafood')).toBeDefined();
  });

  it('returns null when no data', () => {
    const { container } = render(<CategoryBreadcrumb ancestors={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('CategorySkeleton', () => {
  it('renders correct number of card skeletons', () => {
    const { container } = render(<CategorySkeleton count={3} variant="card" />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(3);
  });

  it('renders tree skeleton', () => {
    const { container } = render(<CategorySkeleton count={2} variant="tree" />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(2);
  });

  it('renders table skeleton', () => {
    const { container } = render(<CategorySkeleton count={2} variant="table" />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(2);
  });
});

describe('CategoryTable', () => {
  it('renders empty state when no categories', () => {
    render(<CategoryTable categories={[]} />);
    expect(screen.getByText('No categories found')).toBeDefined();
  });

  it('renders categories in table', () => {
    render(<CategoryTable categories={[mockCategory]} />);
    expect(screen.getByText('Fresh Seafood')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
  });
});
