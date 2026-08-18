import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  /** Kurdele üzerinde yazan başlık. */
  title: string;
  /** Başlığın solunda duran tema simgesi (dekoratif). */
  icon?: string;
  children: ReactNode;
  /** Panelin altına sabitlenen eylem alanı (düğmeler). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Oyun paneli: altın gövde, kalın kontur ve üstünde kurdele başlık.
 * Kurdele panelin dışına taşar, bu yüzden kapsayıcıda üstten boşluk var.
 */
export function GamePanel({ title, icon, children, footer, className }: Props) {
  return (
    <section className={cn('relative min-w-0 pt-7', className)}>
      {/* Kurdele: panelin üst kenarına oturur, iki ucu aşağı kıvrılır */}
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
        <div className="relative">
          {/* Kurdelenin yan kanatları — gökyüzü mavisi, uçak kanadı çağrışımı */}
          <span
            aria-hidden="true"
            className="absolute -left-4 top-2 h-8 w-8 -skew-y-12 rounded-sm border-4 border-bark bg-sky-d"
          />
          <span
            aria-hidden="true"
            className="absolute -right-4 top-2 h-8 w-8 skew-y-12 rounded-sm border-4 border-bark bg-sky-d"
          />
          {/* Kurdelenin gövdesi */}
          <h2 className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border-4 border-bark bg-gradient-to-b from-gold-2 to-gold-3 px-3.5 py-1.5 text-center text-base font-extrabold uppercase tracking-wide text-stroked shadow-[0_5px_0_rgb(0_0_0/0.3)] sm:px-6 sm:text-2xl">
            {icon && (
              <span aria-hidden="true" className="text-sm sm:text-xl">
                {icon}
              </span>
            )}
            {title}
          </h2>
        </div>
      </div>

      <div className="panel-gold relative overflow-hidden px-2.5 pb-4 pt-9 sm:px-4">
        {/* Üst kenarda pist şeridi — panelin havacılık kimliği */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-[repeating-linear-gradient(90deg,var(--color-sky)_0_14px,var(--color-coin-1)_14px_28px)] opacity-60"
        />
        {children}
        {footer && <div className="mt-4 flex justify-center gap-3">{footer}</div>}
      </div>
    </section>
  );
}
