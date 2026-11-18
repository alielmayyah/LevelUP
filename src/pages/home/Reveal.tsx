import { IonModal } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JourneyDto } from '../../api/types';
import Icon from '../../components/Icon';
import { Button, Num } from '../../components/ui';
import LevelEmblem from '../journey/LevelEmblem';
import Road from '../journey/Road';
import { mainChange } from './revealRules';

const BEATS = 3;

/**
 * The new-result reveal: three beats (what changed, the main change on the
 * road, what was earned), each a tap away. It never hides a number behind
 * an animation, and Skip closes it at any point.
 */
export function Reveal({ journey, open, onClose }: { journey: JourneyDto; open: boolean; onClose: () => void }) {
  return (
    <IonModal isOpen={open} onDidDismiss={onClose} className="lu-reveal" aria-labelledby="reveal-title">
      {/* Mounted only while open, so every opening starts at the first beat. */}
      {open && <RevealBody journey={journey} onClose={onClose} />}
    </IonModal>
  );
}

function RevealBody({ journey, onClose }: { journey: JourneyDto; onClose: () => void }) {
  const { t } = useTranslation();
  const [beat, setBeat] = useState(0);
  const main = mainChange(journey);
  const last = beat === BEATS - 1;

  return (
    <>
      <div
        className="grid h-full grid-rows-[auto_1fr_auto] gap-6 bg-bg px-5 pt-[calc(16px+var(--ion-safe-area-top,0px))] pb-[calc(20px+var(--ion-safe-area-bottom,0px))]"
        data-testid="reveal"
        data-beat={beat}
      >
        <div className="grid gap-4">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: BEATS }, (_, i) => (
              <span key={i} className={`h-1 flex-1 rounded-full ${i <= beat ? 'bg-brand-soft' : 'bg-surface-3'}`} />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <h2 id="reveal-title" className="m-0 text-card-title text-ink">
              {t('reveal.title')}
            </h2>
            <Button variant="quiet" onClick={onClose} data-testid="reveal-skip">
              {t('reveal.skip')}
            </Button>
          </div>
          <p className="sr-only" aria-live="polite">
            {t('reveal.beat', { n: beat + 1 })}
          </p>
        </div>

        <div key={beat} className="lu-beat-in grid content-center justify-items-center gap-6 text-center">
          {beat === 0 && (
            <>
              <span className="text-label text-muted">{t('reveal.verdict')}</span>
              <p className="m-0 max-w-[22ch] text-verdict text-ink" data-testid="reveal-verdict">
                {t(`journey.verdict.${journey.verdict}`)}
              </p>
            </>
          )}
          {beat === 1 && (
            <>
              <span className="text-label text-muted">{t('reveal.change')}</span>
              {main ? (
                <div className="grid justify-items-center gap-1" data-testid="reveal-change">
                  <Num
                    value={main.change.delta}
                    signed
                    digits={1}
                    unit={t('units.kg')}
                    className="text-display text-good"
                  />
                  <span className="text-body text-ink">{t(`journey.change.${main.metric}`)}</span>
                </div>
              ) : (
                <p className="m-0 text-body text-muted">{t('reveal.onTheWay')}</p>
              )}
              <div className="w-full max-w-sm">
                <Road stops={journey.stops} nextDue={journey.nextScanDue} />
              </div>
            </>
          )}
          {beat === 2 && (
            <>
              <span className="text-label text-muted">{t('reveal.milestone')}</span>
              <LevelEmblem level={journey.level} />
              {journey.milestone && (
                <p className="m-0 flex items-center gap-2 text-card-title text-ink" data-testid="reveal-milestone">
                  <Icon name="trophy" className="text-brand-soft" />
                  {t(`journey.milestone.${journey.milestone.key}.title`, { level: journey.milestone.level })}
                </p>
              )}
            </>
          )}
        </div>

        <Button
          icon={last ? 'check' : 'arrowForward'}
          onClick={() => (last ? onClose() : setBeat((b) => b + 1))}
          data-testid="reveal-next"
        >
          {last ? t('reveal.done') : t('reveal.next')}
        </Button>
      </div>
    </>
  );
}

export default Reveal;
