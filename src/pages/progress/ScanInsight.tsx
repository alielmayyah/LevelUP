import { useTranslation } from 'react-i18next';

import type { AssessmentDto } from '../../api/types';
import Icon from '../../components/Icon';
import { formatNumber } from '../../i18n/format';
import { scanInsight, type InsightTone } from './insight';

interface Props {
  scan: AssessmentDto;
  before: AssessmentDto;
}

/** The disc's color says how the news reads; the words carry the meaning. */
const TONE: Record<InsightTone, string> = {
  good: 'lu-disc-lime',
  neutral: 'lu-disc-weight',
  watch: 'lu-disc-fat',
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
        <span className={`lu-disc ${TONE[insight.tone]} size-11 text-[1.25rem]`} aria-hidden="true" data-pop>
          <Icon name={insight.tone === 'watch' ? 'pulse' : 'sparkles'} />
        </span>
        <div className="grid min-w-0">
          <h2 id="insight-title" className="lu-card-kicker m-0">
            {t('progress.insight.title')}
          </h2>
          <p
            className="m-0 font-display text-[1.1rem] leading-snug font-semibold text-ink"
            data-testid="insight-headline"
          >
            {t(`${key}.title`)}
          </p>
        </div>
      </div>
      <p className="m-0 text-[0.9rem] leading-relaxed text-ink" data-testid="insight-body">
        {t(`${key}.body`, { muscle: kg(insight.muscleKg), fat: kg(insight.fatKg) })}
      </p>
      <div className="flex items-start gap-2.5 rounded-[16px] bg-surface-2 p-3.5" data-testid="insight-next">
        <Icon className="mt-0.5 flex-none text-[1.1rem] [--icon-color:var(--lu-gold)]" name="bulb" />
        <p className="m-0 text-[0.875rem] leading-snug text-ink">
          <strong className="font-semibold">{t('progress.insight.next')}</strong> {t(`${key}.next`)}
        </p>
      </div>
    </section>
  );
};

export default ScanInsight;
