/**
 * Para alanları backend'den string gelir ("94018764.62").
 * Number'a çevirip aritmetik yapmak kuruş kaybettirir; bu yüzden
 * tüm hesaplar bigint kuruş (minor unit) üzerinden yürür.
 */

/** "94018764.62" → 9401876462n (kuruş) */
export function toMinor(amount: string): bigint {
  const trimmed = amount.trim();
  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [whole = '0', frac = ''] = unsigned.split('.');
  // Kuruşa yuvarlama değil, kesme: backend zaten 2 hane gönderiyor.
  const cents = `${frac}00`.slice(0, 2);
  const value = BigInt(whole || '0') * 100n + BigInt(cents);
  return negative ? -value : value;
}


const tryLira = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

const tryLiraPrecise = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Kuruşu görüntülemek için — sadece GÖSTERİM, aritmetik değil. */
export function formatMinor(minor: bigint, precise = false): string {
  const asNumber = Number(minor) / 100;
  return precise ? tryLiraPrecise.format(asNumber) : tryLira.format(asNumber);
}

/** Uzun tutarları kısaltır: 94018764.62 → "₺94,0M" */
export function formatMinorCompact(minor: bigint): string {
  const major = Number(minor) / 100;
  if (major >= 1_000_000) return `₺${(major / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (major >= 1_000) return `₺${(major / 1_000).toFixed(1).replace('.', ',')}K`;
  return tryLira.format(major);
}
