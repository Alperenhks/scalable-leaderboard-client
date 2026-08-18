import type { AroundResponse, MeResponse, ProjectionMe } from '@/api/types';
import { formatScoreFull } from '@/lib/format';
import { toMinor } from '@/lib/money';
import { cn } from '@/lib/utils';
import { CoinValue } from '@/components/ui/CoinValue';
import { CountryTag } from '@/components/ui/CountryTag';
import { MoneyValue } from '@/components/ui/MoneyValue';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';

interface Props {
  me: MeResponse | null;
  around: AroundResponse | null;
  /** Sunucunun ödül tahmini — tutar ve ödül bölgesi bilgisi buradan gelir. */
  projectionMe?: ProjectionMe | null;
  className?: string;
}

const tr = new Intl.NumberFormat('tr-TR');

/**
 * "Sen" kartı — kendi sıranı bulmak için kaydırmak gerekmesin diye
 * listenin üstünde durur. Yeşil kapsül, listedeki kendi satırınla aynı dil.
 */
export function MyRankCard({ me, around, projectionMe, className }: Props) {
  if (!me) {
    return (
      <div
        className={cn(
          'h-[4.5rem] animate-pulse rounded-2xl border-[3px] border-bark bg-gold-2/60 motion-reduce:animate-none',
          className,
        )}
      />
    );
  }

  const unranked = me.rank == null;

  // Bir üstteki oyuncuya olan fark — oyuncuyu tekrar oynamaya iten şey.
  const entries = around?.entries ?? [];
  const myIndex = entries.findIndex((e) => e.isCurrentUser);
  const above = myIndex > 0 ? entries[myIndex - 1] : null;
  const gapAbove = above ? above.score - me.score : null;

  // Tutar sunucudan; "0.00" ise ödül bölgesinde değil demektir.
  const prizeMinor = projectionMe?.isEligible ? toMinor(projectionMe.amount) : null;

  return (
    <section
      aria-label="Senin sıralaman"
      className={cn(
        'rounded-2xl border-[3px] border-leaf-d bg-gradient-to-b from-[#d9f7c8] to-[#a9e389] px-3 py-2.5',
        'shadow-[inset_0_2px_0_rgb(255_255_255/0.6),0_4px_0_rgb(0_0_0/0.22)]',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] border-leaf-d bg-gradient-to-b from-[#8ee06a] to-leaf text-sm font-extrabold text-cream">
          {unranked ? '—' : me.rank}
        </span>

        <PlayerAvatar userId={me.userId} username={me.username} className="size-9" />

        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <CountryTag country={me.country} />
            <span className="truncate text-sm font-extrabold text-cocoa">
              {me.username}
            </span>
            <span className="shrink-0 rounded-full border-2 border-leaf-d bg-leaf px-1.5 text-[9px] font-extrabold uppercase text-cream">
              sen
            </span>
          </span>
          <CoinValue score={me.score} full className="text-[12px] text-cocoa/80" />
        </div>

        {prizeMinor != null && (
          <div className="hidden shrink-0 flex-col items-end sm:flex">
            <span className="text-[9px] font-extrabold uppercase tracking-wide text-cocoa/55">
              tahmini ödül
            </span>
            <MoneyValue
              minor={prizeMinor}
              className="tnum text-sm font-extrabold text-[#a8620c]"
            />
          </div>
        )}
      </div>

      <p className="mt-2 border-t-2 border-dashed border-leaf-d/40 pt-1.5 text-[11px] font-bold text-cocoa/70">
        {unranked
          ? 'Henüz skorun yok — ilk uçağını indir, tabloya gir!'
          : projectionMe?.isEligible
            ? '🎉 Ödül bölgesindesin, bu sezon kazanıyorsun!'
            : gapAbove != null
              ? `↑ Bir üstekine ${tr.format(gapAbove)} puan kaldı`
              : projectionMe?.pointsToEligible != null
                ? `Ödül bölgesine ${tr.format(projectionMe.pointsToEligible)} puan kaldı`
                : `Skorun ${formatScoreFull(me.score)} · sıralaman güncelleniyor`}
      </p>
    </section>
  );
}
