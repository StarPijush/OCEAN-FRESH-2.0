import { initSupabase, getClient } from './client.js';

export interface SupabaseQuery {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn' | 'contains' | 'containedBy' | 'overlaps' | 'ilike' | 'like';
  value: unknown;
}

export interface SupabaseOptions {
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
}

function getTable(name: string) {
  initSupabase();
  return getClient().from(name);
}

export const supabaseService = {
  async get<T>(tableName: string, id: string): Promise<T | null> {
    const { data, error } = await getTable(tableName).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as T | null;
  },

  async getAll<T>(tableName: string): Promise<T[]> {
    const { data, error } = await getTable(tableName).select('*');
    if (error) throw error;
    return (data ?? []) as T[];
  },

  async query<T>(
    tableName: string,
    queries: SupabaseQuery[],
    options?: SupabaseOptions,
  ): Promise<T[]> {
    let query = getTable(tableName).select('*');

    for (const q of queries) {
      if (q.operator === 'eq') query = query.eq(q.field, q.value);
      else if (q.operator === 'neq') query = query.neq(q.field, q.value);
      else if (q.operator === 'gt') query = query.gt(q.field, q.value);
      else if (q.operator === 'gte') query = query.gte(q.field, q.value);
      else if (q.operator === 'lt') query = query.lt(q.field, q.value);
      else if (q.operator === 'lte') query = query.lte(q.field, q.value);
      else if (q.operator === 'in') query = query.in(q.field, q.value as unknown[]);
      else if (q.operator === 'notIn') query = query.not(q.field, 'in', q.value as unknown[]);
      else if (q.operator === 'contains') query = query.contains(q.field, q.value as Record<string, unknown>);
      else if (q.operator === 'ilike') query = query.ilike(q.field, q.value as string);
    }

    if (options?.orderByField) {
      query = query.order(options.orderByField, { ascending: (options.orderDirection ?? 'asc') === 'asc' });
    }
    if (options?.limitCount) {
      query = query.limit(options.limitCount);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as T[];
  },

  async add<T>(tableName: string, data: Record<string, unknown>): Promise<T> {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    const { data: inserted, error } = await getTable(tableName).insert(payload).select().maybeSingle();
    if (error) throw error;
    return inserted as T;
  },

  async update(
    tableName: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    const { error } = await getTable(tableName).update(payload).eq('id', id);
    if (error) throw error;
  },

  async remove(tableName: string, id: string): Promise<void> {
    const { error } = await getTable(tableName).delete().eq('id', id);
    if (error) throw error;
  },

  async upsert<T>(tableName: string, id: string, data: Record<string, unknown>): Promise<T> {
    const now = new Date().toISOString();
    const payload = {
      id,
      ...data,
      updated_at: now,
    };
    const { data: result, error } = await getTable(tableName).upsert(payload).select().maybeSingle();
    if (error) throw error;
    return result as T;
  },
};
