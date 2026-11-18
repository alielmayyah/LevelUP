import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AssessmentDto, BodySegment, SegmentReading, Sex } from '../../api/types';
import {
  bodyStandards,
  kgRange,
  SCALES,
  scalePosition,
  statusFor,
  type Scale,
  type Status,
} from '../../body/standards';
import Icon, { type IconName } from '../../components/Icon';
import { segmentKinds, segmentReadings } from '../../body/segments';
import { focusSibling, rovingTarget } from '../../components/roving';
import { formatNumber, formatSigned } from '../../i18n/format';
import './BodyComposition.scss';

type Better = 'up' | 'down' | null;

/**
 * Which side of the healthy band is good news: more muscle, water or protein
 * is fine ("more"), more fat is not ("less"), and weight just wants to be in
 * the band ("band").
 */
type Reading = 'more' | 'less' | 'band';

type Tone = 'good' | 'bad' | 'neutral';

const toneOf = (reading: Reading, status: Status): Tone => {
  if (status === 'normal') return 'good';
  if (reading === 'more') return status === 'over' ? 'good' : 'bad';
  if (reading === 'less') return status === 'over' ? 'bad' : 'neutral';
  return 'neutral';
};

const TONE_ICON: Record<Tone, IconName> = { good: 'checkCircle', bad: 'warning', neutral: 'info' };

/** Thin space between a number and its unit, so values fit narrow columns. */
const THIN = String.fromCharCode(0x2009);
/** Left-to-right isolate, so Arabic never flips a range such as 62.6–84.7. */
const ltr = (text: string) => `${String.fromCharCode(0x2066)}${text}${String.fromCharCode(0x2069)}`;

/**
 * Where a value sits on three equal zones, Low | Healthy | High, from 0 to 1.
 * The scan sheet's scales are uneven (the healthy band takes a fifth); equal
 * zones read at a glance.
 */
function zonePosition(scale: Scale, value: number): number {
  const p = scalePosition(scale, value);
  const a = scalePosition(scale, scale.normal[0]);
  const b = scalePosition(scale, scale.normal[1]);
  let x: number;
  if (p < a) x = (a > 0 ? p / a : 0) / 3;
  else if (p <= b) x = 1 / 3 + (b > a ? (p - a) / (b - a) : 0.5) / 3;
  else x = 2 / 3 + (b < 1 ? (p - b) / (1 - b) : 1) / 3;
  return Math.min(0.97, Math.max(0.03, x));
}

interface Props {
  scan: AssessmentDto;
  /** The scan to measure against; null when the member turned comparing off. */
  compare: AssessmentDto | null;
  heightCm: number;
  sex: Sex;
}

/** "+0.7 kg", green when that direction is good news, red when not, plain when neither. */
const Delta: React.FC<{ now: number; then: number; digits: number; unit: string; better: Better; testId?: string }> = ({
  now,
  then,
  digits,
  unit,
  better,
  testId,
}) => {
  const { t } = useTranslation();
  const diff = Math.round((now - then) * 10 ** digits) / 10 ** digits;
  const good = diff === 0 || better === null ? null : (better === 'up') === diff > 0;
  const tone = good === null ? 'text-muted' : good ? 'text-success' : 'text-danger';
  const amount = `${formatNumber(Math.abs(diff), digits)}${unit === '%' ? '%' : unit ? ` ${unit}` : ''}`;
  return (
    <span className={`text-[0.75rem] font-semibold whitespace-nowrap ${tone}`} data-testid={testId}>
      <bdi aria-hidden="true">{diff === 0 ? '±0' : formatSigned(diff, unit, { digits })}</bdi>
      <span className="sr-only">
        {diff === 0 ? t('progress.noChange') : t(diff > 0 ? 'bodyComp.upSince' : 'bodyComp.downSince', { amount })}
      </span>
    </span>
  );
};

