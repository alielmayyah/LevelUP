import { useTranslation } from 'react-i18next';

import type { AssessmentDto } from '../../api/types';
import Icon from '../../components/Icon';
import { formatNumber } from '../../i18n/format';
import { scanInsight, type InsightTone } from './insight';

interface Props {
  scan: AssessmentDto;
  before: AssessmentDto;
}

/** The badge hue says how the news reads; the words carry the meaning. */
const TONE: Record<InsightTone, string> = {
  good: '[--icon-color:var(--lu-success)]',
  neutral: '[--icon-color:var(--ion-color-primary)]',
  watch: '[--icon-color:var(--lu-tier-2)]',
};

/**
 * "What it means": what the change in muscle and fat since the compared scan
 * adds up to, in one plain sentence, and the one thing to do next.
 */
const ScanInsight: React.FC<Props> = ({ scan, before }) => {
  const { t } = useTranslation();
  const insight = scanInsight(scan, before);
  if (!insight) return null;
  const kg = (n: number) => `${formatNumber(Math.abs(n), 1)} ${t('units.kg')}`;
  const key = `progress.insight.kind.${insight.kind}`;

  return (
    <section
      className="lu-card grid gap-3"
      aria-labelledby="insight-title"
      data-testid="scan-insight"
      data-kind={insight.kind}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`lu-insight-badge flex-none text-[1.25rem] ${TONE[insight.tone]}`}
          name={insight.tone === 'watch' ? 'pulse' : 'sparkles'}
        />
        <div className="grid min-w-0">
          <h2 id="insight-title" className="lu-card-kicker m-0">
            {t('progress.insight.title')}
          </h2>
          <p className="m-0 text-[1.05rem] leading-snug font-bold text-ink" data-testid="insight-headline">
            {t(`${key}.title`)}
          </p>
        </div>
      </div>
      <p className="m-0 text-[0.9rem] leading-relaxed text-ink" data-testid="insight-body">
        {t(`${key}.body`, { muscle: kg(insight.muscleKg), fat: kg(insight.fatKg) })}
      </p>
      <div className="flex items-start gap-2.5 rounded-xl bg-surface-2 p-3" data-testid="insight-next">
        <Icon className="mt-0.5 flex-none text-[1.1rem] [--icon-color:var(--lu-gold)]" name="bulb" />
        <p className="m-0 text-[0.875rem] leading-snug text-ink">
          <strong className="font-semibold">{t('progress.insight.next')}</strong> {t(`${key}.next`)}
        </p>
      </div>
    </section>
  );
};

export default ScanInsight;
