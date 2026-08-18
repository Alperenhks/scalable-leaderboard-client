import type { MeRewardsResponse } from '@/api/types';
import { formatMinor, toMinor } from '@/lib/money';

interface Props {
  rewards: MeRewardsResponse | null;
}

/** Geçmiş kazanımlar. Kayıt yoksa bölüm hiç render edilmez. */
export function RewardHistory({ rewards }: Props) {
  if (!rewards || rewards.count === 0) return null;

  return (
    <ul className="space-y-2">
      {rewards.rewards.map((r, i) => (
        <li
          key={`${r.seasonId ?? 'sezon'}-${i}`}
          className="capsule flex items-center gap-2 px-3 py-1.5"
        >
          <span className="flex-1 text-[12px] font-bold text-cocoa">
            {r.seasonId ?? 'önceki sezon'}
          </span>
          {r.rank != null && (
            <span className="text-[11px] font-extrabold text-cocoa/60">{r.rank}.</span>
          )}
          {r.amount != null && (
            <span className="tnum text-[12px] font-extrabold text-amount">
              {formatMinor(toMinor(r.amount))}
            </span>
          )}
        </li>
      ))}
      <li className="flex items-center justify-between px-2 pt-1 text-[11px] font-extrabold text-cocoa/70">
        <span>Toplam kazanç</span>
        <span className="text-amount">
          {formatMinor(toMinor(rewards.totalEarned))}
        </span>
      </li>
    </ul>
  );
}
