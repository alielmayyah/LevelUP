import { useIonViewWillLeave } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Icon from '../../components/Icon';
import { formatNumber, formatPercent } from '../../i18n/format';
import { medalTarget, medalValue } from './format';
import MedalArt from './MedalArt';
import MedalSheet from './MedalSheet';
import { medalShowcase } from './rules';
import type { MedalCategory, MedalCategoryStatus, MedalStatus } from './types';

function ShowcaseCard({ medal, next, onOpen }: { medal: MedalStatus; next?: MedalStatus; onOpen: () => void }) {
  const { t } = useTranslation();
  const percent = next?.progress == null ? null : Math.round(next.progress * 100);

  return (
    <button
      type="button"
      className="lu-showcase-medal"
      data-testid={`profile-medal-${medal.category}`}
      data-unlocked={medal.unlocked}
      onClick={onOpen}
    >
      <span className="text-[0.8rem] leading-tight font-semibold">{t(`medals.category.${medal.category}`)}</span>
      <MedalArt category={medal.category} rarity={medal.rarity} locked={!medal.unlocked} />
      <span className="lu-rarity" data-rarity={medal.rarity}>
        {t(`medals.rarity.${medal.rarity}`)}
      </span>
      <bdi className="text-[0.75rem] leading-tight font-normal text-muted">{medalTarget(t, medal)}</bdi>
      {/* The lock badge on the art shows it; screen readers hear it here. */}
      {!medal.unlocked && <span className="sr-only">{t('medals.locked')}</span>}
      {next && next.current !== null && (
        <span className="mt-auto grid w-full gap-1 pt-1" data-testid="profile-medal-progress">
          {percent !== null && (
            <span className="lu-medal-progress" aria-hidden="true">
              <span style={{ inlineSize: `${percent}%` }} />
            </span>
          )}
          <span className="text-[0.7rem] leading-tight font-normal text-muted">
            {medal.unlocked ? t('profile.medalNext', { target: medalTarget(t, next) }) : t('profile.medalProgress')}
            {' · '}
            <bdi>
              {percent === null ? medalValue(t, next.category, next.unit, next.current) : formatPercent(percent)}
            </bdi>
          </span>
        </span>
      )}
    </button>
  );
}

export default function MedalShowcase({
  categories,
  failed,
  retry,
}: {
  categories: MedalCategoryStatus[] | null;
  failed: boolean;
  retry: () => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<MedalCategory | null>(null);
  useIonViewWillLeave(() => setOpen(null));
  const summary = categories && medalShowcase(categories);
  const selected = summary?.slots.find(({ medal }) => medal.category === open)?.medal ?? null;

  return (
    <section className="lu-card grid gap-2" aria-labelledby="profile-medals">
      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <h2 id="profile-medals" className="lu-card-title">
          <Icon name="trophy" />
          {t('medals.link')}
        </h2>
        <Link to="/tabs/account/medals" className="lu-link-button inline-flex items-center gap-1.5 no-underline">
          {t('profile.viewMedals')}
          <Icon name="chevronForward" className="rtl:-scale-x-100" />
        </Link>
      </div>
      {failed ? (
        <div role="status">
          <p className="m-0 text-muted">{t('profile.medalsError')}</p>
          <button type="button" className="lu-link-button" onClick={() => void retry()}>
            {t('common.retry')}
          </button>
        </div>
      ) : summary ? (
        <>
          <p className="m-0 text-[0.85rem] font-normal text-muted" data-testid="profile-medal-count">
            {t('profile.medalCategoryCount', {
              unlocked: formatNumber(summary.unlocked),
              total: formatNumber(summary.slots.length),
            })}
          </p>
          <ul className="lu-showcase-grid m-0 list-none gap-2 p-0" data-testid="profile-medal-grid">
            {summary.slots.map(({ medal, next }) => (
              <li key={medal.category}>
                <ShowcaseCard medal={medal} next={next} onOpen={() => setOpen(medal.category)} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="lu-skeleton-card" aria-busy="true" />
      )}
      {selected && (
        <MedalSheet
          medal={selected}
          status={categories?.find((c) => c.category === selected.category)}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
