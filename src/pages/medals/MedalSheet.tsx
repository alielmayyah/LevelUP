import { IonModal } from '@ionic/react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import Icon from '../../components/Icon';
import { formatNumber, formatPercent } from '../../i18n/format';
import { formatMedalDate, medalTitle, medalValue } from './format';
import MedalArt from './MedalArt';
import type { MedalCategoryStatus, MedalStatus } from './types';

interface Props {
  medal: MedalStatus | null;
  /** The medal's category: the member's records in it, for the "Your records" lines. */
  status?: MedalCategoryStatus;
  onClose: () => void;
}

/** Medal details in a sheet: swipe down, the ✕, the backdrop, Escape, or Android back close it. */
const MedalSheet: React.FC<Props> = ({ medal, status, onClose }) => {
  const { t } = useTranslation();
  return (
    <IonModal
      isOpen={medal !== null}
      onDidDismiss={onClose}
      initialBreakpoint={0.9}
      breakpoints={[0, 0.9, 1]}
      className="lu-medal-sheet"
      onWillPresent={(e) =>
        medal &&
        (e.target as HTMLElement).shadowRoot
          ?.querySelector('[role="dialog"]')
          ?.setAttribute('aria-label', medalTitle(t, medal))
      }
    >
      {medal && <Details medal={medal} status={status} onClose={onClose} />}
    </IonModal>
  );
};

/**
 * The detail lines kept off the Trophy Room page for members who want them:
 * the best verified record in precise terms, the best working set, and lifts
 * still waiting for the coach.
 */
function records(t: TFunction, status: MedalCategoryStatus | undefined, medal: MedalStatus): string[] {
  if (!status) return [];
  const kg = (n: number) => `${formatNumber(n)} ${t('units.kg')}`;
  const lines: string[] = [];
  if (!status.unavailable && status.current !== null)
    lines.push(
      t(`medals.current.${medal.measurementType}`, {
        value: medalValue(t, medal.category, medal.unit, status.current),
      }),
    );
  if (status.bestWorkingSet)
    lines.push(
      t('medals.workingSet', {
        weight: kg(status.bestWorkingSet.weightKg),
        reps: formatNumber(status.bestWorkingSet.reps),
      }),
    );
  if (status.pendingLifts) lines.push(t('medals.pending', { count: status.pendingLifts }));
  return lines;
}

function Details({
  medal,
  status,
  onClose,
}: {
  medal: MedalStatus;
  status: MedalCategoryStatus | undefined;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const value = (n: number) => medalValue(t, medal.category, medal.unit, n);
  const lines = records(t, status, medal);
  const requirement =
    medal.measurementType === 'BMI_MAINTENANCE' && medal.threshold === 0
      ? t('medals.requirement.BMI_ENTRY')
      : t(`medals.requirement.${medal.measurementType}`, { value: value(medal.threshold) });
  const percent = medal.progress === null ? null : Math.round(medal.progress * 100);

  return (
    <div className="lu-tab-body grid content-start gap-4 overflow-y-auto p-4 pb-[calc(24px+var(--ion-safe-area-bottom,0px))]">
      <div className="flex justify-end">
        <button type="button" className="lu-icon-button" aria-label={t('medals.detail.close')} onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      <div className="grid justify-items-center gap-2 text-center" data-testid="medal-detail">
        <MedalArt category={medal.category} rarity={medal.rarity} locked={!medal.unlocked} />
        <h2 className="lu-display m-0 text-[2rem] leading-none text-ink">{medalTitle(t, medal)}</h2>
        <p className="m-0 text-[0.85rem] font-normal text-muted">
          {t(`medals.category.${medal.category}`)} ·{' '}
          <span className="lu-rarity" data-rarity={medal.rarity}>
            {t(`medals.rarity.${medal.rarity}`)}
          </span>
        </p>
      </div>

      <dl className="lu-card m-0 grid gap-3 p-3.5">
        <Row label={t('medals.detail.status')}>
          <span data-testid="medal-detail-status">{t(medal.unlocked ? 'medals.unlocked' : 'medals.locked')}</span>
          {medal.unlockedAt && <span className="text-muted"> · {formatMedalDate(medal.unlockedAt)}</span>}
        </Row>
        <Row label={t('medals.detail.requirement')}>{requirement}</Row>
        {!medal.unlocked && (
          <Row label={t('medals.detail.progress')}>
            {medal.current === null ? (
              t('medals.detail.noProgress')
            ) : (
              <span className="grid gap-1.5">
                <bdi data-testid="medal-detail-progress">
                  {t('medals.progress', { current: value(medal.current), target: value(medal.threshold) })}
                  {percent !== null && ` · ${formatPercent(percent)}`}
                </bdi>
                {percent !== null && (
                  <span className="lu-medal-progress" aria-hidden="true">
                    <span className="rtl:ms-auto" style={{ inlineSize: `${percent}%` }} />
                  </span>
                )}
                {medal.remaining !== null && medal.remaining > 0 && (
                  <span className="text-muted">
                    {t('medals.remaining', {
                      value: medalValue(t, medal.category, medal.unit, medal.remaining),
                    })}
                  </span>
                )}
              </span>
            )}
          </Row>
        )}
        {lines.length > 0 && (
          <Row label={t('medals.detail.records')}>
            <ul className="m-0 grid list-none gap-1 p-0" data-testid="medal-detail-records">
              {lines.map((line) => (
                <li key={line}>
                  <bdi>{line}</bdi>
                </li>
              ))}
            </ul>
          </Row>
        )}
        <Row label={t('medals.detail.about')}>
          <span className="font-normal">{t(`medals.hint.${medal.category}`)}</span>
        </Row>
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-[0.75rem] font-semibold text-muted">{label}</dt>
      <dd className="m-0 text-[0.92rem] font-semibold text-ink">{children}</dd>
    </div>
  );
}

export default MedalSheet;
