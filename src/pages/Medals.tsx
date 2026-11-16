import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonRouter,
  useIonViewDidEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ProfileDto } from '../api/types';
import { useApi } from '../api/useApi';
import CtaButton from '../components/CtaButton';
import PixelIcon, { type PixelIconName } from '../components/PixelIcon';
import { focusSibling, rovingTarget } from '../components/roving';
import { formatNumber, formatPercent } from '../i18n/format';
import { MEDAL_CATEGORIES, MEDAL_CONFIG } from './medals/config';
import { medalValue } from './medals/format';
import MedalCard from './medals/MedalCard';
import MedalSheet from './medals/MedalSheet';
import { medalSummary, unseenUnlocks } from './medals/rules';
import { loadSeen, markSeen } from './medals/seen';
import type { MedalCategory, MedalCategoryStatus, MedalStatus } from './medals/types';
import UnlockCelebration from './medals/UnlockCelebration';
import { useMedalData } from './medals/useMedalData';
import './medals/Medals.scss';

type Filter = 'all' | MedalCategory;
const FILTERS: Filter[] = ['all', ...MEDAL_CATEGORIES];

const ICONS: Record<MedalCategory, PixelIconName> = {
  bodyFat: 'flame',
  muscle: 'muscle',
  bench: 'dumbbell',
  squat: 'dumbbell',
  deadlift: 'dumbbell',
  militaryPress: 'dumbbell',
  pushUps: 'muscle',
  pullUps: 'muscle',
  plank: 'clock',
  bmi: 'scale',
};

