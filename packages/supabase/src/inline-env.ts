// @ts-expect-error — `import.meta.env` is statically replaced by Vite in web
// builds; under Metro/React Native it is simply absent and yields `undefined`.
export const viteEnv: Record<string, unknown> | undefined = import.meta.env as
  Record<string, unknown> | undefined;

/** Reads a Vite-style env var; always safe on React Native (returns undefined). */
export function readViteEnv(key: string): string | undefined {
  const value = viteEnv?.[key];
  if (typeof value === 'string' && value.length > 0) return value;
  if (typeof value === 'boolean') return String(value);
  return undefined;
}
