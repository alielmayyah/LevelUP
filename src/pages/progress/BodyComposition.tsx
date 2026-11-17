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
import { focusSibling, rovingTarget } from '../../components/roving';
import { formatNumber, formatSigned, numberLocale } from '../../i18n/format';
import BodyScanFigure from './BodyScanFigure';
import './BodyComposition.scss';

type Better = 'up' | 'down' | null;

/** Thin space between a number and its unit, so values fit narrow columns. */
const THIN = String.fromCharCode(0x2009);
/** Left-to-right isolate, so Arabic never flips a range such as 62.6–84.7. */
const ltr = (text: string) => `${String.fromCharCode(0x2066)}${text}${String.fromCharCode(0x2069)}`;

interface Props {
  scan: AssessmentDto;
  /** The scan to measure against; null when the member turned comparing off. */
  compare: AssessmentDto | null;
  heightCm: number;
  sex: Sex;
}

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat(numberLocale(), { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

const pct = (n: number) => `${formatNumber(n, 0)}%`;

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

const StatusChip: React.FC<{ status: Status; badOver?: boolean }> = ({ status, badOver }) => {
  const { t } = useTranslation();
  return (
    <span className={`lu-status lu-status-${status} ${badOver && status === 'over' ? 'is-bad' : ''}`}>
      {t(`bodyComp.zone.${status}`)}
    </span>
  );
};

/** The Under / Normal / Over captions over a group of bars; every scale puts its normal band at 20–40%. */
const ZoneHeader: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div dir="ltr" className="lu-zone-head grid grid-cols-[2fr_2fr_6fr] text-center" aria-hidden="true">
      {(['under', 'normal', 'over'] as const).map((z) => (
        <span key={z} className={`lu-zone-cap lu-zone-cap-${z}`}>
          {t(`bodyComp.zone.${z}`)}
        </span>
      ))}
    </div>
  );
};

interface BarProps {
  testId: string;
  label: string;
  icon: IconName;
  tone: string;
  scale: Scale;
  /** The value placed on the scale (kg as % of standard for weight, muscle, and fat). */
  position: number;
  comparePosition: number | null;
  value: number;
  compareValue: number | null;
  digits: number;
  unit: string;
  range: readonly [number, number];
  status: Status;
  better: Better;
  /** Over the band is bad news (fat), not just "over". */
  badOver?: boolean;
}

