import { useCallback, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  getAround,
  getLeaderboard,
  getMe,
  getMyRewards,
  getProjection,
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
import { useResource } from '@/hooks/useResource';
import { useSession } from '@/hooks/useSession';
import { buildPrizeTable } from '@/lib/prize';
import { cn } from '@/lib/utils';

const TOP_LIMIT = 100;

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
  const [tab, setTab] = useState<'top' | 'around' | 'country'>('top');

  // Token değiştiğinde (persona geçişi) yetkili uçlar yeniden çekilir.
  const authDeps = useMemo(() => [epoch], [epoch]);

  // Hiçbiri kendi kendine tekrar etmez; tazeleme yalnızca istendiğinde olur.
  const board = useResource(
    useCallback((signal: AbortSignal) => getLeaderboard(TOP_LIMIT, undefined, signal), []),
  );
  const season = useResource(
    useCallback((signal: AbortSignal) => getSeason(signal), []),
  );
  // Yetkili uçlar: token hazır değilken istek atmak 401 döndürür.
  const around = useResource(
    useCallback((signal: AbortSignal) => getAround(undefined, signal), []),
    authDeps,
    { enabled: ready },
  );
  const me = useResource(
    useCallback((signal: AbortSignal) => getMe(signal), []),
    authDeps,
    { enabled: ready },
  );
  // Ödül tutarlarının tek kaynağı: sunucu. İstemcide yeniden hesaplanmaz.
  // Token varsa `me` alanı da gelir (isEligible, pointsToEligible).
  const projection = useResource(
    useCallback((signal: AbortSignal) => getProjection(signal), []),
    authDeps,
    { enabled: ready },
  );
  const rewards = useResource(
    useCallback((signal: AbortSignal) => getMyRewards(signal), []),
    authDeps,
    { enabled: ready },
  );

  // Ödül tablosu: sunucu tutarlarını userId ile eşleştirir.
  const prizes = useMemo(() => buildPrizeTable(projection.data), [projection.data]);

  // Ülke sıralaması sunucudan gelir: sıra numaraları ülke içinde 1'den başlar,
  // yani globalde 2476. olan oyuncu kendi ülkesinde 129. olarak görünür.
  // Sekme açılmadan istek atılmaz.
  const myCountry = me.data?.country ?? null;
  const countryDeps = useMemo(() => [myCountry, epoch], [myCountry, epoch]);

  const countryBoard = useResource(
    useCallback(
      (signal: AbortSignal) => getLeaderboard(TOP_LIMIT, myCountry, signal),
      [myCountry],
    ),
    countryDeps,
    { enabled: ready && !!myCountry && tab === 'country' },
  );

  const countryAround = useResource(
    useCallback((signal: AbortSignal) => getAround(myCountry, signal), [myCountry]),
    countryDeps,
    { enabled: ready && !!myCountry && tab === 'country' },
  );

  const currentUserId = identity?.userId ?? me.data?.userId ?? null;
  const initialLoading = board.loading && !board.data;
  const fatal = sessionError ?? (board.error && !board.data ? board.error : null);

  const refetchAll = useCallback(() => {
    board.refetch();
    around.refetch();
    season.refetch();
    projection.refetch();
    me.refetch();
    rewards.refetch();
  }, [board, around, season, projection, me, rewards]);

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
  // Tablo verisi tazeleniyor mu — yenile düğmesi bunu gösterir.
  const refreshing =
    board.refreshing || around.refreshing || projection.refreshing || me.refreshing;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        {/* Logonun yazısı beyaz; ahşap zeminde kaybolmasın diye koyu bir
            levhanın üstünde duruyor. */}
        <span className="inline-flex items-center rounded-xl border-[3px] border-bark bg-cocoa/85 px-3 py-1.5 shadow-[0_4px_0_rgb(0_0_0/0.3)]">
          <img
            src="/logo.png"
            alt="Panteon"
            width={555}
            height={95}
            className="h-5 w-auto sm:h-6"
          />
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="gold"
            onClick={refetchAll}
            disabled={refreshing}
            aria-label="Tabloyu yenile"
            className="gap-1.5"
          >
            <RefreshCw
              className={cn('size-4', refreshing && 'animate-spin motion-reduce:animate-none')}
            />
            <span className="hidden sm:inline">
              {refreshing ? 'Yenileniyor…' : 'Yenile'}
            </span>
          </Button>
          <PlayerSwitcher mode={mode} busy={sessionLoading} onSwitch={handleSwitch} />
        </div>
      </header>

      <div className="mb-6">
        <SeasonHeader season={season.data} />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_19rem]">
        {/* Ana pano */}
        <GamePanel title="Liderlik Tablosu">
          <div className="mb-3">
            <MyRankCard
              me={me.data}
              around={around.data}
              projectionMe={projection.data?.me ?? null}
            />
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
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="top">İlk 100</TabsTrigger>
                <TabsTrigger value="around">Çevrem</TabsTrigger>
                <TabsTrigger value="country">
                  <CountryTag country={myCountry} />
                  Ülkem
                  {countryBoard.data && (
                    <span className="rounded-full bg-cocoa/15 px-1.5 text-[10px]">
                      {countryBoard.data.total}
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
                    projectionMe={projection.data?.me ?? null}
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
                {!myCountry ? (
                  <p className="px-4 py-10 text-center text-sm font-bold text-cocoa/60">
                    Hesabında ülke bilgisi tanımlı değil.
                  </p>
                ) : countryBoard.loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className="h-11 animate-pulse rounded-full border-2 border-gold-4/50 bg-gold-1/60 motion-reduce:animate-none"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Ülke içindeki kendi sıran — global sıradan farklıdır.
                        İlk 100'de görünmeyen oyuncu burada anlamlı yerde olabilir. */}
                    {countryAround.data?.rank != null && (
                      <p className="mb-3 rounded-xl border-2 border-bark/25 bg-gold-1/60 px-3 py-2 text-center text-[11px] font-bold text-cocoa/75">
                        {myCountry} sıralamasında{' '}
                        <strong className="text-[#a8620c]">
                          {countryAround.data.rank}.
                        </strong>{' '}
                        sıradasın · {tr.format(countryAround.data.total)} oyuncu
                      </p>
                    )}
                    <div className="max-h-[26rem] overflow-y-auto pr-1">
                      <LeaderboardList
                        entries={countryBoard.data?.entries ?? []}
                        currentUserId={currentUserId}
                        // Ödül tahminleri global sıraya göre; ülke sıralamasında
                        // gösterilmez, yanıltıcı olurdu.
                        emptyMessage={`${myCountry} sıralamasında henüz oyuncu yok.`}
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </GamePanel>

        {/* Yan pano: ödül dağılımı ve geçmiş kazanımlar — hepsi API verisi */}
        <div className="space-y-8">
          <GamePanel title="Ödüller">
            <PrizeBreakdown season={season.data} projection={projection.data} />
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
