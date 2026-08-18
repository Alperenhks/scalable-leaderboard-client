import type { CountryCode } from '@/api/types';
import { cn } from '@/lib/utils';

interface Props {
  country: CountryCode;
  className?: string;
}

/** Ülke iki harfli ISO koduyla yazılır. `null` güvenli. */
export function CountryTag({ country, className }: Props) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-md border-2 border-gold-4/60 bg-gold-1 px-1.5 text-[10px] font-extrabold tracking-wide text-cocoa/70',
        className,
      )}
      aria-label={country ? `Ülke: ${country}` : 'Ülke belirtilmemiş'}
    >
      {country?.toUpperCase() ?? '··'}
    </span>
  );
}
