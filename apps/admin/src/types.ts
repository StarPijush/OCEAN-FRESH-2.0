import type { OrderStatus } from '@oceanfresh/shared';

export interface AdminProfile {
  mobile: string;
  password: string;
  name: string;
}

export interface ProductData {
  id: string;
  name: string;
  sub?: string;
  price: number;
  category?: string;
  available?: boolean;
  featured?: boolean;
  image?: string;
  emoji?: string;
  updated_at?: number;
}

export interface ProductInput {
  name: string;
  sub?: string;
  price: number;
  category?: string;
  available?: boolean;
  featured?: boolean;
  image?: string;
  emoji?: string;
  updated_at: number;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  sub: number;
}

export interface OrderData {
  id: string;
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  ts: number;
}

export interface DeliveryCharge {
  amount: number;
  freeAbove: number;
}

export interface DashboardStats {
  todaySales: number;
  todayIncome: number;
  weekIncome?: number;
  totalOrders: number;
  totalIncome: number;
  pendingOrders: number;
  totalProducts: number;
  availableProducts: number;
  chart: ChartDay[];
  recentOrders: OrderData[];
  topProducts?: { name: string; qty: number }[];
}

export interface ChartDay {
  label: string;
  sales: number;
  income: number;
}
