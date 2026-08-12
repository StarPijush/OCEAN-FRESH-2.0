import { type Order, OrderSource, OrderStatus } from '@oceanfresh/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrdersScreen } from './OrdersScreen';

const mutate = vi.fn();

function money(amount: number) {
  return { amount, currency: 'INR' };
}

function makeOrder(
  id: string,
  orderNumber: string,
  status: OrderStatus,
  customerName: string,
  phone: string,
  grandTotal: number,
): Order {
  const createdAt = new Date('2026-08-01T10:00:00.000Z');
  return {
    id,
    orderNumber,
    idempotencyKey: `idem-${id}`,
    source: OrderSource.CHECKOUT,
    status,
    createdAt,
    updatedAt: createdAt,
    items: [],
    totals: {
      subtotal: money(500),
      discount: money(0),
      shipping: money(40),
      tax: money(0),
      grandTotal: money(grandTotal),
    },
    customerSnapshot: {
      name: customerName,
      email: customerName === 'Guest' ? null : 'customer@oceanfresh.in',
      phone,
      address: '12 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
    shippingSnapshot: {
      address: '12 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      method: 'Standard',
      amount: money(40),
    },
    billingSnapshot: {
      address: '12 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      gstin: null,
    },
    payment: {
      method: 'COD',
      transactionId: null,
      paidAmount: null,
      paidAt: null,
      gatewayResponse: null,
    },
    timeline: [],
    notes: '',
    cartId: null,
    userId: null,
  };
}

const ORDERS: Order[] = [
  makeOrder('o1', 'OF-1001', OrderStatus.PENDING_PAYMENT, 'Priya Sharma', '9876543210', 540),
  makeOrder('o2', 'OF-1002', OrderStatus.DELIVERED, 'Guest', '9000000000', 360),
];

vi.mock('../hooks/use-orders', () => ({
  useOrders: () => ({
    data: { items: ORDERS },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useOrderCounts: () => ({ data: { total: 2, pending: 1 } }),
  useUpdateOrderStatus: () => ({
    mutate,
    isPending: false,
    error: null,
    variables: undefined,
  }),
}));

describe('OrdersScreen', () => {
  beforeEach(() => {
    mutate.mockReset();
  });

  it('renders order cards with totals', () => {
    render(<OrdersScreen />);
    expect(screen.getByText('OF-1001')).toBeInTheDocument();
    expect(screen.getByText('OF-1002')).toBeInTheDocument();
    expect(screen.getByText('₹540')).toBeInTheDocument();
  });

  it('filters by status tab', () => {
    render(<OrdersScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'DELIVERED' }));
    expect(screen.getByText('OF-1002')).toBeInTheDocument();
    expect(screen.queryByText('OF-1001')).not.toBeInTheDocument();
  });

  it('searches by order number', () => {
    render(<OrdersScreen />);
    fireEvent.change(screen.getByPlaceholderText(/Search by order number/), {
      target: { value: 'OF-1002' },
    });
    expect(screen.queryByText('OF-1001')).not.toBeInTheDocument();
    expect(screen.getByText('OF-1002')).toBeInTheDocument();
  });

  it('advances a pending order status when the action is pressed', async () => {
    render(<OrdersScreen />);
    fireEvent.click(screen.getByRole('button', { name: /OF-1001/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Advance to paid' }));
    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({ id: 'o1', status: 'PAID', changedBy: 'admin' });
    });
  });

  it('does not offer an advance action for terminal statuses', () => {
    render(<OrdersScreen />);
    fireEvent.click(screen.getByRole('button', { name: /OF-1002/ }));
    expect(screen.queryByRole('button', { name: /Advance to/ })).not.toBeInTheDocument();
  });
});
