import { useTranslation } from 'react-i18next';

import { Num } from '../../components/ui';
import { formatNumber } from '../../i18n/format';

/** Weight drawn only as fat + fat-free mass, never muscle + fat (those two don't add up to weight). */
export function WeightSplit({
  weightKg,
  fatKg,
  fatFreeMassKg,
}: {
  weightKg: number;
  fatKg: number;
  fatFreeMassKg: number;
}) {
  const { t } = useTranslation();
  const kg = t('units.kg');
  const fatShare = Math.min(100, Math.max(0, (fatKg / (fatKg + fatFreeMassKg)) * 100));
  return (
    <div className="grid gap-3" data-testid="weight-split">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-label text-muted">{t('journey.body.weight')}</span>
        <Num value={weightKg} digits={1} unit={kg} className="text-verdict text-ink" testId="weight-total" />
      </div>
      <div
        className="flex h-3 overflow-hidden rounded-full bg-surface-3"
        role="img"
        aria-label={t('journey.body.splitAria', {
          weight: `${formatNumber(weightKg, 1)} ${kg}`,
          fat: `${formatNumber(fatKg, 1)} ${kg}`,
          lean: `${formatNumber(fatFreeMassKg, 1)} ${kg}`,
        })}
      >
        <span className="h-full bg-fat" style={{ inlineSize: `${fatShare}%` }} />
        <span className="h-full flex-1 bg-lean" />
      </div>
      <dl className="m-0 flex flex-wrap gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="size-2.5 flex-none rounded-full bg-fat" aria-hidden="true" />
          <dt className="text-label text-muted">{t('journey.body.fat')}</dt>
          <dd className="m-0">
            <Num value={fatKg} digits={1} unit={kg} className="text-label text-ink" testId="weight-fat" />
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 flex-none rounded-full bg-lean" aria-hidden="true" />
          <dt className="text-label text-muted">{t('journey.body.fatFree')}</dt>
          <dd className="m-0">
            <Num value={fatFreeMassKg} digits={1} unit={kg} className="text-label text-ink" testId="weight-lean" />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default WeightSplit;
