import { OrderStatus } from '@oceanfresh/shared';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OrderEmpty } from '../components/order-empty.js';
import { OrderLoading } from '../components/order-loading.js';
import { OrderStatusBadge } from '../components/order-status-badge.js';
import { OrderSummary } from '../components/order-summary.js';

describe('OrderStatusBadge', () => {
  it('renders with formatted status text', () => {
    render(<OrderStatusBadge status={OrderStatus.PENDING_PAYMENT} />);
    expect(screen.getByText('Pending Payment')).toBeDefined();
  });

  it('renders DRAFT status', () => {
    render(<OrderStatusBadge status={OrderStatus.DRAFT} />);
    expect(screen.getByText('Draft')).toBeDefined();
  });

  it('renders DELIVERED status', () => {
    render(<OrderStatusBadge status={OrderStatus.DELIVERED} />);
    expect(screen.getByText('Delivered')).toBeDefined();
  });
});

describe('OrderSummary', () => {
  const sampleTotals = {
    subtotal: { amount: 500, currency: 'INR' },
    tax: { amount: 25, currency: 'INR' },
    shipping: { amount: 0, currency: 'INR' },
    discount: { amount: 0, currency: 'INR' },
    grandTotal: { amount: 525, currency: 'INR' },
  };

  it('renders totals correctly', () => {
    render(<OrderSummary totals={sampleTotals} itemCount={3} />);
    expect(screen.getByText('₹500.00')).toBeDefined();
    expect(screen.getByText('₹25.00')).toBeDefined();
    expect(screen.getByText('FREE')).toBeDefined();
    expect(screen.getByText('₹525.00')).toBeDefined();
  });

  it('shows discount when present', () => {
    const withDiscount = {
      ...sampleTotals,
      discount: { amount: 50, currency: 'INR' },
      grandTotal: { amount: 475, currency: 'INR' },
    };
    render(<OrderSummary totals={withDiscount} itemCount={3} />);
    expect(screen.getByText('-₹50.00')).toBeDefined();
  });
});

describe('OrderEmpty', () => {
  it('renders default message', () => {
    render(<OrderEmpty />);
    expect(screen.getByText('No orders found')).toBeDefined();
  });

  it('renders custom message', () => {
    render(<OrderEmpty message="No results" />);
    expect(screen.getByText('No results')).toBeDefined();
  });
});

describe('OrderLoading', () => {
  it('renders loading skeleton', () => {
    const { container } = render(<OrderLoading />);
    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });
});
