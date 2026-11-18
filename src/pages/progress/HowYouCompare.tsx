import { useTranslation } from 'react-i18next';

import type { AssessmentDto, Sex } from '../../api/types';
import { ageOn } from '../../body/age';
import { bodyFatPercentile } from '../../body/norms';
import { bodyStandards, SCALES, statusFor, type Status } from '../../body/standards';
import Icon, { type IconName } from '../../components/Icon';
import { formatNumber, formatPercent } from '../../i18n/format';

interface Props {
  scan: AssessmentDto;
  sex: Sex;
  birthDate: string;
  heightCm: number;
}

type Verdict = 'good' | 'ok' | 'watch';

interface Row {
  key: 'muscle' | 'bmi' | 'belly';
  icon: IconName;
  tone: string;
  value: string;
  status: Status;
  verdict: Verdict;
}

/** Verdict dot colors, reusing the belly-fat verdict chip (Progress.scss). */
const VERDICT_CLASS: Record<Verdict, string> = { good: '', ok: '', watch: 'lu-verdict-high' };

/**
 * "How you compare": body fat against people of the same sex and age (from
 * published norms), and muscle, BMI and belly fat against their healthy ranges.
 */
const HowYouCompare: React.FC<Props> = ({ scan, sex, birthDate, heightCm }) => {
  const { t } = useTranslation();
  const age = ageOn(new Date(birthDate), new Date(scan.takenAt));
  const pct = bodyFatPercentile(scan.bodyFatPct, sex, age);

  const smmPct = (scan.skeletalMuscleKg / bodyStandards(heightCm, sex).smmKg) * 100;
  const muscleStatus = statusFor(smmPct, SCALES.smm.normal);
  const bmiStatus = statusFor(scan.bmi, SCALES.bmi.normal);
  const bellyStatus: Status = scan.visceralFatLevel < 10 ? 'normal' : 'over';

  const rows: Row[] = [
    {
      key: 'muscle',
      icon: 'muscle',
      tone: 'lu-tone-muscle',
      value: t('progress.rank.ofNormal', { pct: formatPercent(Math.round(smmPct)) }),
      status: muscleStatus,
      // More muscle than normal is good news.
      verdict: muscleStatus === 'under' ? 'watch' : muscleStatus === 'over' ? 'good' : 'ok',
    },
    {
      key: 'bmi',
      icon: 'gauge',
      tone: 'lu-tone-bmi',
      value: formatNumber(scan.bmi, 1),
      status: bmiStatus,
      verdict: bmiStatus === 'normal' ? 'ok' : 'watch',
    },
    {
      key: 'belly',
      icon: 'abdomen',
      tone: 'lu-tone-visceral',
      value: t('progress.rank.level', { n: formatNumber(scan.visceralFatLevel) }),
      status: bellyStatus,
      verdict: bellyStatus === 'normal' ? 'ok' : 'watch',
    },
  ];

  return (
    <section className="lu-card grid gap-4" aria-labelledby="compare-title" data-testid="how-you-compare">
      <h2 id="compare-title" className="lu-card-title">
        <Icon name="podium" />
        {t('progress.rank.title')}
      </h2>

      {pct !== null && (
        <div className="grid gap-2.5" data-testid="fat-percentile">
          <p className="m-0 text-[1.05rem] leading-snug font-bold text-ink">
            {t(sex === 'FEMALE' ? 'progress.rank.leanerFemale' : 'progress.rank.leanerMale', {
              pct: formatPercent(pct),
            })}
          </p>
          {/* A bar from more fat (start) to leaner (end), with a marker where the member sits. */}
          <div className="grid gap-1.5" aria-hidden="true">
            <div className="lu-pct-bar relative h-2.5 rounded-full">
              <span
                className="lu-pct-marker absolute top-1/2 size-4 rounded-full"
                style={{ insetInlineStart: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[0.72rem] font-semibold text-muted">
              <span>{t('progress.rank.moreFat')}</span>
              <span>{t('progress.rank.lessFat')}</span>
            </div>
          </div>
          <p className="m-0 text-[0.75rem] text-muted">{t('progress.rank.source')}</p>
        </div>
      )}

      <ul className="m-0 grid list-none gap-0 p-0">
        {rows.map((r) => (
          <li
            key={r.key}
            className={`flex items-center gap-3 py-2.5 [&+&]:[border-block-start:1px_solid_var(--lu-border)] ${r.tone}`}
            data-testid={`compare-${r.key}`}
          >
            <Icon className="lu-compare-badge flex-none text-[1.05rem]" name={r.icon} />
            <span className="grid min-w-0 flex-1">
              <span className="text-[0.875rem] font-semibold text-ink">{t(`progress.rank.${r.key}`)}</span>
              <span className="text-[0.8125rem] text-muted">{r.value}</span>
            </span>
            <span className={`lu-chip lu-verdict ${VERDICT_CLASS[r.verdict]}`}>
              {t(`progress.rank.status.${r.status}`)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HowYouCompare;
