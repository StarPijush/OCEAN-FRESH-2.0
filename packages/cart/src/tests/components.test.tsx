import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AddToCartButton } from '../components/add-to-cart-button.js';
import { CartEmpty } from '../components/cart-empty.js';
import { CartLoading } from '../components/cart-loading.js';
import { CartSummary } from '../components/cart-summary.js';

describe('CartSummary', () => {
  const sampleTotals = {
    subtotal: { amount: 500, currency: 'INR' },
    tax: { amount: 25, currency: 'INR' },
    shipping: { amount: 0, currency: 'INR' },
    discount: { amount: 0, currency: 'INR' },
    grandTotal: { amount: 525, currency: 'INR' },
  };

  it('renders totals correctly', () => {
    render(<CartSummary totals={sampleTotals} itemCount={3} />);
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
    render(<CartSummary totals={withDiscount} itemCount={3} />);
    expect(screen.getByText('-₹50.00')).toBeDefined();
  });
});

describe('CartEmpty', () => {
  it('renders default message', () => {
    render(<CartEmpty />);
    expect(screen.getByText('Your cart is empty')).toBeDefined();
  });

  it('renders custom message', () => {
    render(<CartEmpty message="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeDefined();
  });
});

describe('AddToCartButton', () => {
  it('renders with default text', () => {
    render(<AddToCartButton onClick={vi.fn()} />);
    expect(screen.getByText('Add to Cart')).toBeDefined();
  });

  it('renders with custom text', () => {
    render(<AddToCartButton onClick={vi.fn()}>Buy Now</AddToCartButton>);
    expect(screen.getByText('Buy Now')).toBeDefined();
  });

  it('is disabled when disabled prop is true', () => {
    render(<AddToCartButton onClick={vi.fn()} disabled />);
    expect(screen.getByRole('button')).toHaveProperty('disabled', true);
  });
});

describe('CartLoading', () => {
  it('renders loading skeleton', () => {
    const { container } = render(<CartLoading />);
    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });
});
