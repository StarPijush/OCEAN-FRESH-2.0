export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  lastDoc: unknown | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  correlationId: string;
}
