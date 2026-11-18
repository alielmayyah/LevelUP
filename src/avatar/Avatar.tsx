import { memo, useId } from 'react';

import type { Sex } from '../api/types';
import {
  DEFAULT_HIJAB_COLOR,
  PORTRAIT_EYES,
  portraitOf,
  presetFor,
  type AvatarConfigDto,
  type Preset,
} from './catalog';
import { GIRL_VIEW, PORTRAIT_VIEW, PORTRAIT_SIZE, portraitLayerUrl } from './portraitArt';

interface Props {
  config: AvatarConfigDto;
  sex?: Sex;
  label?: string;
  className?: string;
  testId?: string;
}

/**
 * Recolors the skin or hair while preserving the original shading.
 */
const Tint: React.FC<{ id: string; preset: Preset; offset?: number }> = ({ id, preset, offset = 0 }) => (
  <filter id={id} colorInterpolationFilters="sRGB">
    <feColorMatrix type="hueRotate" values={String(preset.hue)} />
    <feColorMatrix type="saturate" values={String(preset.sat)} />
    <feComponentTransfer>
      <feFuncR type="linear" slope={preset.light} intercept={offset} />
      <feFuncG type="linear" slope={preset.light} intercept={offset} />
      <feFuncB type="linear" slope={preset.light} intercept={offset} />
    </feComponentTransfer>
  </filter>
);

/** True when a preset leaves the art as painted, so no filter is needed. */
const asPainted = (p: Preset) => p.hue === 0 && p.sat === 1 && p.light === 1;

/** Color the cel fills while preserving dark garment lines and iris detail. */
function LuminanceTint({ id, color, fabric = false }: { id: string; color: string; fabric?: boolean }) {
  const channels = [1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16) / 255);
  if (fabric) {
    const table = (channel: number) =>
      Array.from({ length: 17 }, (_, i) => {
        const luma = i / 16;
        const fill = Math.min(1, Math.max(0, (luma - 0.13) / 0.24));
        const tint = Math.min(1, Math.max(0, channel + (luma - 0.38) * 0.8));
        return (luma * (1 - fill) + tint * fill).toFixed(4);
      }).join(' ');
    return (
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues={table(channels[0])} />
          <feFuncG type="table" tableValues={table(channels[1])} />
          <feFuncB type="table" tableValues={table(channels[2])} />
        </feComponentTransfer>
      </filter>
    );
  }

  const matrix = channels.flatMap((channel) => {
    const gain = 0.57 + channel * 0.62;
    const offset = channel * 0.17 - 0.02;
    return [0.2126 * gain, 0.7152 * gain, 0.0722 * gain, 0, offset];
  });
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={[...matrix, 0, 0, 0, 1, 0].join(' ')} />
    </filter>
  );
}

function Portrait({ config, sex, uid }: { config: AvatarConfigDto; sex: Sex; uid: string }) {
  const { look, outfit, eyes, hijabColor = DEFAULT_HIJAB_COLOR } = portraitOf(config, sex);
  const hijab = look === 'hijab';
  const skinColor = config.colors.skin;
  const hairColor = config.colors.hair;
  const skin = presetFor('skin', skinColor);
  const hair = presetFor('hair', hairColor);
  const skinTint = skinColor === 'deep' ? { ...skin, hue: 0, sat: 0.95, light: 0.56 } : skin;
  const silverHair = hairColor === 'silver';
  const neutralHair = hairColor === 'grey' || silverHair;
  const hairTint = neutralHair ? { ...hair, light: silverHair ? 1.24 : 1.16 } : hair;
  const top = presetFor('top', config.colors.top);
  const filter = (part: string) => `lu-av-${uid}-${part}`;
  const texture = (layer: string, file: string, color?: string) => (
    <image
      href={portraitLayerUrl(file, sex)}
      width={PORTRAIT_SIZE}
      height={PORTRAIT_SIZE}
      data-layer={layer}
      data-color={color}
      filter={color ? `url(#${filter(layer)})` : undefined}
    />
  );
  const garment = texture('outfit', outfit, config.colors.top);

  return (
    <g data-look={look} data-outfit={outfit} data-eyes={eyes} data-skin={skinColor} data-hair={hairColor}>
      <defs>
        {!asPainted(skinTint) && <Tint id={filter('skin')} preset={skinTint} />}
        {!hijab && !asPainted(hairTint) && (
          <Tint id={filter('hair')} preset={hairTint} offset={silverHair ? 0.15 : neutralHair ? 0.06 : 0} />
        )}
        {hijab && <LuminanceTint id={filter('hijab')} color={presetFor('top', hijabColor).swatch} fabric />}
        {eyes !== 'brown' && <LuminanceTint id={filter('eyes')} color={PORTRAIT_EYES[eyes]} />}
        <LuminanceTint id={filter('outfit')} color={top.swatch} fabric />
      </defs>
      {hijab && garment}
      {texture('head', `${look}-head`)}
      {!asPainted(skinTint) && texture('skin', `${look}-skin`, skinColor)}
      {hijab && texture('hijab', `${look}-scarf`, hijabColor)}
      {!hijab && !asPainted(hairTint) && texture('hair', `${look}-hair`, hairColor)}
      {eyes !== 'brown' && texture('eyes', `${look}-eyes`, eyes)}
      {!hijab && garment}
    </g>
  );
}

/** The member's front-facing portrait. */
export default memo(function Avatar({ config, sex = 'MALE', label, className, testId }: Props) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={sex === 'FEMALE' ? GIRL_VIEW : PORTRAIT_VIEW}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-testid={testId}
      data-crop="portrait"
      data-portrait-sex={sex}
      data-figure="hd-portrait"
    >
      <Portrait config={config} sex={sex} uid={uid} />
    </svg>
  );
});
