import { formatMinor, formatMinorCompact } from '@/lib/money';

interface Props {
  /** Kuruş cinsinden bigint — string para alanı `toMinor` ile çevrilmiş olmalı. */
  minor: bigint;
  compact?: boolean;
  className?: string;
}

/** Para gösterimi. Aritmetik çağıranda bigint ile yapılır, burada sadece biçimlenir. */
export function MoneyValue({ minor, compact = false, className }: Props) {
  return (
    <span className={className} title={formatMinor(minor, true)}>
      {compact ? formatMinorCompact(minor) : formatMinor(minor)}
    </span>
  );
}
