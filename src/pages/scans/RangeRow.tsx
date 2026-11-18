import { useTranslation } from 'react-i18next';

import type { NormalRange } from '../../api/types';
import type { Status } from '../../body/standards';
import type { IconName } from '../../components/Icon';
import { Chip, IconTile, Num, type Tone } from '../../components/ui';
import { formatNumber } from '../../i18n/format';

/**
 * One value as a dot on its shaded normal band, with one word
 * (ui-standards → Components, RangeRow). The low end sits at the reading
 * start, so it's on the right in Arabic.
 */
export function RangeRow({
  testId,
  icon,
  tone,
  label,
  value,
  unit,
  digits = 1,
  range,
  zone,
  attention,
  position,
  bandStart,
  bandEnd,
  note,
}: {
  testId: string;
  icon: IconName;
  tone: Tone;
  label: string;
  value: number;
  unit: string;
  digits?: number;
  range: NormalRange | null;
  zone: Status;
  /** The zone is on the side that needs attention: show the amber chip. */
  attention: boolean;
  /** 0–1 along the track, from the reading start. */
  position: number;
  bandStart: number;
  bandEnd: number;
  /** Replaces the range line (e.g. the belly-fat goal). */
  note?: string;
}) {
  const { t } = useTranslation();
  const word = t(`scan.zone.${zone}`);
  return (
    <div className="grid gap-2.5" data-testid={testId} data-zone={zone}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <IconTile icon={icon} tone={tone} />
        <span className="min-w-[5rem] flex-1 text-label text-ink">{label}</span>
        <Num value={value} digits={digits} unit={unit} className="text-body font-semibold text-ink" />
        {attention ? (
          <Chip tone="attention">{word}</Chip>
        ) : (
          <span className="text-label text-muted" data-testid={`${testId}-word`}>
            {word}
          </span>
        )}
      </div>
      <div className="relative h-2.5 rounded-full bg-surface-3" aria-hidden="true">
        <span
          className="absolute inset-y-0 rounded-full bg-[color-mix(in_srgb,var(--lu-good)_28%,var(--lu-surface-3))]"
          style={{ insetInlineStart: `${bandStart * 100}%`, inlineSize: `${(bandEnd - bandStart) * 100}%` }}
        />
        <span
          className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-surface-1 bg-ink ltr:-translate-x-1/2 rtl:translate-x-1/2"
          style={{ insetInlineStart: `${position * 100}%` }}
        />
      </div>
      <span className="text-caption text-muted">
        {note ??
          (range
            ? t('scan.range', { low: formatNumber(range.low, digits), high: formatNumber(range.high, digits) })
            : '')}
      </span>
    </div>
  );
}

export default RangeRow;
