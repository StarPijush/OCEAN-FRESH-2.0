export interface ICacheStrategy {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
}

export class NullCacheStrategy implements ICacheStrategy {
  async get<T>(): Promise<T | null> {
    return null;
  }

  async set(): Promise<void> {}

  async invalidate(): Promise<void> {}
}
