import { formatScore, formatScoreFull } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Props {
  score: number;
  /** Tam sayıyı göster (vurgulu yerlerde). */
  full?: boolean;
  className?: string;
}

/** Skor, madeni para ikonuyla birlikte gösterilir — oyun para birimi hissi. */
export function CoinValue({ score, full = false, className }: Props) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      title={formatScoreFull(score)}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-[#a8620c] bg-gradient-to-b from-[#ffd54a] to-[#e8a41d] text-[8px] font-extrabold text-[#8c4d08]"
      >
        ₺
      </span>
      <span className="tnum font-extrabold">
        {full ? formatScoreFull(score) : formatScore(score)}
      </span>
    </span>
  );
}