/** Low / Healthy / High, with a check when it is good news and a warning when it is not. */
const StatusChip: React.FC<{ status: Status; tone: Tone }> = ({ status, tone }) => {
  const { t } = useTranslation();
  return (
    <span className={`lu-status lu-status-${tone} inline-flex items-center gap-1 rounded-full px-2 py-0.5`}>
      <Icon className="flex-none text-[0.95em]" name={TONE_ICON[tone]} />
      {t(`bodyComp.zone.${status}`)}
    </span>
  );
};

/**
 * The three zones side by side, the healthy one tinted, and a dot where the
 * member is. Charts read low to high, left to right, in both languages.
 * `labels` writes the zone names inside the track.
 */
const ZoneTrack: React.FC<{ at: number; labels?: boolean }> = ({ at, labels }) => {
  const { t } = useTranslation();
  return (
    <div
      dir="ltr"
      className={`lu-zones relative grid grid-cols-3 gap-[3px] ${labels ? 'h-[26px]' : 'h-3'}`}
      aria-hidden="true"
    >
      {(['under', 'normal', 'over'] as const).map((z) => (
        <span key={z} className={`lu-zone lu-zone-${z} grid place-items-center`}>
          {labels && t(`bodyComp.zone.${z}`)}
        </span>
      ))}
      <span className="lu-zone-marker" style={{ insetInlineStart: `${at * 100}%` }} data-pop />
    </div>
  );
};

/** The zone names over a list of compact tracks (body parts). */
const ZoneCaptions: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div dir="ltr" className="grid grid-cols-3 text-center text-[0.68rem] font-semibold text-muted" aria-hidden="true">
      {(['under', 'normal', 'over'] as const).map((z) => (
        <span key={z} className={z === 'normal' ? 'text-success' : ''}>
          {t(`bodyComp.zone.${z}`)}
        </span>
      ))}
    </div>
  );
};

interface RowProps {
  testId: string;
  label: string;
  icon: IconName;
  disc: string;
  scale: Scale;
  /** The value placed on the scale (kg as % of standard for weight, muscle, and fat). */
  position: number;
  value: number;
  compareValue: number | null;
  digits: number;
  unit: string;
  range: readonly [number, number];
  status: Status;
  better: Better;
  reading: Reading;
}

/** One measurement: its name and value, the zone track, the healthy range, and a plain verdict. */
const Row: React.FC<RowProps> = (p) => {
  const { t } = useTranslation();
  const suffix = p.unit === '%' ? '%' : p.unit ? `${THIN}${p.unit}` : '';
  // Only the numbers are kept left to right; the unit follows in the reading direction.
  const rangeText = `${ltr(`${formatNumber(p.range[0], p.digits)}–${formatNumber(p.range[1], p.digits)}${p.unit === '%' ? '%' : ''}`)}${p.unit && p.unit !== '%' ? ` ${p.unit}` : ''}`;
  return (
    <div className="grid gap-2" data-testid={p.testId} data-status={p.status}>
      <div className="flex items-center gap-2.5">
        <span className={`lu-disc ${p.disc} size-8 text-[0.95rem]`} aria-hidden="true">
          <Icon name={p.icon} />
        </span>
        <span className="min-w-0 flex-1 font-display text-[0.95rem] font-semibold text-ink">{p.label}</span>
        <span className="flex items-baseline gap-2">
          <strong className="lu-display text-[1.3rem] leading-none whitespace-nowrap text-ink">
            {formatNumber(p.value, p.digits)}
            <span className="text-[0.7em]">{suffix}</span>
          </strong>
          {p.compareValue !== null && (
            <Delta
              now={p.value}
              then={p.compareValue}
              digits={p.digits}
              unit={p.unit}
              better={p.better}
              testId={`${p.testId}-delta`}
            />
          )}
        </span>
      </div>
      <ZoneTrack at={zonePosition(p.scale, p.position)} labels />
      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.75rem] text-muted">
        <span>{t('bodyComp.normalRange', { range: rangeText })}</span>
        <StatusChip status={p.status} tone={toneOf(p.reading, p.status)} />
      </div>
    </div>
  );
};

