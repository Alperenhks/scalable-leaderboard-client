/** Skor kısaltma: 4526619 → "4.5M" */
export function formatScore(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Tam skor, binlik ayraçlı: 4526619 → "4.526.619" */
export const formatScoreFull = (n: number): string =>
  new Intl.NumberFormat('tr-TR').format(n);

/** 516400 → { days: 5, hours: 23, minutes: 26, seconds: 40 } */
export function breakdownSeconds(total: number) {
  const safe = Math.max(0, Math.floor(total));
  return {
    days: Math.floor(safe / 86400),
    hours: Math.floor((safe % 86400) / 3600),
    minutes: Math.floor((safe % 3600) / 60),
    seconds: safe % 60,
  };
}


export const pad2 = (n: number) => String(n).padStart(2, '0');
