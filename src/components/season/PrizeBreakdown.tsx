import type { SeasonResponse } from '@/api/types';
import { rateToFraction, shareOf, toMinor } from '@/lib/money';
import { MoneyValue } from '@/components/ui/MoneyValue';

interface Props {
  season: SeasonResponse | null;
}

/**
 * Havuzun nasıl bölündüğü. Oranlar API'den gelir, tutarlar kuruş
 * cinsinden bigint ile hesaplanır — float kuruş kaybı yok.
 */
export function PrizeBreakdown({ season }: Props) {
  if (!season) return null;

  const poolMinor = toMinor(season.poolAmount);
  const { first, second, third, remaining } = season.distribution;

  const slices = [
    { label: '1. sıra', rate: first, medal: '🥇' },
    { label: '2. sıra', rate: second, medal: '🥈' },
    { label: '3. sıra', rate: third, medal: '🥉' },
    { label: `4 – ${season.rewardedPlayerCount}. sıra`, rate: remaining, medal: '🏅' },
  ];

  return (
    <ul className="space-y-2">
      {slices.map((s) => {
        const [num, den] = rateToFraction(s.rate);
        return (
          <li key={s.label} className="capsule flex items-center gap-2 px-3 py-1.5">
            <span aria-hidden="true" className="text-base">
              {s.medal}
            </span>
            <span className="flex-1 text-[12px] font-bold text-cocoa">{s.label}</span>
            <span className="text-[10px] font-extrabold text-cocoa/50">
              %{Math.round(s.rate * 100)}
            </span>
            <MoneyValue
              minor={shareOf(poolMinor, num, den)}
              compact
              className="tnum w-16 text-right text-[12px] font-extrabold text-[#a8620c]"
            />
          </li>
        );
      })}
      <li className="px-2 pt-1 text-[10px] font-semibold leading-relaxed text-cocoa/60">
        4. sıradan sonraki pay sıraya değil skora orantılı bölünür — skorun arttıkça
        payın da artar.
      </li>
    </ul>
  );
}
