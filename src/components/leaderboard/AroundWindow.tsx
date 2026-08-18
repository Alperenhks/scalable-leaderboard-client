import type { AroundResponse } from '@/api/types';
import { formatScoreFull } from '@/lib/format';
import type { PrizeTable } from '@/lib/prize';
import { Button } from '@/components/ui/button';
import { LeaderboardList } from './LeaderboardList';

interface Props {
  around: AroundResponse;
  /** İlk 100 listesinin son sırası — kopukluğun büyüklüğünü hesaplamak için. */
  topWindowSize: number;
  prizes?: PrizeTable;
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
  submitting = false,
  onSubmitScore,
}: Props) {
  // Durum C — sıralamada değil. `rank: null`, `0` değil.
  if (around.rank == null) {
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

  // Durum A — zaten ilk 100'de.
  if (around.inTopWindow) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-lg font-extrabold text-cocoa">
          İlk {topWindowSize}'desin! 🎉
        </p>
        <p className="mx-auto mt-1.5 max-w-xs text-[13px] font-semibold text-cocoa/70">
          {around.rank}. sıradasın ve bu sezon ödül alıyorsun. Satırın listede yeşil.
        </p>
      </div>
    );
  }

  // Durum B — asıl senaryo. Atlanan sıra: ilk 100'ün sonu ile pencerenin
  // ilk satırı arasındaki boşluk.
  const firstWindowRank = around.entries[0]?.rank ?? around.rank;
  const skipped = Math.max(0, firstWindowRank - topWindowSize - 1);
  const toPaid = around.rank - topWindowSize;

  return (
    <div>
      {/* Kopukluk göstergesi: kullanıcı sıraların atlandığını görmeli. */}
      <div className="mb-2.5 flex items-center gap-2 px-1">
        <span className="h-1 flex-1 rounded-full border-b-2 border-dashed border-bark/35" />
        <span className="rounded-full border-2 border-bark/30 bg-gold-1/70 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-cocoa/70">
          {skipped > 0 ? `${tr.format(skipped)} sıra atlandı` : 'ara sıralar'}
        </span>
        <span className="h-1 flex-1 rounded-full border-b-2 border-dashed border-bark/35" />
      </div>

      <LeaderboardList entries={around.entries} prizes={prizes} />

      <p className="mt-3 rounded-xl border-2 border-bark/25 bg-gold-1/60 px-3 py-2 text-center text-[11px] font-bold text-cocoa/75">
        Ödül bölgesine <strong className="text-[#a8620c]">{tr.format(toPaid)} sıra</strong>{' '}
        uzaktasın · toplam {tr.format(around.total)} oyuncu · skorun{' '}
        {formatScoreFull(around.score)}
      </p>
    </div>
  );
}
