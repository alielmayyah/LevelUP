import { useTranslation } from 'react-i18next';

import { Num } from '../../components/ui';

/** The current level in a ring with the brand gradient rim. The number is the emblem; the label names it. */
export function LevelEmblem({ level }: { level: number }) {
  const { t } = useTranslation();
  return (
    <div
      className="grid size-[88px] flex-none place-items-center rounded-full bg-[image:var(--lu-brand-gradient)] p-[3px]"
      role="img"
      aria-label={t('journey.levelAria', { level })}
      data-testid="level-emblem"
    >
      <div className="grid size-full place-items-center content-center rounded-full bg-surface-1" aria-hidden="true">
        <span className="text-caption text-muted">{t('journey.level')}</span>
        <Num value={level} className="text-[2.25rem] leading-none font-bold text-ink" />
      </div>
    </div>
  );
}

export default LevelEmblem;
