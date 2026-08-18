import { useEffect, useState } from 'react';

/**
 * Sunucudan gelen `secondsRemaining` değerini istemcide sayar.
 * Her saniye istek atmaz; sunucu değeri tazelendiğinde senkronlanır.
 *
 * Sekme arka plandayken setInterval kısılır, bu yüzden geçen gerçek
 * süreyi timestamp farkından hesaplarız — geri döndüğünde sayaç doğru olur.
 */
export function useCountdown(secondsRemaining: number | null): number {
  const [remaining, setRemaining] = useState(secondsRemaining ?? 0);

  useEffect(() => {
    if (secondsRemaining == null) return;

    const startedAt = Date.now();
    const base = secondsRemaining;
    setRemaining(base);

    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setRemaining(Math.max(0, base - elapsed));
    }, 1000);

    return () => window.clearInterval(id);
  }, [secondsRemaining]);

  return remaining;
}
