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

  // Aynı sırayı birden çok oyuncu paylaşıyorsa satırda gösterilir. Sunucu
  // eşit puanlılara zaten aynı sırayı verir; istemcinin işi bunu görünür
  // kılmak — aksi halde listede iki kez "54" görmek hata gibi okunur.
  const tiedRanks = new Set<number>();
  const seenRanks = new Set<number>();
  for (const entry of entries) {
    if (seenRanks.has(entry.rank)) tiedRanks.add(entry.rank);
    else seenRanks.add(entry.rank);
  }

  // Bar oranının referansı listenin EN YÜKSEK skorudur, sabit bir değer
  // değil: "çevrem" penceresi 500. sıradan başlayabilir ve orada liderin
  // skoruna göre çizilen bar hepsini görünmez bir çizgiye indirirdi.
  const topScore = Math.max(...entries.map((e) => e.score));

  return (
    <ol className="space-y-2">
      {entries.map((entry, index) => (
        <LeaderboardRow
          // key olarak userId — sıra değişince React tüm listeyi yeniden çizmesin.
          key={entry.userId}
          entry={entry}
          isCurrentUser={entry.isCurrentUser ?? entry.userId === currentUserId}
          estimatedPrize={prizes ? estimatePrize(entry, prizes) : null}
          isTied={tiedRanks.has(entry.rank)}
          topScore={topScore}
          // Üstteki satırın skoru; ilk satırda yoktur.
          scoreAbove={index > 0 ? entries[index - 1].score : null}
        />
      ))}
    </ol>
  );
}
