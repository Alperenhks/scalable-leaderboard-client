import { memo } from 'react';
import type { LeaderboardEntry } from '@/api/types';
import { cn } from '@/lib/utils';
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
}

function LeaderboardRowBase({ entry, isCurrentUser = false, estimatedPrize }: Props) {
  return (
    <li
      aria-current={isCurrentUser ? 'true' : undefined}
      className={cn(
        'capsule flex items-center gap-2.5 px-2.5 py-1.5',
        // Kendi satırın yeşil kapsül olur — listede gözden kaçmaz.
        isCurrentUser &&
          'border-leaf-d bg-gradient-to-b from-[#d6f5c4] to-[#a9e389] ring-2 ring-leaf/50',
      )}
    >
      <RankMedal rank={entry.rank} />
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

      {/* Ödül sütunu dar ekranda gizlenir: sıra + ad + skor yeter. */}
      {estimatedPrize != null && (
        <MoneyValue
          minor={estimatedPrize}
          compact
          className="tnum hidden w-16 shrink-0 text-right text-[11px] font-extrabold text-[#a8620c] sm:block"
        />
      )}
    </li>
  );
}

/**
 * Polling her 15-30 sn'de listeyi tazeliyor; sıra değişmediğinde
 * satırların yeniden çizilmemesi için memo'lu.
 */
export const LeaderboardRow = memo(LeaderboardRowBase);
