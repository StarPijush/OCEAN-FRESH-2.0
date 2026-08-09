import { getClient, initSupabase } from './client.js';

type QueryBuilder = ReturnType<ReturnType<typeof getTable>['select']>;

export interface SupabaseQuery {
  field: string;
  operator:
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'notIn'
    | 'contains'
    | 'containedBy'
    | 'overlaps'
    | 'ilike'
    | 'like';
  value: unknown;
}

export interface SupabaseOptions {
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
  offset?: number;
}

function getTable(name: string) {
  initSupabase();
  return getClient().from(name);
}

function applyQueries(query: QueryBuilder, queries: SupabaseQuery[]): QueryBuilder {
  for (const q of queries) {
    if (q.operator === 'eq') query = query.eq(q.field, q.value);
    else if (q.operator === 'neq') query = query.neq(q.field, q.value);
    else if (q.operator === 'gt') query = query.gt(q.field, q.value);
    else if (q.operator === 'gte') query = query.gte(q.field, q.value);
    else if (q.operator === 'lt') query = query.lt(q.field, q.value);
    else if (q.operator === 'lte') query = query.lte(q.field, q.value);
    else if (q.operator === 'in') query = query.in(q.field, q.value as unknown[]);
    else if (q.operator === 'notIn') query = query.not(q.field, 'in', q.value as unknown[]);
    else if (q.operator === 'contains')
      query = query.contains(q.field, q.value as Record<string, unknown>);
    else if (q.operator === 'containedBy')
      query = query.containedBy(q.field, q.value as Record<string, unknown>);
    else if (q.operator === 'overlaps') query = query.overlaps(q.field, q.value as unknown[]);
    else if (q.operator === 'ilike') query = query.ilike(q.field, q.value as string);
    else if (q.operator === 'like') query = query.like(q.field, q.value as string);
  }
  return query;
}

function applyOptions(query: QueryBuilder, options?: SupabaseOptions): QueryBuilder {
  if (options?.orderByField) {
    query = query.order(options.orderByField, {
      ascending: (options.orderDirection ?? 'asc') === 'asc',
    });
  }
  if (options?.limitCount) {
    query = query.limit(options.limitCount);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limitCount ?? 100) - 1);
  }
  return query;
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
    let qry: QueryBuilder = getTable(tableName).select('*');
    qry = applyQueries(qry, queries);
    qry = applyOptions(qry, options);

    const { data, error } = await qry;
    if (error) throw error;
    return (data ?? []) as T[];
  },

  async count(tableName: string, queries: SupabaseQuery[]): Promise<number> {
    let qry: QueryBuilder = getTable(tableName).select('*', { count: 'exact', head: true });
    qry = applyQueries(qry, queries);

    const { count, error } = await qry;
    if (error) throw error;
    return count ?? 0;
  },

  async add<T>(tableName: string, data: Record<string, unknown>): Promise<T> {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      created_at: now,
      updated_at: now,
    };
    const { data: inserted, error } = await getTable(tableName)
      .insert(payload)
      .select()
      .maybeSingle();
    if (error) throw error;
    return inserted as T;
  },

  async update(tableName: string, id: string, data: Record<string, unknown>): Promise<void> {
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
    const { data: result, error } = await getTable(tableName)
      .upsert(payload)
      .select()
      .maybeSingle();
    if (error) throw error;
    return result as T;
  },

  async rpc<T>(fn: string, params: Record<string, unknown>): Promise<T> {
    initSupabase();
    const { data, error } = await getClient().rpc(fn, params);
    if (error) throw error;
    return data as T;
  },
};
