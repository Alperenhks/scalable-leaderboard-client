import type { ProjectionResponse, SeasonResponse } from '@/api/types';
import { toMinor } from '@/lib/money';
import { MoneyValue } from '@/components/ui/MoneyValue';

interface Props {
  season: SeasonResponse | null;
  projection: ProjectionResponse | null;
}

/**
 * Havuzun nasıl bölündüğü.
 *
 * İlk üç sıranın tutarı projection'dan doğrudan okunur. Kuyruk (4 – 100)
 * tek bir tutar değil, o aralıktaki tutarların toplamıdır — yine sunucu
 * verisinden toplanır, oran çarpımıyla türetilmez.
 */
export function PrizeBreakdown({ season, projection }: Props) {
  if (!season || !projection) return null;

  const amountOf = (rank: number) =>
    projection.entries.find((e) => e.rank === rank)?.amount ?? '0';

  // Kuyruk toplamı: 4. sıradan ödül sınırına kadar.
  const tailMinor = projection.entries
    .filter((e) => e.rank > 3)
    .reduce((sum, e) => sum + toMinor(e.amount), 0n);

  const slices = [
    { label: '1. sıra', minor: toMinor(amountOf(1)), rate: season.distribution.first, medal: '🥇' },
    { label: '2. sıra', minor: toMinor(amountOf(2)), rate: season.distribution.second, medal: '🥈' },
    { label: '3. sıra', minor: toMinor(amountOf(3)), rate: season.distribution.third, medal: '🥉' },
    {
      label: `4 – ${projection.rewardedPlayerCount}. sıra`,
      minor: tailMinor,
      rate: season.distribution.remaining,
      medal: '🏅',
    },
  ];

  return (
    <ul className="space-y-2">
      {slices.map((s) => (
        <li key={s.label} className="capsule flex items-center gap-2 px-3 py-1.5">
          <span aria-hidden="true" className="text-base">
            {s.medal}
          </span>
          <span className="flex-1 text-[12px] font-bold text-cocoa">{s.label}</span>
          <span className="text-[10px] font-extrabold text-cocoa/50">
            %{Math.round(s.rate * 100)}
          </span>
          <MoneyValue
            minor={s.minor}
            compact
            className="tnum w-16 text-right text-[12px] font-extrabold text-[#a8620c]"
          />
        </li>
      ))}
      <li className="px-2 pt-1 text-[10px] font-semibold leading-relaxed text-cocoa/60">
        4. sıradan sonraki pay sıraya değil skora orantılı bölünür — skorun arttıkça
        payın da artar.
      </li>
    </ul>
  );
}
