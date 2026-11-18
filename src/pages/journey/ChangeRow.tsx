import { useTranslation } from 'react-i18next';

import type { MetricChange, ScanChange } from '../../api/types';
import type { IconName } from '../../components/Icon';
import { Chip, IconTile, Num, type ChipTone, type Tone } from '../../components/ui';

export type ChangeKey = keyof Pick<ScanChange, 'muscleKg' | 'fatKg' | 'weightKg' | 'fatPct'>;

const LOOK: Record<ChangeKey, { icon: IconName; tone: Tone }> = {
  muscleKg: { icon: 'muscle', tone: 'muscle' },
  fatKg: { icon: 'bodyFat', tone: 'fat' },
  weightKg: { icon: 'scale', tone: 'lean' },
  fatPct: { icon: 'gauge', tone: 'fat' },
};

const CHIP: Record<MetricChange['verdict'], ChipTone> = { better: 'good', worse: 'attention', same: 'stable' };

/** One metric's change: icon, name, the signed change, and a chip that says what it means in words. */
export function ChangeRow({ metric, change }: { metric: ChangeKey; change: MetricChange }) {
  const { t } = useTranslation();
  const look = LOOK[metric];
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
      data-testid={`change-${metric}`}
      data-verdict={change.verdict}
    >
      <IconTile icon={look.icon} tone={look.tone} />
      <span className="min-w-[4.5rem] flex-1 text-label whitespace-nowrap text-ink">
        {t(`journey.change.${metric}`)}
      </span>
      <Num
        value={change.delta}
        signed
        digits={1}
        unit={metric === 'fatPct' ? '%' : t('units.kg')}
        className="text-body font-semibold text-ink"
      />
      <Chip tone={CHIP[change.verdict]}>{t(`journey.chip.${change.verdict}`)}</Chip>
    </div>
  );
}

export default ChangeRow;
