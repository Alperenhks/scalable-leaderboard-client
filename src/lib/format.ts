/** Skor kısaltma: 4526619 → "4.5M" */
export function formatScore(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

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

/**
 * ISO 3166-1 alpha-2 kodunu okunur ülke adına çevirir: "CA" → "Kanada".
 *
 * `Intl.DisplayNames` tarayıcının kendi ülke tablosunu kullanır; elle bir
 * eşleme listesi tutmak 250 satırlık bir sabit demek olurdu ve çeviriler
 * zamanla eskir. Desteklenmeyen bir ortamda ya da tanınmayan bir kodda
 * kodun kendisi döner — bilgi kaybolmaz, yalnızca kısa haliyle görünür.
 */
const countryNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['tr'], { type: 'region' })
    : null;

export function formatCountry(code: string | null | undefined): string {
  if (!code) return '';
  try {
    return countryNames?.of(code.toUpperCase()) ?? code;
  } catch {
    // Geçersiz kod (ör. "XX") RangeError atar; ham kodu göstermek yeterli.
    return code;
  }
}
