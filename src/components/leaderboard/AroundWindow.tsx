import type { AroundResponse, ProjectionMe } from '@/api/types';
import { formatScoreFull } from '@/lib/format';
import type { PrizeTable } from '@/lib/prize';
import { Button } from '@/components/ui/button';
import { LeaderboardList } from './LeaderboardList';

interface Props {
  around: AroundResponse;
  /** İlk 100 listesinin son sırası — kopukluğun büyüklüğünü hesaplamak için. */
  topWindowSize: number;
  prizes?: PrizeTable;
  /** Sunucunun ödül tahmini — "ödül bölgesine ne kadar kaldı" buradan gelir. */
  projectionMe?: ProjectionMe | null;
  submitting?: boolean;
  onSubmitScore?: () => void;
}

const tr = new Intl.NumberFormat('tr-TR');

/**
 * Oyuncunun çevresindeki pencere. Üç durum:
 *  A) inTopWindow  → zaten ilk 100'de
 *  B) rank != null → ilk 100 dışı: kopukluk göstergesi + 6 kayıt (asıl senaryo)
 *  C) rank == null → hiç oynamamış: eyleme çağıran ekran
 */
export function AroundWindow({
  around,
  topWindowSize,
  prizes,
  projectionMe,
  submitting = false,
  onSubmitScore,
}: Props) {
  // Durum C — sıralamada değil. `rank: null`, `0` değil; bu durumda
  // sunucu `neighbours` olarak boş dizi döner.
  if (around.rank == null || around.neighbours.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-lg font-extrabold text-cocoa">Henüz sıralamada değilsin</p>
        <p className="mx-auto mt-1.5 max-w-xs text-[13px] font-semibold text-cocoa/70">
          İlk uçağını indir, {tr.format(around.total)} oyuncunun arasına gir!
        </p>
        {onSubmitScore && (
          <Button
            variant="leaf"
            size="lg"
            className="mt-5"
            onClick={onSubmitScore}
            disabled={submitting}
          >
            {submitting ? 'Gönderiliyor…' : 'Skor Gönder'}
          </Button>
        )}
      </div>
    );
  }

  // Pencere sunucudan gelir; uzunluğu 3-6 arası değişir, sabit varsayma.
  // Kendi satırı `isCurrentUser` ile bulunur — 1. sıradaki oyuncunun üstünde
  // kimse olmadığı için index'e göre arama yanlış olur.
  const window = around.neighbours;
  const firstWindowRank = window[0]?.rank ?? around.rank;
  // Pencere ilk 100'ün dışındaysa arada atlanan sıralar var demektir.
  const skipped = Math.max(0, firstWindowRank - topWindowSize - 1);
  // Sunucu "ödül bölgesine kaç puan" diyor; sıra farkından daha somut.
  const pointsToEligible = projectionMe?.pointsToEligible ?? null;

  return (
    <div>
      {/* Kopukluk göstergesi: kullanıcı sıraların atlandığını görmeli.
          Pencere zaten ilk 100'ün içindeyse atlanan sıra yok, gösterme. */}
      {skipped > 0 && (
        <div className="mb-2.5 flex items-center gap-2 px-1">
          <span className="h-1 flex-1 rounded-full border-b-2 border-dashed border-bark/35" />
          <span className="rounded-full border-2 border-bark/30 bg-gold-1/70 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-cocoa/70">
            {tr.format(skipped)} sıra atlandı
          </span>
          <span className="h-1 flex-1 rounded-full border-b-2 border-dashed border-bark/35" />
        </div>
      )}

      <LeaderboardList entries={window} prizes={prizes} />

      <p className="mt-3 rounded-xl border-2 border-bark/25 bg-gold-1/60 px-3 py-2 text-center text-[11px] font-bold text-cocoa/75">
        {projectionMe?.isEligible ? (
          <>
            🎉 Ödül bölgesindesin ·{' '}
          </>
        ) : pointsToEligible != null ? (
          <>
            Ödül bölgesine{' '}
            <strong className="text-[#a8620c]">{tr.format(pointsToEligible)} puan</strong>{' '}
            kaldı ·{' '}
          </>
        ) : null}
        toplam {tr.format(around.total)} oyuncu · skorun {formatScoreFull(around.score)}
      </p>
    </div>
  );
}
