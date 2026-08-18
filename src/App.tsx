import { useCallback, useMemo, useState } from 'react';
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
import { formatCountry } from '@/lib/format';
import { buildPrizeTable } from '@/lib/prize';

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

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitScore = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitScore(25_000, 'first_landing');
      refetchAll();
    } catch (err) {
      // Sessizce yutmak, düğmenin hiçbir şey yapmamış gibi eski haline
      // dönmesi demekti; kullanıcı isteğin başarısız olduğunu anlamazdı.
      setSubmitError(
        err instanceof Error ? err.message : 'Skor gönderilemedi.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [refetchAll]);

  const hasRewards = (rewards.data?.count ?? 0) > 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <header className="mb-3 flex items-center justify-between gap-3">
        {/* Oyun kimliği: koyu gövde üzerinde açık yazı — gece gökyüzü
            zemininde okunur kalsın diye. Alt kenardaki ince şerit pist
            çizgisini andırır. */}
        <span className="relative inline-flex min-w-0 items-center gap-2 overflow-hidden rounded-xl border-[3px] border-sky-d bg-gradient-to-b from-[#1d3f6b] to-[#12304f] px-2.5 py-1.5 shadow-[0_4px_0_rgb(0_0_0/0.35)] sm:px-3.5">
          <span aria-hidden="true" className="text-sm sm:text-base">
            🛩️
          </span>
          <span className="truncate text-[13px] font-extrabold uppercase tracking-wider text-cream sm:text-[15px]">
            Airport Master
          </span>
          {/* Pist şeridi */}
          <span
            aria-hidden="true"
            className="absolute inset-x-2 bottom-0 h-[2px] bg-[repeating-linear-gradient(90deg,var(--color-coin-1)_0_10px,transparent_10px_20px)] opacity-70"
          />
        </span>
        <PlayerSwitcher mode={mode} busy={sessionLoading} onSwitch={handleSwitch} />
      </header>

      <div className="mb-4">
        <SeasonHeader season={season.data} />
      </div>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        {/* Ana pano */}
        <GamePanel title="Liderlik Tablosu" icon="🛫">
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
                    submitError={submitError}
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
                        {formatCountry(myCountry)} sıralamasında{' '}
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
                        emptyMessage={`${formatCountry(myCountry)} sıralamasında henüz oyuncu yok.`}
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
          <GamePanel title="Ödüller" icon="🏆">
            <PrizeBreakdown season={season.data} projection={projection.data} />
          </GamePanel>

          {hasRewards && (
            <GamePanel title="Geçmişin" icon="🧳">
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
