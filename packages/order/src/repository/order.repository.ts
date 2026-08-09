import type {
  Order,
  OrderQuery,
  OrderStatus,
  OrderTimelineEntry,
  PaginatedResult,
} from '@oceanfresh/shared';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByIdempotencyKey(key: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findAll(query: OrderQuery): Promise<PaginatedResult<Order>>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  exists(id: string): Promise<boolean>;
  existsByOrderNumber(orderNumber: string): Promise<boolean>;
  count(query?: Partial<OrderQuery>): Promise<number>;
  create(data: Order): Promise<Order>;
  updateStatus(id: string, status: OrderStatus, changedBy: string, note?: string): Promise<Order>;
  appendTimeline(id: string, entry: OrderTimelineEntry): Promise<Order>;
  archive(id: string): Promise<Order>;
  delete(id: string): Promise<void>;
}
