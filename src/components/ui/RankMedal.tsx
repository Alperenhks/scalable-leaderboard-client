import { cn } from '@/lib/utils';

interface Props {
  rank: number;
  className?: string;
  /** Bu sırayı eşit puanlı başka oyuncular da paylaşıyor. */
  isTied?: boolean;
}

/** İlk üç sıra kendi madalya rengini alır; gerisi sade kalır. */
export function RankMedal({ rank, className, isTied = false }: Props) {
  const tone =
    rank === 1
      ? 'from-coin-1 to-coin-2 border-amount text-[#5a2d0c]'
      : rank === 2
        ? 'from-[#e6eef7] to-[#adc0d2] border-[#6d8298] text-[#33475c]'
        : rank === 3
          ? 'from-[#f0a868] to-[#cd7433] border-[#8c4715] text-[#4a2408]'
          : 'from-[#ffeec4] to-[#f3cf8e] border-[#c0871f] text-cocoa';

  return (
    <span className="relative shrink-0">
      <span
        aria-label={
          isTied ? `${rank}. sıra, eşit puanla paylaşılıyor` : `${rank}. sıra`
        }
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-full border-[3px] bg-gradient-to-b font-extrabold shadow-[inset_0_2px_0_rgb(255_255_255/0.5)]',
          rank > 99 ? 'text-[11px]' : 'text-sm',
          tone,
          className,
        )}
      >
        {rank}
      </span>

      {/* Eşitlik rozeti: aynı sırayı iki kez görmek hata gibi okunmasın diye
          sıranın paylaşıldığı satırda açıkça işaretlenir. */}
      {isTied && (
        <span
          aria-hidden="true"
          title="Eşit puan — sıra paylaşılıyor"
          className="absolute -right-0.5 -top-0.5 inline-flex size-3.5 items-center justify-center rounded-full border-2 border-cream bg-cocoa text-[8px] font-extrabold leading-none text-cream"
        >
          =
        </span>
      )}
    </span>
  );
}
