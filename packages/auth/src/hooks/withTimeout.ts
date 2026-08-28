/**
 * Races a Promise against a timeout. The timeout does NOT cancel the
 * underlying operation — it only guarantees the caller does not wait forever.
 * This is the correct frontend pattern for Supabase's `auth.getUser()` which
 * does not accept an AbortSignal in the current SDK.
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new DOMException(`${label} timed out after ${timeoutMs}ms`, 'TimeoutError'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  });
}
