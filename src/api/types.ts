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
  total: number;
  limit: number;
  offset: number;
  entries: LeaderboardEntry[];
}

export interface AroundResponse {
  seasonId: string;
  userId: string;
  /** Oyuncu hiç oynamamışsa null — bu `0` DEĞİLDİR. */
  rank: number | null;
  score: number;
  total: number;
  /** true ise oyuncu zaten ilk 100'de; ayrı pencere gösterme. */
  inTopWindow: boolean;
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
