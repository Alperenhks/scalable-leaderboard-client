import type { LeaderboardEntry, ProjectionResponse } from '../api/types';
import { toMinor } from './money';

/**
 * Ödül tutarları sunucudan gelir (`GET /rewards/projection`).
 *
 * Bu tutarlar istemcide YENİDEN HESAPLANMAZ: gösterilen rakam ile ödenecek
 * rakamın ayrışmaması için tek kaynak sunucudur. Burada yapılan iş sadece
 * string tutarları kuruş `bigint`ine çevirip userId ile eşleştirmek.
 */
export interface PrizeTable {
  /** userId → kuruş cinsinden tahmini ödül */
  byUserId: Map<string, bigint>;
  /** Ödül alan son sıra */
  rewardedCount: number;
}

const EMPTY: PrizeTable = { byUserId: new Map(), rewardedCount: 0 };

export function buildPrizeTable(projection: ProjectionResponse | null): PrizeTable {
  if (!projection) return EMPTY;

  const byUserId = new Map<string, bigint>();
  for (const entry of projection.entries) {
    byUserId.set(entry.userId, toMinor(entry.amount));
  }

  return { byUserId, rewardedCount: projection.rewardedPlayerCount };
}

/** Ödül sınırının dışındaki oyuncu pay almaz; o durumda null döner. */
export function estimatePrize(
  entry: LeaderboardEntry,
  table: PrizeTable,
): bigint | null {
  return table.byUserId.get(entry.userId) ?? null;
}