/** One body part: which side, its compact track, its kg and % of normal, and the verdict. */
const PartRow: React.FC<{
  segment: BodySegment;
  label: string;
  reading: SegmentReading;
  then: SegmentReading | null;
  status: Status;
  kind: 'lean' | 'fat';
}> = ({ segment, label, reading, then, status, kind }) => {
  const { t } = useTranslation();
  const digits = kind === 'lean' ? 2 : 1;
  const scale = kind === 'lean' ? SCALES.segmentLean : SCALES.segmentFat;
  return (
    <div
      className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1"
      data-testid={`seg-${segment}`}
      data-status={status}
    >
      <span className="text-[0.85rem] leading-tight font-semibold text-ink">{label}</span>
      <ZoneTrack at={zonePosition(scale, reading.pct)} />
      <span className="grid justify-items-end gap-0.5 text-end">
        <span className="flex items-baseline gap-1.5">
          <strong className="lu-display text-[1.05rem] leading-none whitespace-nowrap text-ink">
            {formatNumber(reading.kg, digits)}
            <span className="text-[0.7em]">{`${THIN}${t('units.kg')}`}</span>
          </strong>
          {then && (
            <Delta
              now={reading.kg}
              then={then.kg}
              digits={digits}
              unit={t('units.kg')}
              better={kind === 'lean' ? 'up' : 'down'}
              testId={`seg-${segment}-delta`}
            />
          )}
        </span>
        <span className="flex items-center gap-1.5 text-[0.72rem]">
          <bdi className="text-muted">{t('bodyComp.ofNormal', { pct: `${formatNumber(reading.pct, 0)}%` })}</bdi>
          <StatusChip status={status} tone={toneOf(kind === 'lean' ? 'more' : 'less', status)} />
        </span>
      </span>
    </div>
  );
};

/** Arms and legs as a left/right pair, then the trunk. */
const GROUPS: { key: 'arms' | 'legs' | 'trunk'; parts: { segment: BodySegment; side: 'left' | 'right' | null }[] }[] = [
  {
    key: 'arms',
    parts: [
      { segment: 'leftArm', side: 'left' },
      { segment: 'rightArm', side: 'right' },
    ],
  },
  {
    key: 'legs',
    parts: [
      { segment: 'leftLeg', side: 'left' },
      { segment: 'rightLeg', side: 'right' },
    ],
  },
  { key: 'trunk', parts: [{ segment: 'trunk', side: null }] },
];

/**
 * The InBody result sheet in plain terms, as three cards: each measurement on
 * a Low / Healthy / High track for the member's height and sex, the muscle or
 * fat in each body part, and what the body is made of. With a scan to compare,
 * each value shows its change. Loaded in its own chunk after the page.
 */
