import { formatScore, formatScoreFull } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  score: number;
  full?: boolean;
  className?: string;
}

/** Skor, madeni para ikonuyla birlikte gösterilir — oyun para birimi hissi. */
export function CoinValue({ score, full = false, className }: Props) {
  return (
    <span
      // `shrink-0`: satır içinde skor kolonu daralmamalı. Aksi halde uzun bir
      // skor (ör. 4.526.619) esnek satırı zorlar ve dar ekranda taşmaya yol
      // açar — tabloya veri geldiğinde ortaya çıkan, boş listede görünmeyen
      // türden bir kırılma.
      className={cn('inline-flex shrink-0 items-center gap-1.5', className)}
      title={formatScoreFull(score)}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-amount bg-gradient-to-b from-coin-1 to-coin-2 text-[8px] font-extrabold text-[#8c4d08]"
      >
        ₺
      </span>
      <span className="tnum font-extrabold">
        {full ? formatScoreFull(score) : formatScore(score)}
      </span>
    </span>
  );
}
