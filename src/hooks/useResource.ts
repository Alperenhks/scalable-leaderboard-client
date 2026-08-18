import { useCallback, useEffect, useRef, useState } from 'react';

interface ResourceState<T> {
  data: T | null;
  error: Error | null;
  /** Sadece ilk yüklemede true — yeniden çekerken iskelet gösterme. */
  loading: boolean;
  refetch: () => void;
}

interface ResourceOptions {
  /**
   * false iken hiç istek atılmaz. Yetkili uçlar için kullanılır:
   * token gelmeden /me çağırmak 401 döner.
   */
  enabled?: boolean;
}

/**
 * Veriyi BİR KEZ çeker; sonra yalnızca açıkça istendiğinde tazeler.
 *
 * Zamanlayıcı yok, arka plan trafiği yok. Tazeleme üç durumda olur:
 * kullanıcı yenile der, persona değişir, ya da skor gönderilir.
 * Böylece ekran açık dururken sunucuya tek bir gereksiz istek gitmez.
 */
export function useResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
  { enabled = true }: ResourceOptions = {},
): ResourceState<T> {
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
    let cancelled = false;

    (async () => {
      try {
        const result = await fetcherRef.current(controller.signal);
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, enabled, ...deps]);

  return { data, error, loading, refetch };
}
