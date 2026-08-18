/** Backend sözleşmesi — https://scalable-leaderboard-engine.onrender.com/api */

/** Para alanları DAİMA string gelir. Aritmetik için `lib/money` kullan. */
export type MoneyString = string;

/** ISO 3166-1 alpha-2. Backend null dönebilir. */
export type CountryCode = string | null;

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  country: CountryCode;
  /** Sadece /leaderboard/around yanıtında bulunur. */
  isCurrentUser?: boolean;
}

export interface LeaderboardResponse {
  seasonId: string;
  /** Ülke filtresi uygulandıysa ISO kodu, global sorguda null. */
  country: CountryCode;
  /** Filtre varsa o ülkedeki toplam oyuncu, yoksa genel toplam. */
  total: number;
  limit: number;
  offset: number;
  /** Ülke filtresinde sıra numaraları ülke içinde 1'den başlar. */
  entries: LeaderboardEntry[];
}

export interface AroundResponse {
  seasonId: string;
  /** Ülke filtresi uygulandıysa ISO kodu, global sorguda null. */
  country: CountryCode;
  userId: string;
  /**
   * Oyuncu hiç oynamamışsa null — bu `0` DEĞİLDİR.
   * Ülke filtresinde bu sıra ülke içindedir (global sıra değil).
   */
  rank: number | null;
  score: number;
  total: number;
  /** true ise oyuncu zaten ilk 100'de. */
  inTopWindow: boolean;
  /**
   * Oyuncunun çevresindeki pencere. UZUNLUĞU SABİT DEĞİL (3–6):
   *   1. sıra      → üstünde kimse yok, 3 kayıt
   *   2-3. sıra    → 5 kayıt
   *   4 ve sonrası → 3 üst + kendisi + 2 alt = 6 kayıt
   *   son sıra     → altında kimse yok, 4 kayıt
   * Oyuncu sıralamada değilse boş dizi döner.
   *
   * Kendi satırını index'e göre değil `isCurrentUser` ile bul.
   */
  neighbours: LeaderboardEntry[];
  /** Geniş liste; "Çevrem" için `neighbours` kullanılır. */
  entries: LeaderboardEntry[];
}

export interface SeasonResponse {
  seasonId: string;
  isCurrentSeason: boolean;
  startsAt: string;
  endsAt: string;
  /** Bir kez alınır, geri sayım istemcide yürür. */
  secondsRemaining: number;
  serverTime: string;
  poolAmount: MoneyString;
  playerCount: number;
  prizePoolRate: number;
  rewardedPlayerCount: number;
  distribution: {
    first: number;
    second: number;
    third: number;
    remaining: number;
  };
}

export interface MeResponse {
  userId: string;
  username: string;
  country: CountryCode;
  seasonId: string;
  rank: number | null;
  score: number;
  balance: MoneyString;
  lastReward: unknown | null;
}

export interface RewardHistoryItem {
  seasonId?: string;
  rank?: number;
  amount?: MoneyString;
  [key: string]: unknown;
}

export interface MeRewardsResponse {
  userId: string;
  count: number;
  totalEarned: MoneyString;
  rewards: RewardHistoryItem[];
}

/** Jüri için hazır demo personaları. */
export type DemoMode = 'top' | 'mid' | 'outside' | 'unranked';

export interface IdentifyResponse {
  token: string;
  userId: string;
  username: string;
  roles: string[];
  rank: number | null;
  score: number;
  seasonId: string;
}

export interface ProjectionEntry {
  rank: number;
  userId: string;
  /** Kuruş hassasiyetinde string — Number'a çevirme. */
  amount: MoneyString;
}

export interface ProjectionMe {
  rank: number | null;
  score: number;
  amount: MoneyString;
  /** Ödül bölgesinde mi? */
  isEligible: boolean;
  /** Ödül bölgesine girmek için gereken puan; zaten içerideyse null. */
  pointsToEligible: number | null;
}

/**
 * "Sezon şu an bitse ne kazanırım?" — ödül tutarlarının tek kaynağı.
 * İstemcide yeniden hesaplamak yerine bunu kullan: gösterilen tutar
 * ödenecek tutardan ayrışmasın.
 *
 * Auth'suz da çalışır; o durumda `me` null döner.
 */
export interface ProjectionResponse {
  seasonId: string;
  poolAmount: MoneyString;
  rewardedPlayerCount: number;
  entries: ProjectionEntry[];
  me: ProjectionMe | null;
}
