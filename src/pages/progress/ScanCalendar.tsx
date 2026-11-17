import { IonModal } from '@ionic/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AssessmentDto } from '../../api/types';
import { useSwipe } from '../../components/useSwipe';
import { formatNumber, numberLocale } from '../../i18n/format';
import Icon from '../../components/Icon';

interface Props {
  open: boolean;
  /** Newest first, as the API returns them. */
  scans: AssessmentDto[];
  /** Index of the scan shown on the page. */
  current: number;
  onPick: (index: number) => void;
  onClose: () => void;
}

/** A month as a number that sorts: year * 12 + month (0-based). */
const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth();
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const NAV = 'lu-icon-button size-11 disabled:cursor-default disabled:opacity-35 [&:disabled]:shadow-none';

/** The open sheet's content; it mounts on each open, so it starts on the month of the scan on screen. */
const CalendarBody: React.FC<Omit<Props, 'open'>> = ({ scans, current, onPick, onClose }) => {
  const { t, i18n } = useTranslation();
  const locale = numberLocale();
  // Weeks start on Saturday in Egypt, on Sunday in English.
  const weekStart = i18n.language === 'ar' ? 6 : 0;

  const byDay = new Map<string, number>();
  scans.forEach((s, i) => byDay.set(dayKey(new Date(s.takenAt)), i));
  const months = scans.map((s) => monthKey(new Date(s.takenAt)));
  const first = Math.min(...months);
  const last = Math.max(...months);

  const [month, setMonth] = useState(() => monthKey(new Date(scans[current]?.takenAt ?? Date.now())));
  const year = Math.floor(month / 12);
  const m = month % 12;
  const days = new Date(year, m + 1, 0).getDate();
  const lead = (new Date(year, m, 1).getDay() - weekStart + 7) % 7;

  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, m, 1));
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  const longDate = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  // 2023-01-01 was a Sunday: day labels in the week's order.
  const heads = Array.from({ length: 7 }, (_, i) => weekday.format(new Date(2023, 0, 1 + ((weekStart + i) % 7))));
  const scansThisMonth = scans.filter((s) => monthKey(new Date(s.takenAt)) === month).length;
  // Swipe sideways to change month, within the scan history.
  const next = useCallback(() => setMonth((x) => Math.min(last, x + 1)), [last]);
  const prev = useCallback(() => setMonth((x) => Math.max(first, x - 1)), [first]);
  const swipe = useSwipe({ onNext: next, onPrev: prev, rtl: i18n.dir() === 'rtl' });

  return (
    <section
      className="flex h-full flex-col bg-page text-ink"
      aria-labelledby="calendar-title"
      data-testid="scan-calendar"
    >
      <div className="flex items-center gap-2 px-4 pt-[18px] pb-1">
        <h2 id="calendar-title" className="m-0 flex-1 text-[1.25rem] leading-tight font-semibold">
          {t('progress.calendarTitle')}
        </h2>
        <button type="button" className="lu-icon-button" aria-label={t('progress.closeScans')} onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      <p className="m-0 px-4 pb-3 text-[0.85rem] font-semibold text-muted">{t('progress.calendarHint')}</p>

      <div ref={swipe} className="mx-4 grid gap-3 rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={NAV}
            onClick={() => setMonth(month - 1)}
            disabled={month <= first}
            aria-label={t('progress.prevMonth')}
            data-testid="calendar-prev"
          >
            <Icon className="rtl:-scale-x-100" name="chevronBack" />
          </button>
          <p className="m-0 grid flex-1 text-center" aria-live="polite">
            <strong className="text-[1.05rem] font-semibold" data-testid="calendar-month">
              {monthName}
            </strong>
            <span className="text-[0.78rem] font-normal text-muted">
              {t('progress.scansInMonth', { n: formatNumber(scansThisMonth) })}
            </span>
          </p>
          <button
            type="button"
            className={NAV}
            onClick={() => setMonth(month + 1)}
            disabled={month >= last}
            aria-label={t('progress.nextMonth')}
            data-testid="calendar-next"
          >
            <Icon className="rtl:-scale-x-100" name="chevronForward" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center" aria-hidden="true">
          {heads.map((h, i) => (
            <span key={i} className="text-[0.72rem] font-normal text-muted">
              {h}
            </span>
          ))}
        </div>
        <ol className="m-0 grid list-none grid-cols-7 gap-1 p-0">
          {Array.from({ length: lead }, (_, i) => (
            <li key={`pad-${i}`} aria-hidden="true" />
          ))}
          {Array.from({ length: days }, (_, d) => {
            const date = new Date(year, m, d + 1);
            const scan = byDay.get(dayKey(date));
            const label = formatNumber(d + 1);
            return (
              <li key={d} className="grid aspect-square">
                {scan === undefined ? (
                  <span className="grid place-items-center text-[0.85rem] font-semibold text-muted">{label}</span>
                ) : (
                  <button
                    type="button"
                    className={`lu-cal-day grid cursor-pointer place-items-center rounded-lg border p-0 font-inherit text-[0.9rem] font-semibold ${scan === current ? 'is-current' : ''}`}
                    aria-label={t('progress.scanOn', { date: longDate.format(date) })}
                    aria-current={scan === current ? 'date' : undefined}
                    onClick={() => {
                      onPick(scan);
                      onClose();
                    }}
                    data-testid="calendar-scan-day"
                  >
                    {label}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

/** Every scan on a month calendar: scan days are highlighted, and tapping one shows that scan. */
const ScanCalendar: React.FC<Props> = ({ open, onClose, ...rest }) => {
  const { t } = useTranslation();
  const title = t('progress.calendarTitle');
  return (
    <IonModal
      // Name Ionic's inner role="dialog" directly (WCAG 4.1.2), as the scan list does.
      onWillPresent={(e) =>
        (e.target as HTMLElement).shadowRoot?.querySelector('[role="dialog"]')?.setAttribute('aria-label', title)
      }
      isOpen={open}
      onDidDismiss={onClose}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
    >
      {open && rest.scans.length > 0 && <CalendarBody {...rest} onClose={onClose} />}
    </IonModal>
  );
};

export default ScanCalendar;
