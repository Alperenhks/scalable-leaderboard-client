import { useCallback, useEffect, useState } from 'react';
import { getToken, identify, setToken } from '../api/client';
import type { DemoMode, IdentifyResponse } from '../api/types';

const MODE_KEY = 'panteon.mode';

interface SessionState {
  identity: IdentifyResponse | null;
  mode: DemoMode | null;
  loading: boolean;
  error: Error | null;
  /** Persona değiştirir; token arka planda yenilenir, kullanıcı görmez. */
  switchTo: (mode: DemoMode) => Promise<void>;
  /** Token'ın kaç kez değiştiğini sayar — veri hook'ları buna bağlanır. */
  epoch: number;
  /** Token hazır mı? Yetkili uçlar bu true olmadan istek atmamalı (401 olur). */
  ready: boolean;
}

export function useSession(): SessionState {
  const [identity, setIdentity] = useState<IdentifyResponse | null>(null);
  const [mode, setMode] = useState<DemoMode | null>(
    () => (localStorage.getItem(MODE_KEY) as DemoMode | null) ?? null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [epoch, setEpoch] = useState(0);
  const [ready, setReady] = useState(() => Boolean(getToken()));

  const apply = useCallback((res: IdentifyResponse, nextMode: DemoMode | null) => {
    setToken(res.token);
    setIdentity(res);
    setMode(nextMode);
    if (nextMode) localStorage.setItem(MODE_KEY, nextMode);
    else localStorage.removeItem(MODE_KEY);
    setEpoch((e) => e + 1);
    setReady(true);
  }, []);

  // Açılış: token yoksa kimlik al. Varsa mevcut token'la devam et.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        if (getToken()) {
          // Token elde var; /me çağrısı yapan hook'lar doğrulayacak.
          if (!cancelled) {
            setReady(true);
            setEpoch((e) => e + 1);
          }
          return;
        }
        const stored = localStorage.getItem(MODE_KEY) as DemoMode | null;
        const res = await identify(stored ?? undefined, controller.signal);
        if (cancelled) return;
        apply(res, stored);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [apply]);

  const switchTo = useCallback(
    async (next: DemoMode) => {
      setLoading(true);
      setError(null);
      try {
        const res = await identify(next);
        apply(res, next);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [apply],
  );

  return { identity, mode, loading, error, switchTo, epoch, ready };
}
