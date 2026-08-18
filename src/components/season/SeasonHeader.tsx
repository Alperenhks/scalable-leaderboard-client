import type { SeasonResponse } from '@/api/types';
import { useCountdown } from '@/hooks/useCountdown';
import { breakdownSeconds, pad2 } from '@/lib/format';
import { toMinor } from '@/lib/money';
import { cn } from '@/lib/utils';
import { MoneyValue } from '@/components/ui/MoneyValue';

interface Props {
  season: SeasonResponse | null;
}

const DAY = 86400;

/**
 * Üst şerit: geri sayım ve ödül havuzu. Ahşabın üstünde duran
 * iki küçük altın levha.
 */
export function SeasonHeader({ season }: Props) {
  // secondsRemaining bir kez alınır, sayaç istemcide yürür.
  const remaining = useCountdown(season?.secondsRemaining ?? null);

  if (!season) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        <div className="h-16 animate-pulse rounded-2xl border-[3px] border-bark bg-gold-2/60 motion-reduce:animate-none" />
        <div className="h-16 animate-pulse rounded-2xl border-[3px] border-bark bg-gold-2/60 motion-reduce:animate-none" />
      </div>
    );
  }

  const { days, hours, minutes, seconds } = breakdownSeconds(remaining);
  // Son 24 saatte renk değişir — aciliyet hissi.
  const urgent = remaining <= DAY;

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
      <Plate label="⏱ Sezon bitimine">
        <time
          // Ekran okuyucular saniye saniye okumasın.
          aria-live="off"
          dateTime={`P${days}DT${hours}H${minutes}M${seconds}S`}
          className={cn(
            'tnum text-lg font-extrabold sm:text-2xl',
            urgent ? 'text-[#c0392b]' : 'text-cocoa',
          )}
        >
          {days > 0 && `${days}g `}
          {pad2(hours)}s {pad2(minutes)}dk {pad2(seconds)}sn
        </time>
      </Plate>

      <Plate label="💰 Ödül havuzu">
        <MoneyValue
          minor={toMinor(season.poolAmount)}
          className="tnum text-lg font-extrabold text-amount sm:text-2xl"
        />
        <span className="mt-0.5 block text-[10px] font-bold text-cocoa/60">
          {new Intl.NumberFormat('tr-TR').format(season.playerCount)} oyuncu · ilk{' '}
          {season.rewardedPlayerCount} kazanır
        </span>
      </Plate>
    </div>
  );
}

function Plate({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border-[3px] border-bark bg-gradient-to-b from-gold-2 to-gold-3 px-3 py-2 shadow-[inset_0_2px_0_rgb(255_255_255/0.5),0_4px_0_rgb(0_0_0/0.25)] sm:px-4 sm:py-2.5">
      <span className="block text-[10px] font-extrabold uppercase tracking-wide text-cocoa/60">
        {label}
      </span>
      {children}
    </div>
  );
}
