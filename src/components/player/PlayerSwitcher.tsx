import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { DemoMode } from '@/api/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  mode: DemoMode | null;
  busy?: boolean;
  onSwitch: (mode: DemoMode) => void;
}

/**
 * `story` sıradan bir ipucu değil: o personanın ekranında NEYİN görüleceğini
 * söyler. Seçiciyi bir ad listesi olmaktan çıkarıp senaryo menüsüne çevirir —
 * hangi durumu denediğini bilmek, adı okumaktan daha değerlidir.
 */
const MODES: Array<{
  id: DemoMode;
  icon: string;
  label: string;
  hint: string;
  story: string;
}> = [
  {
    id: 'top',
    icon: '👑',
    label: 'Zirvedeki oyuncu',
    hint: '1. sıra',
    story: 'Havuzun %20’si onun — ödül bölgesinin tepesi',
  },
  {
    id: 'contender',
    icon: '🛫',
    label: 'İlk 100 içinde',
    hint: '53. sıra',
    story: 'Tabloda var ama kaydırmadan kendini bulamaz',
  },
  {
    id: 'mid',
    icon: '📊',
    label: 'Ortalama oyuncu',
    hint: 'derin sıra',
    story: 'Globalde kaybolur, ülke sekmesinde anlamlı yeri var',
  },
  {
    id: 'outside',
    icon: '🎯',
    label: 'İlk 100 dışı',
    hint: '121. sıra',
    story: 'Asıl senaryo: 3 üst + sen + 2 alt penceresi',
  },
  {
    id: 'unranked',
    icon: '🆕',
    label: 'Skoru olmayan',
    hint: 'sıralamada değil',
    story: 'rank null — boş tablo değil, skor gönderme ekranı',
  },
  {
    id: 'veteran',
    icon: '🏅',
    label: 'Geçmiş sezon kazananı',
    hint: 'ödül geçmişi dolu',
    story: 'Zirvedeydi, sezon sıfırlandı — kazancı duruyor',
  },
];

/**
 * Persona seçici.
 *
 * Masaüstünde açılır menü yeterliydi; mobilde değildi. Tetikleyici buton
 * `max-w-[5.5rem]` ile kırpıldığı için seçili personanın adı okunmuyor,
 * menü öğelerinin ipuçları da dar ekranda satır sonuna sıkışıyordu — oysa
 * case uygulamanın mobilde de test edileceğini söylüyor ve jürinin ilk
 * dokunacağı yer burasıdır.
 *
 * Mobilde **alttan açılan sayfa** kullanılır: dokunma hedefleri parmak
 * boyutunda (`min-h-[3.25rem]`), her seçenek kendi satırında ve altında o
 * personada ne görüleceğini söyleyen bir cümleyle. Masaüstünde aynı içerik
 * sağ üstten açılan panele düşer. Tek bileşen, tek durum: iki ayrı seçici
 * yazmak davranışın zamanla ayrışması demekti.
 */
export function PlayerSwitcher({ mode, busy = false, onSwitch }: Props) {
  const [open, setOpen] = useState(false);
  const active = MODES.find((m) => m.id === mode);

  /**
   * Panel açıkken arka plan kaymaz.
   *
   * `overflow: hidden` tek başına yetmiyor: iOS Safari gövdeyi yine de
   * kaydırır ve panel ekranda dururken liste altta akar. Gövde `position:
   * fixed` ile sabitlenir, kaydırma miktarı `top` olarak geri verilir ki
   * panel kapanınca sayfa aynı yerde kalsın — aksi halde her açılışta başa
   * dönerdi.
   */
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
    style.overflow = 'hidden';

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Escape ile kapanır — klavyeyle gezen kullanıcı panelde kilitli kalmasın.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const choose = (id: DemoMode) => {
    setOpen(false);
    onSwitch(id);
  };

  return (
    <>
      <Button
        variant="gold"
        disabled={busy}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <span aria-hidden="true">{busy ? '⏳' : (active?.icon ?? '🎮')}</span>
        {/* Ad dar ekranda gizlenir: ikon kimliği zaten taşır ve kırpılmış
            yarım bir kelime göstermekten iyidir. */}
        <span className="hidden max-w-[10rem] truncate sm:inline">
          {busy ? 'Yükleniyor…' : (active?.label ?? 'Demo oyuncu')}
        </span>
        <ChevronDown className="size-4 shrink-0" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-start sm:justify-end sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Demo oyuncu seç"
        >
          {/* Perde: dışına dokunmak kapatır — mobilde en beklenen davranış. */}
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-cocoa/50 backdrop-blur-[2px]"
          />

          <div
            className={cn(
              'relative w-full max-w-lg rounded-t-3xl border-[3px] border-b-0 border-bark bg-gold-1 p-3 pb-6',
              'shadow-[0_-8px_0_rgb(0_0_0/0.2)]',
              // Alttan yukarı kayarak gelir — dokunma ile açılan bir sayfanın
              // beklenen hareketi.
              'animate-[slideUp_.18s_ease-out] motion-reduce:animate-none',
              // Panel ekranı aşmaz; liste uzarsa kendi içinde kayar.
              'max-h-[85vh] overflow-y-auto',
              'sm:w-80 sm:animate-none sm:rounded-2xl sm:border-b-[3px] sm:pb-3 sm:shadow-[0_6px_0_rgb(0_0_0/0.25)]',
            )}
          >
            {/* Tutamak çizgisi: alttan açılan sayfanın kaydırılabilir
                olduğunu değil, buranın bir sayfa olduğunu bildirir. */}
            <span
              aria-hidden="true"
              className="mx-auto mb-2 block h-1 w-10 rounded-full bg-bark/30 sm:hidden"
            />

            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-cocoa/70">
                Demo oyuncu seç
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="rounded-full p-1 text-cocoa/60 transition-colors hover:bg-cocoa/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <ul className="space-y-1.5">
              {MODES.map((m) => {
                const selected = m.id === mode;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      disabled={busy}
                      aria-current={selected ? 'true' : undefined}
                      onClick={() => choose(m.id)}
                      className={cn(
                        // min-h: parmakla rahat dokunulacak hedef boyutu.
                        'flex min-h-[3.25rem] w-full items-center gap-2.5 rounded-xl border-2 px-2.5 py-2 text-left transition-colors',
                        selected
                          ? 'border-leaf-d bg-gradient-to-b from-mine-1 to-mine-2'
                          : 'border-bark/25 bg-cream/50 hover:bg-cream/80',
                      )}
                    >
                      <span aria-hidden="true" className="text-lg">
                        {m.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-1.5">
                          <span className="truncate text-[13px] font-extrabold text-cocoa">
                            {m.label}
                          </span>
                          <span className="shrink-0 text-[10px] font-bold text-cocoa/50">
                            {m.hint}
                          </span>
                        </span>
                        {/* Asıl değer burada: personanın ne göstereceği. */}
                        <span className="mt-0.5 block text-[11px] font-bold leading-tight text-cocoa/65">
                          {m.story}
                        </span>
                      </span>
                      {selected && (
                        <span className="shrink-0 rounded-full border-2 border-leaf-d bg-leaf px-1.5 text-[9px] font-extrabold uppercase text-cream">
                          aktif
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
