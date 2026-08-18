import { cn } from '@/lib/utils';

interface Props {
  rank: number;
  className?: string;
}

/** İlk üç sıra kendi madalya rengini alır; gerisi sade kalır. */
export function RankMedal({ rank, className }: Props) {
  const tone =
    rank === 1
      ? 'from-coin-1 to-coin-2 border-amount text-[#5a2d0c]'
      : rank === 2
        ? 'from-[#e6eef7] to-[#adc0d2] border-[#6d8298] text-[#33475c]'
        : rank === 3
          ? 'from-[#f0a868] to-[#cd7433] border-[#8c4715] text-[#4a2408]'
          : 'from-[#ffeec4] to-[#f3cf8e] border-[#c0871f] text-cocoa';

  return (
    <span
      aria-label={`${rank}. sıra`}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full border-[3px] bg-gradient-to-b font-extrabold shadow-[inset_0_2px_0_rgb(255_255_255/0.5)]',
        rank > 99 ? 'text-[11px]' : 'text-sm',
        tone,
        className,
      )}
    >
      {rank}
    </span>
  );
}
