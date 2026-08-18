import { useCallback, useEffect, useRef, useState } from 'react';

interface PollingState<T> {
  data: T | null;
  error: Error | null;
  /** Sadece ilk yüklemede true — polling sırasında iskelet gösterme. */
  loading: boolean;
  refetch: () => void;
}

interface PollingOptions {
  /**
   * false iken hiç istek atılmaz. Yetkili uçlar için kullanılır:
   * token gelmeden /me çağırmak 401 döner.
   */
  enabled?: boolean;
}

/**
 * Belirli aralıkla veri çeker. Sekme arka plandayken durur,
 * öne gelince hemen bir kez çeker (bayat veri göstermemek için).
 */
export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  intervalMs: number,
  deps: unknown[] = [],
  { enabled = true }: PollingOptions = {},
): PollingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // fetcher her render'da yeni referans olabilir; efekti tetiklemesin.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [nonce, setNonce] = useState(0);
  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let timer: number | undefined;
    let cancelled = false;

    const tick = async () => {
      try {
        const result = await fetcherRef.current(controller.signal);
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const schedule = () => {
      window.clearTimeout(timer);
      if (document.visibilityState !== 'visible') return;
      timer = window.setTimeout(async () => {
        await tick();
        schedule();
      }, intervalMs);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void tick().then(schedule);
      } else {
        window.clearTimeout(timer);
      }
    };

    void tick().then(schedule);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, nonce, enabled, ...deps]);

  return { data, error, loading, refetch };
}