const BodyComposition: React.FC<Props> = ({ scan, compare, heightCm, sex }) => {
  const { t, i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const [kind, setKind] = useState<'lean' | 'fat'>('lean');
  const std = bodyStandards(heightCm, sex);
  const kg = t('units.kg');
  const ofStd = (v: number, s: number) => (v / s) * 100;
  const pbf = sex === 'MALE' ? SCALES.pbfMale : SCALES.pbfFemale;

  const muscleFat: RowProps[] = [
    {
      testId: 'bar-weight',
      label: t('bodyComp.bar.weight'),
      icon: 'scale',
      disc: 'lu-disc-weight',
      scale: SCALES.weight,
      position: ofStd(scan.weightKg, std.weightKg),
      value: scan.weightKg,
      compareValue: compare?.weightKg ?? null,
      digits: 1,
      unit: kg,
      range: kgRange(std.weightKg, SCALES.weight.normal),
      status: statusFor(ofStd(scan.weightKg, std.weightKg), SCALES.weight.normal),
      better: null,
      reading: 'band',
    },
    {
      testId: 'bar-smm',
      label: t('bodyComp.bar.smm'),
      icon: 'muscle',
      disc: 'lu-disc-muscle',
      scale: SCALES.smm,
      position: ofStd(scan.skeletalMuscleKg, std.smmKg),
      value: scan.skeletalMuscleKg,
      compareValue: compare?.skeletalMuscleKg ?? null,
      digits: 1,
      unit: kg,
      range: kgRange(std.smmKg, SCALES.smm.normal),
      status: statusFor(ofStd(scan.skeletalMuscleKg, std.smmKg), SCALES.smm.normal),
      better: 'up',
      reading: 'more',
    },
    {
      testId: 'bar-fat',
      label: t('bodyComp.bar.fat'),
      icon: 'bodyFat',
      disc: 'lu-disc-fat',
      scale: SCALES.fat,
      position: ofStd(scan.bodyFatKg, std.fatKg),
      value: scan.bodyFatKg,
      compareValue: compare?.bodyFatKg ?? null,
      digits: 1,
      unit: kg,
      range: kgRange(std.fatKg, SCALES.fat.normal),
      status: statusFor(ofStd(scan.bodyFatKg, std.fatKg), SCALES.fat.normal),
      better: 'down',
      reading: 'less',
    },
  ];

  const obesity: RowProps[] = [
    {
      testId: 'bar-bmi',
      label: t('bodyComp.bar.bmi'),
      icon: 'gauge',
      disc: 'lu-disc-lime',
      scale: SCALES.bmi,
      position: scan.bmi,
      value: scan.bmi,
      compareValue: compare?.bmi ?? null,
      digits: 1,
      unit: '',
      range: SCALES.bmi.normal,
      status: statusFor(scan.bmi, SCALES.bmi.normal),
      better: null,
      reading: 'less',
    },
    {
      testId: 'bar-pbf',
      label: t('bodyComp.bar.pbf'),
      icon: 'bodyFat',
      disc: 'lu-disc-fat',
      scale: pbf,
      position: scan.bodyFatPct,
      value: scan.bodyFatPct,
      compareValue: compare?.bodyFatPct ?? null,
      digits: 1,
      unit: '%',
      range: pbf.normal,
      status: statusFor(scan.bodyFatPct, pbf.normal),
      better: 'down',
      reading: 'less',
    },
  ];

  const parts = [
    {
      key: 'water',
      icon: 'drop',
      disc: 'lu-disc-muscle',
      of: (a: AssessmentDto) => a.totalBodyWaterKg,
      std: std.waterKg,
    },
    {
      key: 'protein',
      icon: 'protein',
      disc: 'lu-disc-weight',
      of: (a: AssessmentDto) => a.proteinKg,
      std: std.proteinKg,
    },
    { key: 'minerals', icon: 'gem', disc: 'lu-disc-lime', of: (a: AssessmentDto) => a.mineralsKg, std: std.mineralsKg },
  ] as const;
  const composition: RowProps[] = parts.map((c) => ({
    testId: `bar-${c.key}`,
    label: t(`bodyComp.comp.${c.key}`),
    icon: c.icon,
    disc: c.disc,
    scale: SCALES.smm,
    position: ofStd(c.of(scan), c.std),
    value: c.of(scan),
    compareValue: compare ? c.of(compare) : null,
    digits: c.key === 'minerals' ? 2 : 1,
    unit: kg,
    range: kgRange(c.std),
    status: statusFor(ofStd(c.of(scan), c.std), SCALES.smm.normal),
    better: c.key === 'water' ? null : 'up',
    reading: 'more',
  }));

  const kinds = segmentKinds(scan);
  // A lean-only sheet has no fat view: fall back to the kind the scan has.
  const shown = kinds.includes(kind) ? kind : (kinds[0] ?? kind);
  const segs = segmentReadings(scan, shown);
  const segScale = shown === 'lean' ? SCALES.segmentLean : SCALES.segmentFat;
  const thenSeg = (s: BodySegment) => segmentReadings(compare, shown)?.[s] ?? null;

  return (
    <div className="grid gap-3.5" data-testid="body-comp">
      <section className="lu-card grid gap-5" aria-labelledby="bc-muscle-fat">
        <header className="grid gap-1">
          <span className="lu-card-kicker">{t('bodyComp.kicker')}</span>
          <h2 id="bc-muscle-fat" className="lu-card-title text-[1.1rem]">
            {t('bodyComp.muscleFat')}
          </h2>
          <p className="m-0 text-[0.85rem] leading-snug text-muted">{t('bodyComp.explain')}</p>
        </header>
        {muscleFat.map((b) => (
          <Row key={b.testId} {...b} />
        ))}
        <h3 className="lu-card-title m-0 border-t border-line pt-4 text-[1rem]">{t('bodyComp.obesity')}</h3>
        {obesity.map((b) => (
          <Row key={b.testId} {...b} />
        ))}
      </section>

      <section className="lu-card grid gap-4" aria-labelledby="bc-segments" data-testid="segments">
        <header className="grid gap-1">
          <h2 id="bc-segments" className="lu-card-title text-[1.1rem]">
            {t('bodyComp.segmental')}
          </h2>
          {segs && (
            <p className="m-0 text-[0.85rem] leading-snug text-muted">
              {t(shown === 'lean' ? 'bodyComp.leanNote' : 'bodyComp.fatNote')}
            </p>
          )}
        </header>
        {segs ? (
          <>
            {kinds.length > 1 && (
              <div role="radiogroup" aria-label={t('bodyComp.segmentView')} className="lu-segment mb-0">
                {kinds.map((k, i) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={shown === k}
                    tabIndex={shown === k ? 0 : -1}
                    data-testid={`segments-${k}`}
                    className="flex-row gap-1.5"
                    onClick={() => setKind(k)}
                    onKeyDown={(e) => {
                      const to = rovingTarget(e, i, kinds.length, rtl);
                      if (to === null) return;
                      setKind(kinds[to]);
                      focusSibling(e, to);
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon className="shrink-0 text-base" name={k === 'lean' ? 'muscle' : 'bodyFat'} />
                      {t(k === 'lean' ? 'bodyComp.lean' : 'bodyComp.fatView')}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] gap-x-3">
              <span />
              <ZoneCaptions />
              <span className="invisible text-[0.72rem]" aria-hidden="true">
                {t('bodyComp.ofNormal', { pct: '100%' })}
              </span>
            </div>
            {GROUPS.map((g) => (
              <div key={g.key} className="grid gap-3 border-t border-line pt-3.5" data-testid={`seg-group-${g.key}`}>
                {g.key !== 'trunk' && (
                  <h3 className="m-0 font-display text-[0.9rem] font-semibold text-muted">
                    {t(`bodyComp.group.${g.key}`)}
                  </h3>
                )}
                {g.parts.map(({ segment, side }) => (
                  <PartRow
                    key={segment}
                    segment={segment}
                    label={side ? t(`bodyComp.side.${side}`) : t('bodyComp.segment.trunk')}
                    reading={segs[segment]}
                    then={thenSeg(segment)}
                    status={statusFor(segs[segment].pct, segScale.normal)}
                    kind={shown}
                  />
                ))}
              </div>
            ))}
          </>
        ) : (
          <p className="m-0 text-center text-[0.9rem] font-semibold text-muted" data-testid="segments-none">
            {t('bodyComp.noSegments')}
          </p>
        )}
      </section>

      <section className="lu-card grid gap-5" aria-labelledby="bc-composition">
        <h2 id="bc-composition" className="lu-card-title text-[1.1rem]">
          {t('bodyComp.composition')}
        </h2>
        {composition.map((b) => (
          <Row key={b.testId} {...b} />
        ))}
      </section>
    </div>
  );
};

export default BodyComposition;