function Overview({ categories }: { categories: MedalCategoryStatus[] }) {
  const { t } = useTranslation();
  const s = medalSummary(categories);
  return (
    <section className="lu-trophy-overview" aria-labelledby="trophy-overview" data-testid="medal-overview">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="trophy-overview" className="m-0 text-[0.9rem] font-extrabold">
            {t('medals.overview')}
          </h2>
          <p className="m-0 mt-1 leading-none font-extrabold tabular-nums">
            <bdi className="lu-trophy-count" dir="ltr" aria-hidden="true">
              {formatNumber(s.unlocked)} <small>/ {formatNumber(s.total)}</small>
            </bdi>
            <span className="sr-only" data-testid="medal-count">
              {t('medals.count', { unlocked: formatNumber(s.unlocked), total: formatNumber(s.total) })}
            </span>
          </p>
        </div>
        <PixelIcon name="trophy" className="shrink-0 text-[2.6rem] [--px-fill:var(--lu-rarity-gold)]" />
      </div>
      <div className="grid gap-1.5">
        <div
          className="lu-trophy-bar"
          role="progressbar"
          aria-label={t('medals.overview')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={s.percent}
        >
          <span className="rtl:ms-auto" style={{ inlineSize: `${s.percent}%` }} />
        </div>
        <p className="m-0 text-[0.78rem] font-bold text-[var(--lu-splash-text-muted)]">
          {t('medals.complete', { percent: formatPercent(s.percent) })}
        </p>
      </div>
      <dl className="lu-trophy-stats m-0">
        <div>
          <dt>{t('medals.stat.unlocked')}</dt>
          <dd>{formatNumber(s.unlocked)}</dd>
        </div>
        <div>
          <dt>{t('medals.stat.locked')}</dt>
          <dd>{formatNumber(s.locked)}</dd>
        </div>
        <div>
          <dt>{t('medals.stat.xp')}</dt>
          <dd data-testid="medal-xp">{formatNumber(s.xp)}</dd>
        </div>
      </dl>
    </section>
  );
}

function Filters({ value, onChange }: { value: Filter; onChange: (f: Filter) => void }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="grid gap-2">
      <div className="lu-trophy-filters" role="radiogroup" aria-label={t('medals.filter')}>
        {FILTERS.map((filter, index) => (
          <button
            key={filter}
            type="button"
            role="radio"
            aria-checked={filter === value}
            tabIndex={filter === value ? 0 : -1}
            onClick={() => onChange(filter)}
            onKeyDown={(event) => {
              const target = rovingTarget(event, index, FILTERS.length, i18n.dir() === 'rtl');
              if (target === null) return;
              onChange(FILTERS[target]);
              focusSibling(event, target);
            }}
          >
            {filter === 'all' ? t('medals.all') : t(`medals.category.${filter}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Status({ status }: { status: MedalCategoryStatus }) {
  const { t } = useTranslation();
  const { category, current, unavailable, bestWorkingSet, pendingLifts } = status;
  const { unit, measurementType } = MEDAL_CONFIG[category];
  const kg = (n: number) => `${formatNumber(n)} ${t('units.kg')}`;
  const lines: string[] = [];
  if (unavailable) lines.push(t(`medals.unavailable.${unavailable}`));
  else if (current !== null)
    lines.push(
      t(`medals.current.${measurementType}`, {
        value: medalValue(t, category, unit, current),
      }),
    );
  if (bestWorkingSet)
    lines.push(
      t('medals.workingSet', { weight: kg(bestWorkingSet.weightKg), reps: formatNumber(bestWorkingSet.reps) }),
    );
  if (pendingLifts) lines.push(t('medals.pending', { count: pendingLifts }));
  return (
    <ul className="m-0 grid list-none gap-1 p-0 text-[0.78rem] font-bold" data-testid={`medal-status-${category}`}>
      {lines.map((line, i) => (
        <li key={line} className={i === 0 && !unavailable ? 'text-ink' : 'text-muted'}>
          <bdi>{line}</bdi>
        </li>
      ))}
    </ul>
  );
}

function Section({ status, onOpen }: { status: MedalCategoryStatus; onOpen: (m: MedalStatus) => void }) {
  const { t } = useTranslation();
  const heading = `medal-section-${status.category}`;
  return (
    <section
      className="lu-px-card lu-medal-section"
      data-category={status.category}
      aria-labelledby={heading}
      data-testid={heading}
    >
      <div className="grid content-start gap-2">
        <div className="flex items-center gap-3">
          <span className="lu-medal-section-icon">
            <PixelIcon name={ICONS[status.category]} />
          </span>
          <h2 id={heading} className="m-0 text-[1.1rem] leading-tight font-extrabold text-ink">
            {t(`medals.category.${status.category}`)}
          </h2>
        </div>
        <p className="m-0 text-[0.8rem] leading-snug text-muted">{t(`medals.hint.${status.category}`)}</p>
        <Status status={status} />
      </div>
      <ol className="lu-medal-grid">
        {status.medals.map((medal) => (
          <li key={medal.id}>
            <MedalCard medal={medal} onOpen={onOpen} />
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Medals() {
  const { t } = useTranslation();
  const router = useIonRouter();
  const me = useApi<ProfileDto>('/me');
  const medals = useMedalData(me.data);
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<MedalStatus | null>(null);
  const [seen, setSeen] = useState<Set<string> | null>(null);
  // Ionic moves overlays to the app root, so they would stay on screen over the next page.
  // Show them only while this page is the visible one.
  const [active, setActive] = useState(false);
  useIonViewDidEnter(() => setActive(true));
  useIonViewWillLeave(() => {
    setActive(false);
    setOpen(null);
  });

  const { categories } = medals;
  const failed = me.status === 'error' || medals.failed;
  const memberId = me.data?.memberId ?? null;

  useEffect(() => {
    if (memberId === null) return;
    let live = true;
    void loadSeen(memberId).then((s) => live && setSeen(s));
    return () => {
      live = false;
    };
  }, [memberId]);

  const queue = useMemo(() => (categories && seen ? unseenUnlocks(categories, seen) : []), [categories, seen]);

  const onSeen = useCallback(
    (ids: string[]) => {
      if (memberId === null) return;
      setSeen((s) => new Set([...(s ?? []), ...ids]));
      void markSeen(memberId, ids);
    },
    [memberId],
  );

  const reloadAll = () => Promise.all([me.reload(), medals.reload()]);
  const retryAll = () => Promise.all([me.retry(), medals.retry()]);
  const shown = categories?.filter((c) => filter === 'all' || c.category === filter) ?? [];

  return (
    <IonPage data-testid="page-medals">
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={(e) => void reloadAll().finally(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>
        <div className="lu-page-body lu-tab-body mx-auto grid w-full max-w-[1200px] auto-rows-min content-start gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lu-icon-button shrink-0"
              aria-label={t('medals.back')}
              onClick={() => {
                if (router.canGoBack()) router.goBack();
                else router.push('/tabs/profile', 'back', 'replace');
              }}
            >
              <PixelIcon name="arrowBack" className="rtl:-scale-x-100" />
            </button>
            <div className="min-w-0">
              <h1 className="lu-display m-0 text-[clamp(2.2rem,9vw,3rem)] leading-none text-ink">
                {t('medals.title')}
              </h1>
              <p className="m-0 mt-1 text-[0.85rem] leading-snug text-muted">{t('medals.subtitle')}</p>
            </div>
          </div>

          {!categories && !failed && (
            <div className="lu-state" role="status">
              <p>{t('common.loading')}</p>
            </div>
          )}
          {failed && !categories && (
            <div className="lu-state" role="alert">
              <p>{t('common.error')}</p>
              <CtaButton onClick={() => void retryAll()}>{t('common.retry')}</CtaButton>
            </div>
          )}

          {categories && (
            <>
              <Overview categories={categories} />
              <Filters value={filter} onChange={setFilter} />
              {shown.map((status) => (
                <Section key={status.category} status={status} onOpen={setOpen} />
              ))}
            </>
          )}
        </div>
        <MedalSheet medal={active ? open : null} onClose={() => setOpen(null)} />
        <UnlockCelebration queue={active && !open ? queue : []} onSeen={onSeen} />
      </IonContent>
    </IonPage>
  );
}
