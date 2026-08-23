import { useState } from 'react';
import type {
  AroundResponse,
  MeResponse,
  MeRewardsResponse,
  ProjectionMe,
} from '@/api/types';
import { formatScoreFull } from '@/lib/format';
import { formatMinor, toMinor } from '@/lib/money';
import { cn } from '@/lib/utils';
import { CoinValue } from '@/components/ui/CoinValue';
import { CountryTag } from '@/components/ui/CountryTag';
import { MoneyValue } from '@/components/ui/MoneyValue';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { RewardHistory } from './RewardHistory';

interface Props {
  me: MeResponse | null;
  around: AroundResponse | null;
  /** Sunucunun ödül tahmini — tutar ve ödül bölgesi bilgisi buradan gelir. */
  projectionMe?: ProjectionMe | null;
  /** Geçmiş sezon kazanımları — kartın içinde açılır bölümde gösterilir. */
  rewards?: MeRewardsResponse | null;
  className?: string;
}

const tr = new Intl.NumberFormat('tr-TR');

/**
 * "Sen" kartı — kendi sıranı bulmak için kaydırmak gerekmesin diye
 * listenin üstünde durur. Yeşil kapsül, listedeki kendi satırınla aynı dil.
 */
export function MyRankCard({
  me,
  around,
  projectionMe,
  rewards,
  className,
}: Props) {
  const [historyOpen, setHistoryOpen] = useState(false);

  /**
   * Yükleme iskeleti.
   *
   * Kartın verisi tablodan sonra gelir (kimlik zinciri: identify -> me), bu
   * yüzden arada boşluk kalırsa tablo yukarı kayıp veri gelince geri zıplar.
   * İskelet gerçek kartın ölçüleriyle çizilir — kutunun yeri baştan ayrılmış
   * olur ve düzen oynamaz.
   */
  if (!me) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'rounded-2xl border-[3px] border-leaf-d/50 bg-gradient-to-b from-mine-1/60 to-mine-2/60 px-3 py-2.5',
          'shadow-[inset_0_2px_0_rgb(255_255_255/0.4)]',
          className,
        )}
      >
        <div className="flex animate-pulse items-center gap-2.5 motion-reduce:animate-none">
          <span className="size-9 shrink-0 rounded-full bg-leaf-d/25" />
          <span className="size-9 shrink-0 rounded-full bg-leaf-d/25" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <span className="block h-3 w-32 rounded bg-leaf-d/25" />
            <span className="block h-2.5 w-20 rounded bg-leaf-d/20" />
          </div>
          <span className="hidden h-7 w-20 shrink-0 rounded bg-leaf-d/20 sm:block" />
        </div>
        <div className="mt-2 border-t-2 border-dashed border-leaf-d/30 pt-1.5">
          <span className="block h-2.5 w-48 animate-pulse rounded bg-leaf-d/20 motion-reduce:animate-none" />
        </div>
      </div>
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

  // Kaydı olmayan oyuncuda bölüm hiç çizilmez — boş bir açılır başlık,
  // tıklayınca hiçbir şey göstermemekten daha kötü bir deneyim olurdu.
  const hasHistory = (rewards?.count ?? 0) > 0;

  return (
    <section
      aria-label="Senin sıralaman"
      className={cn(
        'rounded-2xl border-[3px] border-leaf-d bg-gradient-to-b from-mine-1 to-mine-2 px-3 py-2.5',
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
              className="tnum text-sm font-extrabold text-amount"
            />
          </div>
        )}
      </div>

      <p className="mt-2 border-t-2 border-dashed border-leaf-d/40 pt-1.5 text-[11px] font-bold text-cocoa/70">
        {unranked
          ? 'Pistte henüz uçağın yok — ilk kalkışını yap, tabloya gir.'
          : projectionMe?.isEligible
            ? '🏆 Ödül bölgesindesin — sezon böyle biterse kazanıyorsun.'
            : gapAbove != null
              ? `Öndeki uçağa ${tr.format(gapAbove)} puan var.`
              : projectionMe?.pointsToEligible != null
                ? `Ödül bölgesine ${tr.format(projectionMe.pointsToEligible)} puan kaldı.`
                : `Skorun ${formatScoreFull(me.score)}.`}
      </p>

      {/* Geçmiş ödüller kartın içinde durur: oyuncunun "bu sezon neredeyim"
          ve "daha önce ne kazandım" sorusu aynı yerde cevaplanır. Varsayılan
          kapalı — açılış ekranı kalabalıklaşmasın diye. */}
      {hasHistory && (
        <div className="mt-2 border-t-2 border-dashed border-leaf-d/40 pt-1.5">
          <button
            type="button"
            aria-expanded={historyOpen}
            onClick={() => setHistoryOpen((open) => !open)}
            className="flex w-full items-center gap-1.5 rounded-lg px-1 py-1 text-left text-[11px] font-extrabold text-cocoa/75 transition-colors hover:bg-leaf-d/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-d"
          >
            <span
              aria-hidden="true"
              className={cn(
                'inline-block text-[9px] transition-transform',
                historyOpen && 'rotate-90',
              )}
            >
              ▶
            </span>
            <span className="flex-1">
              Geçmiş ödüllerim
              <span className="ml-1 text-cocoa/50">({rewards!.count})</span>
            </span>
            <span className="tnum shrink-0 font-extrabold text-amount">
              {formatMinor(toMinor(rewards!.totalEarned))}
            </span>
          </button>

          {historyOpen && (
            <div className="mt-1.5">
              <RewardHistory rewards={rewards!} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
