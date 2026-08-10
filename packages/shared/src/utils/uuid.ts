/**
 * Cross-platform UUID v4 generator.
 *
 * `crypto.randomUUID()` is available in browsers, Node >= 19 and jsdom, but NOT
 * on Hermes (React Native). This helper uses the native implementation where
 * available and falls back to an RFC 4122 v4 generation otherwise.
 */
export function randomUUID(): string {
  const c = globalThis.crypto as
    (typeof globalThis.crypto & { randomUUID?: () => string }) | undefined;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
