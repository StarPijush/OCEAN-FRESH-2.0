import type { Money } from './cart.js';
import type { ProductUnit } from './product.js';

export enum OrderStatus {
  DRAFT = 'DRAFT',
  VALIDATING = 'VALIDATING',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUNDED = 'REFUNDED',
  ARCHIVED = 'ARCHIVED',
}

export enum OrderSource {
  CHECKOUT = 'checkout',
  ADMIN = 'admin',
  API = 'api',
}

export enum OrderEventType {
  CREATED = 'order:created',
  VALIDATED = 'order:validated',
  CONFIRMED = 'order:confirmed',
  PAYMENT_PENDING = 'order:payment_pending',
  PAYMENT_SUCCEEDED = 'order:payment_succeeded',
  PAYMENT_FAILED = 'order:payment_failed',
  PACKED = 'order:packed',
  SHIPPED = 'order:shipped',
  DELIVERED = 'order:delivered',
  CANCELLED = 'order:cancelled',
  REFUND_REQUESTED = 'order:refund_requested',
  REFUND_COMPLETED = 'order:refund_completed',
}

export enum OrderSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ORDER_NUMBER = 'orderNumber',
  GRAND_TOTAL = 'grandTotal',
}

export interface OrderProductSnapshot {
  productId: string;
  name: string;
  sku: string | null;
  thumbnail: string;
  image: string;
  price: Money;
  currency: string;
  unit: ProductUnit;
  variantSummary: string | null;
}

export interface OrderCustomerSnapshot {
  name: string;
  email: string | null;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderShippingSnapshot {
  address: string;
  city: string;
  state: string;
  pincode: string;
  method: string;
  amount: Money;
}

export interface OrderBillingSnapshot {
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  snapshot: OrderProductSnapshot;
  quantity: number;
  unitPrice: Money;
  subtotal: Money;
}

export interface OrderTotals {
  subtotal: Money;
  discount: Money;
  shipping: Money;
  tax: Money;
  grandTotal: Money;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: Date;
  changedBy: string;
  note: string | null;
}

export interface PaymentSummary {
  method: string | null;
  transactionId: string | null;
  paidAmount: Money | null;
  paidAt: Date | null;
  gatewayResponse: Record<string, unknown> | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  source: OrderSource;
  status: OrderStatus;
  items: OrderItem[];
  totals: OrderTotals;
  customerSnapshot: OrderCustomerSnapshot;
  shippingSnapshot: OrderShippingSnapshot;
  billingSnapshot: OrderBillingSnapshot;
  payment: PaymentSummary;
  timeline: OrderTimelineEntry[];
  notes: string;
  cartId: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderFromCheckoutInput {
  cartId: string;
  idempotencyKey: string;
  userId: string | null;
  customer: OrderCustomerSnapshot;
  shipping: OrderShippingSnapshot;
  billing: OrderBillingSnapshot;
  notes?: string;
}

export interface OrderQuery {
  status?: OrderStatus | OrderStatus[];
  userId?: string;
  orderNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: OrderSortField;
  sortDirection?: 'asc' | 'desc';
}

export interface OrderValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface OrderValidationResult {
  valid: boolean;
  errors: OrderValidationError[];
}
