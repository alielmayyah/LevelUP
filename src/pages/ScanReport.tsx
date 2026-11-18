import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import type { AssessmentDto, ProfileDto, ScanChange } from '../api/types';
import { useApi } from '../api/useApi';
import { ATTENTION_SIDE, rangeFor, trackPosition, zoneOf, type ReportKey } from '../body/ranges';
import Icon, { type IconName } from '../components/Icon';
import TabPage from '../components/TabPage';
import { Button, FeedCard, Num, StateCard, type Tone } from '../components/ui';
import { numberLocale } from '../i18n/format';
import ChangeRow from './journey/ChangeRow';
import WeightSplit from './journey/WeightSplit';
import BodyBalance from './scans/BodyBalance';
import RangeRow from './scans/RangeRow';

const ROWS: { key: ReportKey; icon: IconName; tone: Tone }[] = [
  { key: 'weightKg', icon: 'scale', tone: 'lean' },
  { key: 'skeletalMuscleKg', icon: 'muscle', tone: 'muscle' },
  { key: 'bodyFatKg', icon: 'bodyFat', tone: 'fat' },
  { key: 'bodyFatPct', icon: 'gauge', tone: 'fat' },
  { key: 'totalBodyWaterKg', icon: 'drop', tone: 'water' },
];

const formatStamp = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

/**
 * One scan's report (ui-standards → Screens): the passport stamp with its
 * source, the change against the scan before, weight as fat + fat-free
 * mass, each value on its normal band, body balance, and the rest behind
 * "More numbers".
 */
