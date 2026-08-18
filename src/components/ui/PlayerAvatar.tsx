import { cn } from '@/lib/utils';

interface Props {
  userId: string;
  username: string;
  className?: string;
}

/**
 * API avatar görseli döndürmüyor. Foto uydurmak yerine userId'den
 * deterministik bir renk türetiyoruz: aynı oyuncu her zaman aynı rozeti alır.
 */
const TONES = [
  ['#8d5a3b', '#6b4029'],
  ['#4b86c4', '#2f5f92'],
  ['#5aa86a', '#3b7a48'],
  ['#c4685a', '#96453a'],
  ['#8e6bb8', '#66468d'],
  ['#c99a3f', '#9c7325'],
] as const;

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** "demo_turbo_falcon_220" → "TF" */
function initials(username: string): string {
  const words = username.split(/[_\s-]+/).filter((w) => /^[a-zA-Z]/.test(w));
  const picked = words.filter((w) => w.toLowerCase() !== 'demo').slice(0, 2);
  const source = picked.length > 0 ? picked : words.slice(0, 2);
  return source.map((w) => w[0]!.toUpperCase()).join('') || '?';
}

export function PlayerAvatar({ userId, username, className }: Props) {
  const [from, to] = TONES[hash(userId) % TONES.length]!;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full border-[3px] border-bark font-extrabold text-cream',
        'text-[10px] shadow-[inset_0_2px_0_rgb(255_255_255/0.25)]',
        className,
      )}
      style={{ backgroundImage: `linear-gradient(180deg, ${from}, ${to})` }}
    >
      {initials(username)}
    </span>
  );
}
