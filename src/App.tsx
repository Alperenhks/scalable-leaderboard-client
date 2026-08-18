import { useCallback, useMemo, useState } from 'react';
import {
  getAround,
  getLeaderboard,
  getMe,
  getMyRewards,
  getSeason,
  submitScore,
} from '@/api/client';
import type { DemoMode } from '@/api/types';
import { AroundWindow } from '@/components/leaderboard/AroundWindow';
import { LeaderboardList } from '@/components/leaderboard/LeaderboardList';
import { MyRankCard } from '@/components/player/MyRankCard';
import { PlayerSwitcher } from '@/components/player/PlayerSwitcher';
import { RewardHistory } from '@/components/player/RewardHistory';
import { PrizeBreakdown } from '@/components/season/PrizeBreakdown';
import { SeasonHeader } from '@/components/season/SeasonHeader';
import { Button } from '@/components/ui/button';
import { CountryTag } from '@/components/ui/CountryTag';
import { GamePanel } from '@/components/ui/GamePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePolling } from '@/hooks/usePolling';
import { useSession } from '@/hooks/useSession';
import { buildPrizeTable } from '@/lib/prize';

const TOP_LIMIT = 100;

// Tazeleme sıklıkları: zirve yavaş değişir, kendi sıran daha kritik.
const POLL_LEADERBOARD = 30_000;
const POLL_AROUND = 15_000;
const POLL_SEASON = 60_000;
const POLL_ME = 15_000;

const tr = new Intl.NumberFormat('tr-TR');

