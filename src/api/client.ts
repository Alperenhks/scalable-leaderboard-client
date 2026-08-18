import type {
  AroundResponse,
  DemoMode,
  IdentifyResponse,
  LeaderboardResponse,
  MeResponse,
  MeRewardsResponse,
  SeasonResponse,
} from './types';

/**
 * Doğrudan backend'e bağlanır. Farklı bir ortam için VITE_API_BASE ver.
 *
 * Backend'in `Access-Control-Allow-Origin` göndermesi gerekir; aksi halde
 * tarayıcı istekleri CORS'tan bloklar (curl çalışır, tarayıcı çalışmaz).
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  'https://scalable-leaderboard-engine.onrender.com/api';

const TOKEN_KEY = 'panteon.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  auth?: boolean;
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { auth = false, method = 'GET', body, signal } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    // İptal edilen istekleri olduğu gibi yukarı taşı.
    if (signal?.aborted) throw err;
    // Ağ hatası ya da CORS bloğu: fetch ikisini de aynı şekilde raporlar,
    // ama farklı origin'e giderken en olası sebep CORS başlığının eksikliği.
    const crossOrigin = /^https?:\/\//.test(API_BASE);
    throw new ApiError(
      crossOrigin
        ? 'Sunucuya ulaşılamadı. Backend CORS başlığı (Access-Control-Allow-Origin) göndermiyorsa tarayıcı isteği bloklar.'
        : 'Sunucuya ulaşılamadı.',
      0,
    );
  }

  if (!res.ok) {
    // Token süresi dolmuşsa temizle; çağıran taraf yeniden kimlik alır.
    if (res.status === 401) clearToken();
    let detail = res.statusText;
    try {
      const payload = (await res.json()) as { message?: string | string[] };
      if (payload?.message) {
        detail = Array.isArray(payload.message)
          ? payload.message.join(', ')
          : payload.message;
      }
    } catch {
      /* gövde JSON değil — statusText yeterli */
    }
    throw new ApiError(detail, res.status);
  }

  return (await res.json()) as T;
}

/**
 * Demo persona seçer. `mode` verilmezse backend rastgele bir oyuncu döndürür.
 * Token'ı saklamak çağıranın işi — böylece hata durumunda eski token bozulmaz.
 */
export const identify = (mode?: DemoMode, signal?: AbortSignal) =>
  request<IdentifyResponse>('/auth/identify', {
    method: 'POST',
    body: mode ? { mode } : {},
    signal,
  });

/** Backend `limit` üst sınırı 100'dür; daha fazlası 400 döner. */
export const getLeaderboard = (limit = 100, signal?: AbortSignal) =>
  request<LeaderboardResponse>(`/leaderboard?limit=${limit}`, { signal });

export const getAround = (signal?: AbortSignal) =>
  request<AroundResponse>('/leaderboard/around', { auth: true, signal });

export const getSeason = (signal?: AbortSignal) =>
  request<SeasonResponse>('/rewards/season', { signal });

export const getMe = (signal?: AbortSignal) =>
  request<MeResponse>('/me', { auth: true, signal });

export const getMyRewards = (signal?: AbortSignal) =>
  request<MeRewardsResponse>('/me/rewards', { auth: true, signal });

export interface SubmitScoreResponse {
  userId: string;
  seasonId: string;
  delta: number;
  totalScore: number;
  rank: number;
  duplicate: boolean;
}

/**
 * Skor ekler. `delta` tamsayı ve |delta| <= 1_000_000 olmalı;
 * `source` yalnızca küçük harf, rakam ve alt çizgi içerebilir.
 */
export const submitScore = (delta: number, source: string, signal?: AbortSignal) =>
  request<SubmitScoreResponse>('/score', {
    method: 'POST',
    auth: true,
    body: { delta, source },
    signal,
  });
