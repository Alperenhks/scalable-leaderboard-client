import { ChevronDown } from 'lucide-react';
import type { DemoMode } from '@/api/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  mode: DemoMode | null;
  busy?: boolean;
  onSwitch: (mode: DemoMode) => void;
}

const MODES: Array<{ id: DemoMode; label: string; hint: string }> = [
  { id: 'top', label: '👑 Zirvedeki oyuncu', hint: '1. sıra' },
  { id: 'contender', label: '🛫 İlk 100 içinde', hint: '53. sıra' },
  { id: 'mid', label: '📊 Ortalama oyuncu', hint: '~2500. sıra' },
  { id: 'outside', label: '🎯 İlk 100 dışı', hint: '121. sıra' },
  { id: 'unranked', label: '🆕 Skoru olmayan', hint: 'sıralamada değil' },
];

/**
 * Değerlendirme için persona seçici. Token arka planda değişir;
 * dört ekran durumu tek tıkla denenebilir.
 */
export function PlayerSwitcher({ mode, busy = false, onSwitch }: Props) {
  const active = MODES.find((m) => m.id === mode);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="gold" disabled={busy} className="gap-1.5">
          <span className="max-w-[5.5rem] truncate sm:max-w-[10rem]">
            {busy ? 'Yükleniyor…' : (active?.label ?? '🎮 Demo oyuncu')}
          </span>
          <ChevronDown className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Demo oyuncu seç</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={mode ?? ''}
          onValueChange={(v) => onSwitch(v as DemoMode)}
        >
          {MODES.map((m) => (
            <DropdownMenuRadioItem key={m.id} value={m.id} disabled={busy}>
              <span className="flex-1 text-[12px] font-bold text-cocoa">{m.label}</span>
              <span className="text-[10px] font-bold text-cocoa/55">{m.hint}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
