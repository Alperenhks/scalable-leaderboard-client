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
 * Üst şerit: geri sayım ve ödül havuzu.
 *
 * Tek bir kompakt bant olarak durur. Önce iki büyük levha halindeydi ve
 * ekranın üst üçte birini kaplıyordu — asıl içerik olan liderlik tablosunu
 * katlamanın altına itiyordu. Bilgi aynı, kapladığı alan yarıdan az.
 */
export function SeasonHeader({ season }: Props) {
  // secondsRemaining bir kez alınır, sayaç istemcide yürür.
  const remaining = useCountdown(season?.secondsRemaining ?? null);

  if (!season) {
    return (
      <div className="h-12 animate-pulse rounded-2xl border-[3px] border-bark bg-gold-2/60 motion-reduce:animate-none" />
    );
  }

  const { days, hours, minutes, seconds } = breakdownSeconds(remaining);
  const urgent = remaining <= DAY;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border-[3px] border-bark bg-gradient-to-b from-gold-2 to-gold-3 px-3 py-2 shadow-[inset_0_2px_0_rgb(255_255_255/0.5),0_4px_0_rgb(0_0_0/0.25)] sm:px-4">
      {/* Kalkışa kalan süre */}
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true" className="text-base sm:text-lg">
          🛫
        </span>
        <div className="min-w-0">
          <span className="block text-[9px] font-extrabold uppercase tracking-wide text-cocoa/60 sm:text-[10px]">
            Kalkışa
          </span>
          <time
            // Ekran okuyucular saniye saniye okumasın.
            aria-live="off"
            dateTime={`P${days}DT${hours}H${minutes}M${seconds}S`}
            className={cn(
              'tnum block whitespace-nowrap text-sm font-extrabold leading-tight sm:text-lg',
              urgent ? 'text-rose-d' : 'text-cocoa',
            )}
          >
            {days > 0 && `${days}g `}
            {pad2(hours)}:{pad2(minutes)}:{pad2(seconds)}
          </time>
        </div>
      </div>

      {/* Ayırıcı — pist çizgisi */}
      <span
        aria-hidden="true"
        className="hidden h-8 w-px shrink-0 bg-bark/25 sm:block"
      />

      {/* Ödül havuzu */}
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true" className="text-base sm:text-lg">
          🏆
        </span>
        <div className="min-w-0 text-right sm:text-left">
          <span className="block text-[9px] font-extrabold uppercase tracking-wide text-cocoa/60 sm:text-[10px]">
            Ödül havuzu · ilk {season.rewardedPlayerCount}
          </span>
          <MoneyValue
            minor={toMinor(season.poolAmount)}
            className="tnum block whitespace-nowrap text-sm font-extrabold leading-tight text-amount sm:text-lg"
          />
        </div>
      </div>
    </div>
  );
}
