import type { LeaderboardEntry } from '@/api/types';
import { estimatePrize, type PrizeTable } from '@/lib/prize';
import { LeaderboardRow } from './LeaderboardRow';

interface Props {
  entries: LeaderboardEntry[];
  currentUserId?: string | null;
  prizes?: PrizeTable;
  emptyMessage?: string;
}

export function LeaderboardList({
  entries,
  currentUserId,
  prizes,
  emptyMessage = 'Gösterilecek kayıt yok.',
}: Props) {
  if (entries.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm font-bold text-cocoa/60">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry) => (
        <LeaderboardRow
          // key olarak userId — sıra değişince React tüm listeyi yeniden çizmesin.
          key={entry.userId}
          entry={entry}
          isCurrentUser={entry.isCurrentUser ?? entry.userId === currentUserId}
          estimatedPrize={prizes ? estimatePrize(entry, prizes) : null}
        />
      ))}
    </ol>
  );
}
