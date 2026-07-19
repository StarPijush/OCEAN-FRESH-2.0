const snakeToCamel = (str: string): string => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const camelToSnake = (str: string): string => str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

export function rowToCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[snakeToCamel(key)] = value;
  }
  return result as T;
}

export function objToSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }
  return result;
}

export function rowsToCamelCase<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((r) => rowToCamelCase<T>(r));
}

export function stripId(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  delete result.id;
  return result;
}