export default function App() {
  const {
    identity,
    mode,
    loading: sessionLoading,
    error: sessionError,
    switchTo,
    epoch,
    ready,
  } = useSession();
  const [submitting, setSubmitting] = useState(false);

  // Token değiştiğinde (persona geçişi) yetkili uçlar yeniden çekilir.
  const authDeps = useMemo(() => [epoch], [epoch]);

  const board = usePolling(
    useCallback((signal: AbortSignal) => getLeaderboard(TOP_LIMIT, signal), []),
    POLL_LEADERBOARD,
  );
  const season = usePolling(
    useCallback((signal: AbortSignal) => getSeason(signal), []),
    POLL_SEASON,
  );
  // Yetkili uçlar: token hazır değilken istek atmak 401 döndürür.
  const around = usePolling(
    useCallback((signal: AbortSignal) => getAround(signal), []),
    POLL_AROUND,
    authDeps,
    { enabled: ready },
  );
  const me = usePolling(
    useCallback((signal: AbortSignal) => getMe(signal), []),
    POLL_ME,
    authDeps,
    { enabled: ready },
  );
  const rewards = usePolling(
    useCallback((signal: AbortSignal) => getMyRewards(signal), []),
    POLL_SEASON,
    authDeps,
    { enabled: ready },
  );

  // Ödül tablosu ilk 100 + sezon verisinden hesaplanır.
  const prizes = useMemo(
    () => buildPrizeTable(board.data?.entries ?? [], season.data),
    [board.data, season.data],
  );

  // Ülke sekmesi: backend'de ülke filtresi yok (?country= 400 döner),
  // bu yüzden çekilmiş ilk 100 üzerinde istemcide filtreleniyor.
  const myCountry = me.data?.country ?? null;
  const countryEntries = useMemo(() => {
    if (!myCountry) return [];
    return (board.data?.entries ?? []).filter((e) => e.country === myCountry);
  }, [board.data, myCountry]);

  const currentUserId = identity?.userId ?? me.data?.userId ?? null;
  const initialLoading = board.loading && !board.data;
  const fatal = sessionError ?? (board.error && !board.data ? board.error : null);

  const refetchAll = useCallback(() => {
    board.refetch();
    around.refetch();
    season.refetch();
    me.refetch();
    rewards.refetch();
  }, [board, around, season, me, rewards]);

  const handleSwitch = useCallback((next: DemoMode) => void switchTo(next), [switchTo]);

  // İlk skor gönderimi — sıralamada olmayan oyuncu için.
  const handleSubmitScore = useCallback(async () => {
    setSubmitting(true);
    try {
      await submitScore(25_000, 'first_landing');
      refetchAll();
    } finally {
      setSubmitting(false);
    }
  }, [refetchAll]);

  const hasRewards = (rewards.data?.count ?? 0) > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-[0.24em] text-cream/70">
          Panteon
        </span>
        <PlayerSwitcher mode={mode} busy={sessionLoading} onSwitch={handleSwitch} />
      </header>

      <div className="mb-6">
        <SeasonHeader season={season.data} />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_19rem]">
        {/* Ana pano */}
        <GamePanel title="Liderlik Tablosu">
          <div className="mb-3">
            <MyRankCard me={me.data} around={around.data} prizes={prizes} />
          </div>

          {fatal ? (
            <div className="px-4 py-10 text-center">
              <p className="text-lg font-extrabold text-cocoa">Tablo yüklenemedi</p>
              <p className="mx-auto mt-1.5 max-w-xs text-[13px] font-semibold text-cocoa/70">
                {fatal.message}
              </p>
              <Button variant="sky" className="mt-4" onClick={refetchAll}>
                Tekrar Dene
              </Button>
            </div>
          ) : initialLoading ? (
            <div className="space-y-2">
              <p className="pb-1 text-center text-[11px] font-bold text-cocoa/60">
                Sunucu uyanıyor, ilk yükleme yarım dakikayı bulabilir…
              </p>
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-11 animate-pulse rounded-full border-2 border-gold-4/50 bg-gold-1/60 motion-reduce:animate-none"
                />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="top">
              <TabsList>
                <TabsTrigger value="top">İlk 100</TabsTrigger>
                <TabsTrigger value="around">Çevrem</TabsTrigger>
                <TabsTrigger value="country">
                  <CountryTag country={myCountry} />
                  Ülkem
                  {myCountry && (
                    <span className="rounded-full bg-cocoa/15 px-1.5 text-[10px]">
                      {countryEntries.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Liste kutusu: içeride kaydırılır, sayfa sıçramaz */}
              <TabsContent value="top">
                <div className="max-h-[26rem] overflow-y-auto pr-1">
                  <LeaderboardList
                    entries={board.data?.entries ?? []}
                    currentUserId={currentUserId}
                    prizes={prizes}
                  />
                </div>
              </TabsContent>

              <TabsContent value="around">
                {around.data ? (
                  <AroundWindow
                    around={around.data}
                    topWindowSize={TOP_LIMIT}
                    prizes={prizes}
                    submitting={submitting}
                    onSubmitScore={handleSubmitScore}
                  />
                ) : (
                  <div className="space-y-2">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className="h-11 animate-pulse rounded-full border-2 border-gold-4/50 bg-gold-1/60 motion-reduce:animate-none"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="country">
                <div className="max-h-[26rem] overflow-y-auto pr-1">
                  {myCountry ? (
                    <LeaderboardList
                      entries={countryEntries}
                      currentUserId={currentUserId}
                      prizes={prizes}
                      emptyMessage={`İlk ${TOP_LIMIT} içinde ${myCountry} oyuncusu yok.`}
                    />
                  ) : (
                    <p className="px-4 py-10 text-center text-sm font-bold text-cocoa/60">
                      Hesabında ülke bilgisi tanımlı değil.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </GamePanel>

        {/* Yan pano: ödül dağılımı ve geçmiş kazanımlar — hepsi API verisi */}
        <div className="space-y-8">
          <GamePanel title="Ödüller">
            <PrizeBreakdown season={season.data} />
          </GamePanel>

          {hasRewards && (
            <GamePanel title="Geçmişin">
              <RewardHistory rewards={rewards.data} />
            </GamePanel>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center text-[11px] font-bold text-cream/50">
        {board.data
          ? `${tr.format(board.data.total)} oyuncu · sezon ${board.data.seasonId}`
          : ''}
      </footer>
    </div>
  );
}
