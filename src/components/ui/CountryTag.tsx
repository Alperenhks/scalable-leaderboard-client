import { useState } from 'react';
import type { CountryCode } from '@/api/types';
import { cn } from '@/lib/utils';

interface Props {
  country: CountryCode;
  className?: string;
}

/**
 * Ülke bayrağı — flagcdn'den PNG olarak gelir.
 *
 * `country` null olabilir ya da CDN'de karşılığı olmayabilir (404); bu
 * durumda hiçbir şey çizilmez, kırık görsel çıkmaz.
 */
export function CountryTag({ country, className }: Props) {
  const [failed, setFailed] = useState(false);
  const code = country?.toLowerCase();

  if (!code || !/^[a-z]{2}$/.test(code) || failed) return null;

  return (
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      srcSet={`https://flagcdn.com/w40/${code}.png 2x`}
      width={18}
      height={13}
      alt={country ?? ''}
      title={country ?? undefined}
      // Liste kısa (en fazla 100 satır); lazy yerine eager ile bayraklar
      // kaydırma beklemeden görünür.
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        'inline-block h-[13px] w-[18px] shrink-0 rounded-[2px] object-cover ring-1 ring-cocoa/30',
        className,
      )}
    />
  );
}
