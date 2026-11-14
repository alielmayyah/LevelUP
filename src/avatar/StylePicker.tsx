import { IonIcon } from '@ionic/react';
import { checkmark } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';

import { focusSibling, rovingTarget } from '../components/roving';
import Avatar from './Avatar';
import {
  applyOutfit,
  OUTFIT_IDS,
  STYLES,
  sameAvatar,
  stylesFor,
  type AvatarConfigDto,
  type CustomizerTab,
  type ResolvedStyles,
  type StylePart,
} from './catalog';

const ICONS: Record<CustomizerTab, string> = {
  outfits: 'M4 3h16v2H4z M3 6h18v2H3z M2 9h20v12H2z M7 12v2h10v-2z',
  hair: 'M3 9h2V5h3V3h4v2h3V3h4v2h2v4h2v6h-3v5h-3v-7h-3v-2H9v2H7v7H4v-5H2V9z',
  body: 'M9 2h6v6H9z M6 9h12v2h3v8h-3v-5h-2v8h-3v-5h-2v5H8v-8H6v5H3v-8h3z',
  top: 'M6 3h4v3h4V3h4v2h3v3h2v5h-5v8H6v-8H1V8h2V5h3z M8 5v2h2v2h4V7h2V5h-2v3h-4V5z',
  pants: 'M5 2h14v7h1v13h-7v-9h-2v9H4V9h1z M6 5v2h12V5z',
  shoes: 'M10 3h9v9h2v3h2v5H1v-6h2v-2h4V9h3z M3 16v2h18v-2z M11 7v2h5V7z M8 11v2h5v-2z',
  beard: 'M3 7h3v5h3v2h6v-2h3V7h3v10h-2v3h-3v2H8v-2H5v-3H3z M9 16v2h6v-2z',
  face: 'M6 2h12v2h3v3h2v10h-2v3h-3v2H6v-2H3v-3H1V7h2V4h3z M6 5v2H4v10h2v2h12v-2h2V7h-2V5z M7 8h3v4H7z M14 8h3v4h-3z M8 15h2v1h4v-1h2v2h-2v1h-4v-1H8z',
};

export function CustomizerIcon({ tab }: { tab: CustomizerTab }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      <path fill="currentColor" fillRule="evenodd" d={ICONS[tab]} />
    </svg>
  );
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
      <h2 id="avatar-outfit-title" className="m-0 text-[1.1rem] leading-tight font-bold text-ink">
        {t('avatar.outfitTitle')}
      </h2>
      <div className="grid grid-cols-4 gap-1.5" role="group" aria-labelledby="avatar-outfit-title">
        {OUTFIT_IDS.map((id) => {
          const preview = applyOutfit(config, id);
          const selected = sameAvatar(config, preview);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(preview)}
              className="lu-style-card grid min-w-0 cursor-pointer content-start gap-1 rounded-[10px] border-2 border-line bg-surface p-1 text-center text-[0.73rem] leading-snug font-bold wrap-anywhere text-ink shadow-px-sm aria-pressed:border-primary"
            >
              <span
                className="lu-style-thumb relative grid h-[4.75rem] place-items-center rounded-[5px] wide:h-28"
                aria-hidden="true"
              >
                <Avatar config={preview} crop="full" className="h-full w-full" />
                {selected && <SelectedMark />}
              </span>
              {t(`avatar.outfit.${id}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedMark() {
  return (
    <span className="absolute inset-e-0.5 inset-bs-0.5 grid size-4 place-items-center rounded-sm bg-accent text-accent-contrast">
      <IonIcon icon={checkmark} className="text-[0.8rem]" />
    </span>
  );
}

interface StylePickerProps<K extends StylePart> {
  part: K;
  config: AvatarConfigDto;
  onChange: (id: ResolvedStyles[K]) => void;
}

export function StylePicker<K extends StylePart>({ part, config, onChange }: StylePickerProps<K>) {
  const { t, i18n } = useTranslation();
  const options: readonly ResolvedStyles[K][] = STYLES[part];
  const styles = stylesFor(config.styles);
  const labelId = `style-label-${part}`;
  const labelKey: `avatar.styleLabel.${StylePart}` = `avatar.styleLabel.${part}`;

  return (
    <div className="grid gap-2">
      <h2 id={labelId} className="m-0 text-[1.1rem] leading-tight font-bold text-ink">
        {t(labelKey)}
      </h2>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className={`grid gap-2 ${part === 'beard' ? 'grid-cols-3' : part === 'hair' ? 'grid-cols-3 wide:grid-cols-5' : 'grid-cols-2 wide:grid-cols-4'}`}
      >
        {options.map((id, i) => {
          const selected = styles[part] === id;
          const optionKey: `avatar.style.${ResolvedStyles[StylePart]}` = `avatar.style.${id}`;
          const preview = { ...config, styles: { ...styles, body: 'balanced' as const, [part]: id } };
          if (part === 'body') preview.styles.top = 'tank';
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              className="lu-style-card grid min-w-0 cursor-pointer content-start gap-1 rounded-[10px] border-2 border-line bg-surface p-1 text-center text-[0.78rem] leading-snug font-bold wrap-anywhere text-ink shadow-px-sm aria-checked:border-primary"
              onClick={() => onChange(id)}
              onKeyDown={(e) => {
                const to = rovingTarget(e, i, options.length, i18n.dir() === 'rtl');
                if (to === null) return;
                onChange(options[to]);
                focusSibling(e, to);
              }}
            >
              <span className="lu-style-thumb relative grid h-12 place-items-center rounded-[5px]" aria-hidden="true">
                <Avatar config={preview} crop={part} className="h-11 w-full" />
                {selected && <SelectedMark />}
              </span>
              {t(optionKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
