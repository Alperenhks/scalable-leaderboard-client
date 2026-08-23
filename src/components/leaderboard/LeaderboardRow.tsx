import { memo, useState } from 'react';
import type { LeaderboardEntry } from '@/api/types';
import { cn } from '@/lib/utils';
import { formatScoreFull } from '@/lib/format';
import { CoinValue } from '@/components/ui/CoinValue';
import { CountryTag } from '@/components/ui/CountryTag';
import { MoneyValue } from '@/components/ui/MoneyValue';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { RankMedal } from '@/components/ui/RankMedal';

interface Props {
  entry: LeaderboardEntry;
  /** Tek fark bu: ilk 100 listesi de around penceresi de aynı bileşeni kullanır. */
  isCurrentUser?: boolean;
  /** Kuruş cinsinden tahmini ödül; ödül sınırı dışındaysa null. */
  estimatedPrize?: bigint | null;
  /** Bu sırayı eşit puanlı başka oyuncular da paylaşıyor. */
  isTied?: boolean;
  /** Listedeki en yüksek skor — bar bu orana göre çizilir. */
  topScore?: number;
  /** Bir üstteki oyuncunun skoru; en üstteki satırda yoktur. */
  scoreAbove?: number | null;
}

const tr = new Intl.NumberFormat('tr-TR');

function LeaderboardRowBase({
  entry,
  isCurrentUser = false,
  estimatedPrize,
  isTied = false,
  topScore,
  scoreAbove,
}: Props) {
  const [open, setOpen] = useState(false);

  // Bar oranı: liderin skoruna göre. İlk 100'de skorlar birbirine çok yakın
  // (canlı veride 1,18 kat fark) — bar bunu rakam okumadan görünür kılar.
  const ratio =
    topScore && topScore > 0
      ? Math.max(0.04, Math.min(1, entry.score / topScore))
      : null;

  const gap = scoreAbove != null ? scoreAbove - entry.score : null;

  return (
    <li
      className={cn(
        'capsule px-2 py-1.5 sm:px-2.5',
        // Kapalıyken hap şeklinde kalır; açılınca köşeler yumuşar. 999px
        // yarıçap, açılan içeriğin kenarlarını kesip metni taşırıyordu.
        open && 'rounded-2xl',
        isCurrentUser &&
          'border-leaf-d bg-gradient-to-b from-mine-1 to-mine-2 ring-2 ring-leaf/50',
      )}
      aria-current={isCurrentUser ? 'true' : undefined}
    >
      {/*
        Satırın kendisi bir düğmedir.

        Ödül sütunu dar ekranda gizleniyordu ve tooltip mobilde hiç
        çalışmıyor (hover yok) — case ise uygulamanın mobilde de test
        edileceğini söylüyor. Bu yüzden ayrıntı hover'ın arkasına değil,
        dokunmayla açılan bir bölüme konuldu: aynı etkileşim iki platformda
        da çalışır ve klavyeyle de erişilebilir.
      */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 text-left sm:gap-2.5"
      >
        <RankMedal rank={entry.rank} isTied={isTied} />
        <PlayerAvatar userId={entry.userId} username={entry.username} />

        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <CountryTag country={entry.country} />
          <span className="truncate text-[13px] font-bold text-cocoa">
            {entry.username}
          </span>
          {isCurrentUser && (
            <span className="shrink-0 rounded-full border-2 border-leaf-d bg-leaf px-1.5 text-[9px] font-extrabold uppercase text-cream">
              sen
            </span>
          )}
        </span>

        <CoinValue score={entry.score} className="text-[13px] text-cocoa" />

        {/* Ödül sütunu dar ekranda gizlenir — kaybolmaz, aşağıdaki
            ayrıntı bölümünde her ekranda görünür. */}
        {estimatedPrize != null && (
          <MoneyValue
            minor={estimatedPrize}
            compact
            className="tnum hidden w-16 shrink-0 text-right text-[11px] font-extrabold text-amount sm:block"
          />
        )}

        <span
          aria-hidden="true"
          className={cn(
            'shrink-0 text-[9px] text-cocoa/40 transition-transform',
            open && 'rotate-180',
          )}
        >
          ▼
        </span>
      </button>

      {/* Skor barı: her satırda, her ekranda görünür. */}
      {ratio != null && (
        <span
          aria-hidden="true"
          className="mx-1 mt-1 block h-1 overflow-hidden rounded-full bg-bark/15"
        >
          <span
            className={cn(
              'block h-full rounded-full',
              isCurrentUser
                ? 'bg-leaf'
                : entry.rank <= 3
                  ? 'bg-amount'
                  : 'bg-cocoa/35',
            )}
            style={{ width: `${ratio * 100}%` }}
          />
        </span>
      )}

      {open && (
        <dl className="mt-1.5 space-y-1 border-t-2 border-dashed border-bark/25 px-1 pb-0.5 pt-1.5 text-[11px] font-bold">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-cocoa/60">Skor</dt>
            <dd className="tnum text-cocoa">{formatScoreFull(entry.score)}</dd>
          </div>

          {gap != null && gap > 0 && (
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-cocoa/60">Öndekine</dt>
              <dd className="tnum text-cocoa">{tr.format(gap)} puan</dd>
            </div>
          )}

          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-cocoa/60">Sezon sonu ödülü</dt>
            <dd className="tnum text-amount">
              {estimatedPrize != null ? (
                <MoneyValue minor={estimatedPrize} />
              ) : (
                'ödül bölgesi dışında'
              )}
            </dd>
          </div>

          {isTied && (
            <p className="pt-0.5 text-[10px] font-bold text-cocoa/55">
              Bu sırayı eşit puanlı oyuncular paylaşıyor — ödül de eşit bölünür.
            </p>
          )}
        </dl>
      )}
    </li>
  );
}

/**
 * `memo`'lu: tablo tazelendiğinde (yenile düğmesi, persona değişimi, skor
 * gönderimi) 100 satırın tamamı yeni prop alır ama çoğunun içeriği aynıdır;
 * memo sırası ve skoru değişmeyen satırların yeniden çizilmesini önler.
 */
export const LeaderboardRow = memo(LeaderboardRowBase);
