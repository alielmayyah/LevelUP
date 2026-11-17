import { memo, useId } from 'react';

import { AVATAR_PARTS, presetFor, type AvatarConfigDto, type Preset } from './catalog';
import { HD_LAYERS, HD_VIEW, hdLayerUrl, type AvatarCrop } from './hdFigure';

export type { AvatarCrop };

interface Props {
  config: AvatarConfigDto;
  crop?: AvatarCrop;
  label?: string;
  className?: string;
  testId?: string;
}

/**
 * Recolors one part: turns the hue, then scales saturation and lightness. The
 * painted shading survives, and near-white details (laces, drawstrings, the
 * chest logo) stay white because hue turns barely move unsaturated pixels.
 */
const Tint: React.FC<{ id: string; preset: Preset }> = ({ id, preset }) => (
  <filter id={id} colorInterpolationFilters="sRGB">
    <feColorMatrix type="hueRotate" values={String(preset.hue)} />
    <feColorMatrix type="saturate" values={String(preset.sat)} />
    <feComponentTransfer>
      <feFuncR type="linear" slope={preset.light} />
      <feFuncG type="linear" slope={preset.light} />
      <feFuncB type="linear" slope={preset.light} />
    </feComponentTransfer>
  </filter>
);

/** True when a preset leaves the art as painted, so no filter is needed. */
const asPainted = (p: Preset) => p.hue === 0 && p.sat === 1 && p.light === 1;

/** The member's character: the HD figure, with each part in its saved color. */
export default memo(function Avatar({ config, crop = 'portrait', label, className, testId }: Props) {
  const uid = useId().replace(/:/g, '');
  const presets = Object.fromEntries(AVATAR_PARTS.map((p) => [p, presetFor(p, config.colors[p])])) as Record<
    (typeof AVATAR_PARTS)[number],
    Preset
  >;
  const filterId = (part: string) => `lu-av-${uid}-${part}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={HD_VIEW[crop]}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-testid={testId}
      data-crop={crop}
      data-figure="hd-casual"
    >
      <defs>
        {AVATAR_PARTS.filter((p) => !asPainted(presets[p])).map((p) => (
          <Tint key={p} id={filterId(p)} preset={presets[p]} />
        ))}
      </defs>
      {HD_LAYERS.map((layer) => (
        <image
          key={layer.id}
          href={hdLayerUrl(layer.id)}
          x={layer.x}
          y={layer.y}
          width={layer.width}
          height={layer.height}
          data-layer={layer.id}
          data-color={layer.part ? config.colors[layer.part] : undefined}
          filter={layer.part && !asPainted(presets[layer.part]) ? `url(#${filterId(layer.part)})` : undefined}
        />
      ))}
    </svg>
  );
});