const ScanReport: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const list = useApi<AssessmentDto[]>('/me/assessments');
  const me = useApi<ProfileDto>('/me');
  const [more, setMore] = useState(false);

  const newestFirst = list.status === 'ready' ? list.data : null;
  const index = newestFirst ? newestFirst.findIndex((a) => a.id === Number(id)) : -1;
  const scan = index >= 0 ? newestFirst![index] : null;
  const previous = scan && index + 1 < newestFirst!.length ? newestFirst![index + 1] : null;
  const change = useApi<ScanChange>(scan && previous ? `/me/compare/${previous.id}/${scan.id}` : null);
  const profile = me.status === 'ready' ? me.data : null;
  const kg = t('units.kg');

  return (
    <TabPage testId="page-scan" title={t('scan.title')} backTo="/tabs/scans">
      {(list.status === 'loading' || me.status === 'loading') && (
        <div className="lu-skeleton-card min-h-[260px] rounded-[20px]" aria-busy="true" />
      )}
      {(list.status === 'error' || me.status === 'error') && (
        <StateCard
          icon="warning"
          tone="attention"
          title={t('journey.errorTitle')}
          message={t('scan.notFound')}
          action={
            <Button variant="secondary" icon="refresh" onClick={() => void Promise.all([list.retry(), me.retry()])}>
              {t('common.retry')}
            </Button>
          }
        />
      )}
      {newestFirst && profile && !scan && (
        <StateCard
          icon="scan"
          title={t('scan.notFound')}
          message={t('journey.empty.message')}
          action={
            <Link to="/tabs/scans" className="text-label text-brand-soft">
              {t('scan.back')}
            </Link>
          }
          testId="scan-missing"
        />
      )}
      {scan && profile && (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {/* The passport stamp: every number below carries this source. */}
          <FeedCard
            icon="scan"
            iconTone="brand"
            title={formatStamp(scan.takenAt)}
            subtitle={[
              t('scans.stop', { n: newestFirst!.length - index }),
              scan.origin?.place
                ? [scan.origin.place.name, scan.origin.place.branch].filter(Boolean).join(' · ')
                : null,
              scan.origin?.device ? `${scan.origin.device.brand} ${scan.origin.device.model}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            testId="scan-stamp"
          >
            {previous ? (
              <div className="grid gap-3" data-testid="scan-vs-previous">
                <p className="m-0 text-label text-muted">{t('scan.vsPrevious')}</p>
                {change.status === 'ready' && (
                  <>
                    <ChangeRow metric="muscleKg" change={change.data.muscleKg} />
                    <ChangeRow metric="fatKg" change={change.data.fatKg} />
                    {change.data.muscleKg.verdict === 'same' && change.data.fatKg.verdict === 'same' && (
                      <p className="m-0 text-caption text-muted">{t('scan.allSame')}</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="m-0 text-body text-muted" data-testid="scan-first">
                {t('scan.first')}
              </p>
            )}
          </FeedCard>

          <FeedCard icon="scale" iconTone="lean" title={t('journey.body.title')} testId="scan-weight">
            <WeightSplit
              weightKg={scan.weightKg}
              fatKg={scan.bodyFatKg}
              fatFreeMassKg={scan.extra?.fatFreeMassKg ?? scan.weightKg - scan.bodyFatKg}
            />
          </FeedCard>

          <FeedCard
            icon="gauge"
            iconTone="brand"
            title={t('scan.values')}
            subtitle={t(scan.ranges ? 'scan.source.machine' : 'scan.source.standard')}
            testId="scan-values"
          >
            <div className="grid gap-4">
              {ROWS.map(({ key, icon, tone }) => {
                const r = rangeFor(scan, key, profile.sex, profile.heightCm);
                const value = scan[key];
                const zone = zoneOf(value, r);
                return (
                  <RangeRow
                    key={key}
                    testId={`range-${key}`}
                    icon={icon}
                    tone={tone}
                    label={t(`scan.metric.${key}`)}
                    value={value}
                    unit={key === 'bodyFatPct' ? '%' : kg}
                    range={r}
                    zone={zone}
                    attention={ATTENTION_SIDE[key] === zone}
                    position={trackPosition(value, r)}
                    bandStart={trackPosition(r.low, r)}
                    bandEnd={trackPosition(r.high, r)}
                  />
                );
              })}
              {/* Belly fat: a goal line at 10, not a band. */}
              <RangeRow
                testId="range-visceralFatLevel"
                icon="abdomen"
                tone="fat"
                label={t('scan.metric.visceralFatLevel')}
                value={scan.visceralFatLevel}
                unit=""
                digits={0}
                range={null}
                zone={scan.visceralFatLevel >= 10 ? 'over' : 'normal'}
                attention={scan.visceralFatLevel >= 10}
                position={Math.min(1, scan.visceralFatLevel / 20)}
                bandStart={0}
                bandEnd={0.5}
                note={t('scan.visceralGoal')}
              />
            </div>
          </FeedCard>

          <BodyBalance scan={scan} previous={previous} />

          <FeedCard
            icon="info"
            iconTone="neutral"
            title={t('scan.more')}
            testId="scan-more"
            action={
              <Button
                variant="quiet"
                icon={more ? 'chevronDown' : 'chevronForward'}
                aria-expanded={more}
                aria-controls="scan-more-list"
                onClick={() => setMore((m) => !m)}
                data-testid="scan-more-toggle"
              >
                {more ? t('scan.close') : t('scan.more')}
              </Button>
            }
          >
            {more && (
              <dl id="scan-more-list" className="m-0 grid gap-2.5">
                {(
                  [
                    ['proteinKg', scan.proteinKg, 1, kg],
                    ['mineralsKg', scan.mineralsKg, 2, kg],
                    ['bmi', scan.bmi, 1, ''],
                    ['bmrKcal', scan.bmrKcal, 0, t('units.kcal')],
                    ['ecwRatio', scan.extra?.ecwRatio ?? null, 3, ''],
                    ['phaseAngleDeg', scan.extra?.phaseAngleDeg ?? null, 1, '°'],
                    ['deviceScore', scan.extra?.deviceScore ?? null, 0, ''],
                  ] as const
                )
                  .filter(([, v]) => v !== null)
                  .map(([k, v, digits, unit]) => (
                    <div key={k} className="flex items-baseline justify-between gap-3" data-testid={`more-${k}`}>
                      <dt className="text-label text-muted">{t(`scan.moreItem.${k}`)}</dt>
                      <dd className="m-0">
                        {unit === '°' ? (
                          <Num value={v} digits={digits} className="text-label text-ink" />
                        ) : (
                          <Num value={v} digits={digits} unit={unit || undefined} className="text-label text-ink" />
                        )}
                        {unit === '°' && <span className="text-label text-ink">°</span>}
                      </dd>
                    </div>
                  ))}
              </dl>
            )}
          </FeedCard>

          <div className="grid gap-3 md:col-span-2">
            <p className="m-0 flex items-start gap-2 text-caption text-muted" data-testid="scan-disclaimer">
              <Icon name="info" className="mt-0.5 flex-none" />
              {t('scan.disclaimer')}
            </p>
            <Link
              to="/tabs/scans/details"
              className="lu-focus inline-flex min-h-11 items-center gap-2 text-label text-brand-soft no-underline"
              data-testid="scan-details"
            >
              {t('scan.details')}
              <Icon name="chevronForward" className="rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      )}
    </TabPage>
  );
};

export default ScanReport;
