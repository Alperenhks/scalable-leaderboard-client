import type { LeaderboardEntry, SeasonResponse } from '../api/types';
import { rateToFraction, shareOf, toMinor } from './money';

/**
 * Ödül tahmini.
 *
 * İlk üç sıra havuzdan sabit oran alır (%20 / %15 / %10).
 * 4 ile `rewardedPlayerCount` arasındaki oyuncular kalan %55'i
 * SIRAYA değil SKORA orantılı paylaşır — bu, oyuncuya "biraz daha
 * oynarsam payım artar" dedirtir.
 *
 * Tüm aritmetik bigint kuruş üzerinden; float kuruş kaybı yok.
 */
export interface PrizeTable {
  /** userId → kuruş cinsinden tahmini ödül */
  byUserId: Map<string, bigint>;
  /** Kuyruk havuzunun toplamı (kuruş) — açıklama metinleri için */
  tailPoolMinor: bigint;
  /** Kuyruktaki skorların toplamı — pay hesabının paydası */
  tailScoreTotal: bigint;
  /** Ödül alan son sıra */
  rewardedCount: number;
}

export function buildPrizeTable(
  entries: LeaderboardEntry[],
  season: SeasonResponse | null,
): PrizeTable {
  const byUserId = new Map<string, bigint>();
  if (!season) {
    return { byUserId, tailPoolMinor: 0n, tailScoreTotal: 0n, rewardedCount: 0 };
  }

  const poolMinor = toMinor(season.poolAmount);
  const rewardedCount = season.rewardedPlayerCount;
  const { first, second, third, remaining } = season.distribution;

  const podium = [first, second, third];
  const ranked = entries.filter((e) => e.rank <= rewardedCount);

  for (const entry of ranked) {
    if (entry.rank <= 3) {
      const [num, den] = rateToFraction(podium[entry.rank - 1]);
      byUserId.set(entry.userId, shareOf(poolMinor, num, den));
    }
  }

  // Kuyruk: 4. sıradan ödül sınırına kadar.
  const tail = ranked.filter((e) => e.rank > 3);
  const tailScoreTotal = tail.reduce((sum, e) => sum + BigInt(e.score), 0n);

  const [remNum, remDen] = rateToFraction(remaining);
  const tailPoolMinor = shareOf(poolMinor, remNum, remDen);

  for (const entry of tail) {
    byUserId.set(
      entry.userId,
      shareOf(tailPoolMinor, BigInt(entry.score), tailScoreTotal),
    );
  }

  return { byUserId, tailPoolMinor, tailScoreTotal, rewardedCount };
}

/**
 * Kuyruk payı, ilk 100 listesi elde varken hesaplanabilir.
 * Around penceresindeki oyuncu ödül sınırının dışındaysa zaten pay almaz.
 */
export function estimatePrize(
  entry: LeaderboardEntry,
  table: PrizeTable,
): bigint | null {
  if (entry.rank > table.rewardedCount) return null;
  return table.byUserId.get(entry.userId) ?? null;
}
