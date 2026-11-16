import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { focusSibling, rovingTarget } from '../components/roving';
import Avatar from './Avatar';
import {
  applyOutfit,
  isHijab,
  outfitsFor,
  trainingStyles,
  sameAvatar,
  stylesFor,
  type AvatarConfigDto,
  type CustomizerTab,
  type ResolvedStyles,
  type StylePart,
} from './catalog';
import PixelIcon, { type PixelIconName } from '../components/PixelIcon';

const ICONS: Record<CustomizerTab, PixelIconName> = {
  outfits: 'wardrobe',
  hair: 'hair',
  body: 'body',
  top: 'shirt',
  pants: 'pants',
  shoes: 'shoe',
  socks: 'sock',
  beard: 'beard',
  face: 'smile',
};

export function CustomizerIcon({ tab }: { tab: CustomizerTab }) {
  return <PixelIcon name={ICONS[tab]} className="shrink-0 text-xl" />;
}

export function OutfitPicker({
  config,
  onChange,
}: {
  config: AvatarConfigDto;
  onChange: (draft: AvatarConfigDto) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2">
      <h2 id="avatar-outfit-title" className={HEADING}>
        {t('avatar.outfitTitle')}
      </h2>
      <div className={GRID} role="group" aria-labelledby="avatar-outfit-title">
        {outfitsFor(config.rig).map((id) => {
          const preview = applyOutfit(config, id);
          const selected = sameAvatar(config, preview);
          return (
            <button key={id} type="button" aria-pressed={selected} onClick={() => onChange(preview)} className={TILE}>
              <span className="lu-style-thumb relative grid aspect-[3/4] place-items-center" aria-hidden="true">
                <Avatar config={preview} crop="full" className="h-[88%] w-full" />
                {selected && <SelectedMark />}
              </span>
              <span className={TILE_LABEL}>{t(`avatar.outfit.${id}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Section label above each grid: small and quiet, so the pictures lead. */
const HEADING = 'm-0 text-[0.78rem] font-extrabold text-muted uppercase ar:normal-case';

const GRID = 'grid grid-cols-3 gap-2 min-[400px]:grid-cols-4';
const TILE =
  'lu-style-card relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border-2 border-line bg-surface p-0 aria-checked:border-primary aria-pressed:border-primary';
const TILE_LABEL =
  'grid flex-1 place-items-center px-1.5 py-1 text-center text-[0.75rem] leading-snug font-semibold text-ink';

function SelectedMark() {
  return (
    <span className="absolute inset-e-1 inset-bs-1 grid size-5 place-items-center rounded-full bg-primary text-primary-contrast">
      <PixelIcon name="check" className="text-[0.85rem]" />
    </span>
  );
}

interface StylePickerProps<K extends StylePart> {
  part: K;
  config: AvatarConfigDto;
  onChange: (id: ResolvedStyles[K]) => void;
  action?: ReactNode;
}

export function StylePicker<K extends StylePart>({ part, config, onChange, action }: StylePickerProps<K>) {
  const { t, i18n } = useTranslation();
  const styles = stylesFor(config.styles);
  const offered = trainingStyles(part, config.rig, styles[part]);
  const options =
    part === 'hair' && config.rig === 'women'
      ? [...offered.filter(isHijab), ...offered.filter((id) => !isHijab(id))]
      : offered;
  const labelId = `style-label-${part}`;
  const labelKey = part === 'hair' && config.rig === 'women' ? 'avatar.hairAndHeadwear' : `avatar.styleLabel.${part}`;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 id={labelId} className={HEADING}>
          {t(labelKey)}
        </h2>
        {action}
      </div>
      <div role="radiogroup" aria-labelledby={labelId} className={GRID}>
        {options.map((id, i) => {
          const selected = styles[part] === id;
          const optionKey: `avatar.style.${ResolvedStyles[StylePart]}` = `avatar.style.${id}`;
          const preview = { ...config, styles: { ...styles, body: 'balanced' as const, [part]: id } };
          if (part === 'body') preview.styles.top = 'tank';
          if (part === 'hair' && styles.top === 'hood-up') preview.styles.top = 'hoodie';
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              className={TILE}
              onClick={() => onChange(id)}
              onKeyDown={(e) => {
                const to = rovingTarget(e, i, options.length, i18n.dir() === 'rtl');
                if (to === null) return;
                onChange(options[to]);
                focusSibling(e, to);
              }}
            >
              <span className="lu-style-thumb relative grid aspect-square place-items-center" aria-hidden="true">
                <Avatar config={preview} crop={part === 'glasses' ? 'face' : part} className="h-[80%] w-full" />
                {selected && <SelectedMark />}
              </span>
              <span className={TILE_LABEL}>{t(optionKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
