import { IonModal } from '@ionic/react';
import { useTranslation } from 'react-i18next';

import CtaButton from '../../components/CtaButton';
import { formatCount } from '../../i18n/format';
import { medalTarget, medalTitle } from './format';
import MedalArt from './MedalArt';
import type { MedalStatus } from './types';

interface Props {
  /** New medals not yet celebrated, rarest first. Empty closes the dialog. */
  queue: MedalStatus[];
  /** The member has seen these; record them so they never celebrate again. */
  onSeen: (ids: string[]) => void;
}

/**
 * "Medal unlocked!" for each newly earned medal, one at a time. Continue moves
 * to the next; Skip (or closing it any other way) marks the rest as seen too.
 */
const UnlockCelebration: React.FC<Props> = ({ queue, onSeen }) => {
  const { t } = useTranslation();
  const medal = queue[0];
  const rest = queue.length - 1;

  return (
    <IonModal
      isOpen={queue.length > 0}
      className="lu-medal-celebrate"
      // Backdrop tap, Escape or Android back count as "seen all". Leaving the page
      // closes it programmatically (no role), and the rest celebrate next visit.
      onDidDismiss={(e) => e.detail.role && queue.length && onSeen(queue.map((m) => m.id))}
      onWillPresent={(e) =>
        (e.target as HTMLElement).shadowRoot
          ?.querySelector('[role="dialog"]')
          ?.setAttribute('aria-label', t('medals.celebrate.title'))
      }
    >
      {medal && (
        <div className="lu-medal-celebrate-card lu-tab-body" data-testid="medal-celebration">
          <p className="lu-display m-0 text-[2rem] leading-none text-[var(--lu-rarity-gold)]">
            {t('medals.celebrate.title')}
          </p>
          {/* Keyed so the pop-in replays for each medal in the queue. */}
          <MedalArt key={medal.id} category={medal.category} rarity={medal.rarity} locked={false} />
          <h2 className="m-0 text-[1.3rem] leading-tight font-extrabold" data-testid="medal-celebration-title">
            {medalTitle(t, medal)}
          </h2>
          <p className="m-0 text-[0.85rem] text-[var(--lu-splash-text-muted)]">
            {t(`medals.rarity.${medal.rarity}`)} · <bdi>{medalTarget(t, medal)}</bdi>
          </p>
          <p className="m-0 text-[1.1rem] font-extrabold text-[var(--lu-rarity-gold)]">
            {t('medals.xpReward', { xp: formatCount(medal.xpReward) })}
          </p>
          <CtaButton className="mt-1 w-full" onClick={() => onSeen([medal.id])}>
            {t('medals.celebrate.continue')}
          </CtaButton>
          {rest > 0 && (
            <button
              type="button"
              className="lu-link-button text-[var(--lu-splash-text-muted)]"
              onClick={() => onSeen(queue.map((m) => m.id))}
            >
              {t('medals.celebrate.skip')} · {t('medals.celebrate.more', { count: rest })}
            </button>
          )}
        </div>
      )}
    </IonModal>
  );
};

export default UnlockCelebration;