const Bar: React.FC<BarProps> = (p) => {
  const { t } = useTranslation();
  const at = scalePosition(p.scale, p.position) * 100;
  const then = p.comparePosition === null ? null : scalePosition(p.scale, p.comparePosition) * 100;
  const [low, high] = p.scale.normal;
  const bandStart = scalePosition(p.scale, low) * 100;
  const bandEnd = scalePosition(p.scale, high) * 100;
  const suffix = p.unit === '%' ? '%' : p.unit ? `${THIN}${p.unit}` : '';
  const rangeText = `${formatNumber(p.range[0], p.digits)}–${formatNumber(p.range[1], p.digits)}${p.unit === '%' ? '%' : p.unit ? ` ${p.unit}` : ''}`;
  return (
    <div className={`grid gap-1.5 ${p.tone}`} data-testid={p.testId}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <span className="flex min-w-0 items-center gap-1.5 text-[0.85rem] font-semibold text-ink">
          <Icon className="flex-none text-[1.1rem]" name={p.icon} />
          {p.label}
        </span>
        <span className="flex items-baseline gap-2">
          <strong className="lu-display text-[1.35rem] leading-none font-semibold whitespace-nowrap text-ink">
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
      <div dir="ltr" className="lu-scale relative h-3.5" aria-hidden="true">
        <span
          className="lu-scale-band absolute inset-y-0"
          style={{ insetInlineStart: `${bandStart}%`, width: `${bandEnd - bandStart}%` }}
        />
        <span className="lu-scale-fill absolute inset-y-0 start-0" style={{ width: `${Math.max(at, 2)}%` }} />
        {then !== null && (
          <span className="lu-scale-then absolute -inset-y-1" style={{ insetInlineStart: `calc(${then}% - 1.5px)` }} />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.72rem] font-normal text-muted">
        <span>{t('bodyComp.normalRange', { range: ltr(rangeText) })}</span>
        <StatusChip status={p.status} badOver={p.badOver} />
      </div>
    </div>
  );
};

const Callout: React.FC<{
  segment: BodySegment;
  reading: SegmentReading;
  then: SegmentReading | null;
  status: Status;
  kind: 'lean' | 'fat';
  align: 'left' | 'right' | 'center';
}> = ({ segment, reading, then, status, kind, align }) => {
  const { t, i18n } = useTranslation();
  const digits = kind === 'lean' ? 2 : 1;
  // Physical sides on purpose: the figure is laid out the same way in both languages.
  const alignClass =
    align === 'left'
      ? 'text-left [justify-items:left]'
      : align === 'right'
        ? 'text-right [justify-items:right]'
        : 'text-center justify-items-center';
  return (
    <div dir={i18n.dir()} className={`grid gap-0.5 ${alignClass}`} data-testid={`seg-${segment}`}>
      <span className="text-[0.72rem] font-normal text-muted">{t(`bodyComp.segment.${segment}`)}</span>
      <strong className="lu-display text-[1.2rem] leading-none font-semibold whitespace-nowrap text-ink">
        {formatNumber(reading.kg, digits)}
        <span className="text-[0.7em]">{`${THIN}${t('units.kg')}`}</span>
      </strong>
      <span className="text-[0.7rem] font-normal whitespace-nowrap text-muted">
        <bdi>{pct(reading.pct)}</bdi>
      </span>
      <StatusChip status={status} badOver={kind === 'fat'} />
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
    </div>
  );
};

/**
 * The InBody result sheet as three cards: muscle and fat bars against the
 * normal band, where muscle and fat sit on the body, and what the body is made
 * of. With a scan to compare, each bar marks where that scan was and shows the
 * change. Loaded in its own chunk after the page.
 */
const BodyComposition: React.FC<Props> = ({ scan, compare, heightCm, sex }) => {
  const { t, i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const [kind, setKind] = useState<'lean' | 'fat'>('lean');
  const std = bodyStandards(heightCm, sex);
  const kg = t('units.kg');
  const ofStd = (v: number, s: number) => (v / s) * 100;
  const pbf = sex === 'MALE' ? SCALES.pbfMale : SCALES.pbfFemale;

  const muscleFat: BarProps[] = [
    {
      testId: 'bar-weight',
      label: t('bodyComp.bar.weight'),
      icon: 'scale',
      tone: 'lu-tone-weight',
      scale: SCALES.weight,
      position: ofStd(scan.weightKg, std.weightKg),
      comparePosition: compare && ofStd(compare.weightKg, std.weightKg),
      value: scan.weightKg,
      compareValue: compare?.weightKg ?? null,
      digits: 1,
      unit: kg,
      range: kgRange(std.weightKg, SCALES.weight.normal),
      status: statusFor(ofStd(scan.weightKg, std.weightKg), SCALES.weight.normal),
      better: null,
    },
    {
      testId: 'bar-smm',
      label: t('bodyComp.bar.smm'),
      icon: 'muscle',
      tone: 'lu-tone-muscle',
      scale: SCALES.smm,
      position: ofStd(scan.skeletalMuscleKg, std.smmKg),
      comparePosition: compare && ofStd(compare.skeletalMuscleKg, std.smmKg),
      value: scan.skeletalMuscleKg,
      compareValue: compare?.skeletalMuscleKg ?? null,
      digits: 1,
      unit: kg,
      range: kgRange(std.smmKg, SCALES.smm.normal),
      status: statusFor(ofStd(scan.skeletalMuscleKg, std.smmKg), SCALES.smm.normal),
      better: 'up',
    },
    {
      testId: 'bar-fat',
      label: t('bodyComp.bar.fat'),
      icon: 'bodyFat',
      tone: 'lu-tone-fat',
      scale: SCALES.fat,
      position: ofStd(scan.bodyFatKg, std.fatKg),
      comparePosition: compare && ofStd(compare.bodyFatKg, std.fatKg),
      value: scan.bodyFatKg,
      compareValue: compare?.bodyFatKg ?? null,
      digits: 1,
      unit: kg,
      range: kgRange(std.fatKg, SCALES.fat.normal),
      status: statusFor(ofStd(scan.bodyFatKg, std.fatKg), SCALES.fat.normal),
      better: 'down',
      badOver: true,
    },
  ];

  const obesity: BarProps[] = [
    {
      testId: 'bar-bmi',
      label: t('bodyComp.bar.bmi'),
      icon: 'gauge',
      tone: 'lu-tone-bmi',
      scale: SCALES.bmi,
      position: scan.bmi,
      comparePosition: compare?.bmi ?? null,
      value: scan.bmi,
      compareValue: compare?.bmi ?? null,
      digits: 1,
      unit: '',
      range: SCALES.bmi.normal,
      status: statusFor(scan.bmi, SCALES.bmi.normal),
      better: null,
      badOver: true,
    },
    {
      testId: 'bar-pbf',
      label: t('bodyComp.bar.pbf'),
      icon: 'bodyFat',
      tone: 'lu-tone-fat',
      scale: pbf,
      position: scan.bodyFatPct,
      comparePosition: compare?.bodyFatPct ?? null,
      value: scan.bodyFatPct,
      compareValue: compare?.bodyFatPct ?? null,
      digits: 1,
      unit: '%',
      range: pbf.normal,
      status: statusFor(scan.bodyFatPct, pbf.normal),
      better: 'down',
      badOver: true,
    },
  ];

  const parts = [
    {
      key: 'water',
      icon: 'drop',
      tone: 'lu-tone-water',
      of: (a: AssessmentDto) => a.totalBodyWaterKg,
      std: std.waterKg,
    },
    {
      key: 'protein',
      icon: 'protein',
      tone: 'lu-tone-protein',
      of: (a: AssessmentDto) => a.proteinKg,
      std: std.proteinKg,
    },
    {
      key: 'minerals',
      icon: 'gem',
      tone: 'lu-tone-minerals',
      of: (a: AssessmentDto) => a.mineralsKg,
      std: std.mineralsKg,
    },
  ] as const;
  const composition: BarProps[] = parts.map((c) => ({
    testId: `bar-${c.key}`,
    label: t(`bodyComp.comp.${c.key}`),
    icon: c.icon,
    tone: c.tone,
    scale: SCALES.smm,
    position: ofStd(c.of(scan), c.std),
    comparePosition: compare && ofStd(c.of(compare), c.std),
    value: c.of(scan),
    compareValue: compare ? c.of(compare) : null,
    digits: c.key === 'minerals' ? 2 : 1,
    unit: kg,
    range: kgRange(c.std),
    status: statusFor(ofStd(c.of(scan), c.std), SCALES.smm.normal),
    better: c.key === 'water' ? null : 'up',
  }));

  const segs = scan.segments;
  const segScale = kind === 'lean' ? SCALES.segmentLean : SCALES.segmentFat;
  const statuses = segs
    ? (Object.fromEntries(
        (Object.keys(segs[kind]) as BodySegment[]).map((s) => [s, statusFor(segs[kind][s].pct, segScale.normal)]),
      ) as Record<BodySegment, Status>)
    : null;
  const thenSeg = (s: BodySegment) => compare?.segments?.[kind][s] ?? null;
  const kinds = ['lean', 'fat'] as const;

  const legend = compare && (
    <p
      className="m-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.72rem] font-normal text-muted"
      data-testid="compare-legend"
    >
      <span className="flex items-center gap-1.5">
        <span className="lu-legend-now" aria-hidden="true" />
        {t('bodyComp.legendNow', { date: shortDate(scan.takenAt) })}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="lu-legend-then" aria-hidden="true" />
        {t('bodyComp.legendThen', { date: shortDate(compare.takenAt) })}
      </span>
    </p>
  );

  return (
    <div className="grid gap-3.5" data-testid="body-comp">
      <section className="lu-card grid gap-3.5" aria-labelledby="bc-muscle-fat">
        <header className="grid gap-0.5">
          <span className="lu-card-kicker">{t('bodyComp.kicker')}</span>
          <h2 id="bc-muscle-fat" className="lu-card-title">
            {t('bodyComp.muscleFat')}
          </h2>
        </header>
        {legend}
        <ZoneHeader />
        {muscleFat.map((b) => (
          <Bar key={b.testId} {...b} />
        ))}
        <h3 className="lu-card-title m-0 mt-1 text-[0.95rem]">{t('bodyComp.obesity')}</h3>
        <ZoneHeader />
        {obesity.map((b) => (
          <Bar key={b.testId} {...b} />
        ))}
      </section>

      <section className="lu-card grid gap-3" aria-labelledby="bc-segments" data-testid="segments">
        <h2 id="bc-segments" className="lu-card-title">
          {t('bodyComp.segmental')}
        </h2>
        {segs && statuses ? (
          <>
            <div
              role="radiogroup"
              aria-label={t('bodyComp.segmentView')}
              className="grid grid-cols-2 gap-1 rounded-[10px] bg-surface-2 p-1"
            >
              {kinds.map((k, i) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={kind === k}
                  tabIndex={kind === k ? 0 : -1}
                  data-testid={`segments-${k}`}
                  className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-0 bg-transparent px-1 font-inherit text-[0.85rem] font-normal text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-checked:bg-primary aria-checked:text-primary-contrast"
                  onClick={() => setKind(k)}
                  onKeyDown={(e) => {
                    const to = rovingTarget(e, i, kinds.length, rtl);
                    if (to === null) return;
                    setKind(kinds[to]);
                    focusSibling(e, to);
                  }}
                >
                  <Icon className="shrink-0 text-base" name={k === 'lean' ? 'muscle' : 'bodyFat'} />
                  {t(k === 'lean' ? 'bodyComp.lean' : 'bodyComp.fatView')}
                </button>
              ))}
            </div>
            {/* Laid out left to right in both languages, like the scan sheet: the figure is a picture of the body. */}
            <div
              dir="ltr"
              className="mx-auto grid w-full max-w-[32rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-4"
            >
              <div className="col-start-1 row-start-1">
                <Callout
                  segment="leftArm"
                  reading={segs[kind].leftArm}
                  then={thenSeg('leftArm')}
                  status={statuses.leftArm}
                  kind={kind}
                  align="right"
                />
              </div>
              <div className="col-start-1 row-start-2">
                <Callout
                  segment="leftLeg"
                  reading={segs[kind].leftLeg}
                  then={thenSeg('leftLeg')}
                  status={statuses.leftLeg}
                  kind={kind}
                  align="right"
                />
              </div>
              <div className="col-start-2 row-span-2 row-start-1 grid justify-items-center">
                <BodyScanFigure statuses={statuses} kind={kind} sex={sex} />
              </div>
              <div className="col-start-3 row-start-1">
                <Callout
                  segment="rightArm"
                  reading={segs[kind].rightArm}
                  then={thenSeg('rightArm')}
                  status={statuses.rightArm}
                  kind={kind}
                  align="left"
                />
              </div>
              <div className="col-start-3 row-start-2">
                <Callout
                  segment="rightLeg"
                  reading={segs[kind].rightLeg}
                  then={thenSeg('rightLeg')}
                  status={statuses.rightLeg}
                  kind={kind}
                  align="left"
                />
              </div>
              <div className="col-span-3 row-start-3">
                <Callout
                  segment="trunk"
                  reading={segs[kind].trunk}
                  then={thenSeg('trunk')}
                  status={statuses.trunk}
                  kind={kind}
                  align="center"
                />
              </div>
            </div>
            <p className="m-0 text-center text-[0.72rem] font-semibold text-muted">
              {t(kind === 'lean' ? 'bodyComp.leanNote' : 'bodyComp.fatNote')}
            </p>
          </>
        ) : (
          <p className="m-0 text-[0.85rem] font-semibold text-muted" data-testid="segments-none">
            {t('bodyComp.noSegments')}
          </p>
        )}
      </section>

      <section className="lu-card grid gap-3.5" aria-labelledby="bc-composition">
        <h2 id="bc-composition" className="lu-card-title">
          {t('bodyComp.composition')}
        </h2>
        <ZoneHeader />
        {composition.map((b) => (
          <Bar key={b.testId} {...b} />
        ))}
      </section>
    </div>
  );
};

export default BodyComposition;
