/**
 * Tiny in-flight request dedupe for authenticated GET helpers.
 * Avoids duplicate parallel calls when multiple hooks mount.
 */
const inflight = new Map<string, Promise<unknown>>();

export function dedupeAsync<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = run().finally(() => {
    if (inflight.get(key) === promise) {
      inflight.delete(key);
    }
  });

  inflight.set(key, promise);
  return promise;
}
