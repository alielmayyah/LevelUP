import { memo, useMemo } from 'react';

import {
  CHARACTER_PRESETS,
  characterPresetsFor,
  isHijab,
  isTiedHair,
  paintFor,
  stylesFor,
  type AvatarConfigDto,
  type CharacterPresetId,
  type ResolvedStyles,
} from './catalog';
import {
  ART_ANKLE,
  ART_NECK,
  ART_WAIST,
  alignedAnkle,
  pickHead,
  pickLegs,
  pickShoes,
  pickTop,
  type SpriteSource,
} from './referenceGeometry';
import { ReferenceFace, ReferenceLayer } from './ReferenceArt';
import { SpriteFeet, SpriteSocks } from './SpriteLower';

const VIEW = {
  full: '0 -17 128 231',
  portrait: '10 -10 108 111',
  hair: '8 -13 112 110',
  face: '30 24 69 60',
  body: '0 -17 128 231',
  top: '9 74 110 87',
  pants: '16 116 96 74',
  shoes: '8 172 112 43',
  socks: '22 152 84 58',
  beard: '30 39 70 47',
} as const;
export type AvatarCrop = keyof typeof VIEW;

// The reference poses already have their own proportions. These adjustments
// work around the original joints and never stretch the head or footwear.
const BUILDS = {
  balanced: [1, 1, 1, 1],
  lean: [0.94, 0.94, 1, 1.015],
  broad: [1.12, 1.02, 1.01, 1],
  compact: [0.98, 0.99, 0.94, 0.91],
  tall: [1.01, 1, 1.065, 1.1],
  stocky: [1.07, 1.11, 0.97, 0.94],
  athletic: [1.08, 0.98, 1.015, 1.045],
  relaxed: [1.02, 1.06, 0.99, 0.99],
  'long-limbed': [0.96, 0.95, 1, 1.13],
  'power-build': [1.13, 1.09, 1.03, 0.975],
} as const satisfies Record<ResolvedStyles['body'], readonly [number, number, number, number]>;

const PRESET_SOURCES = {
  'silver-sprinter': 'silver',
  'cloud-hoodie': 'cloud',
  'midnight-lift': 'cap',
  'violet-hoodie': 'violet',
  'teal-studio': 'teal',
  'lilac-hijab': 'lilac',
  'amber-hijab': 'amber',
  'pearl-hijab': 'paleWrap',
} as const satisfies Record<CharacterPresetId, SpriteSource>;

function originalPose(rig: AvatarConfigDto['rig'], styles: ResolvedStyles): SpriteSource | null {
  const matched = characterPresetsFor(rig).find((id) => {
    const reference = CHARACTER_PRESETS[id].styles;
    return (
      reference.hair === styles.hair &&
      reference.top === styles.top &&
      reference.pants === styles.pants &&
      reference.shoes === styles.shoes &&
      ('beard' in reference ? reference.beard : 'clean-shaven') === styles.beard
    );
  });
  return matched ? PRESET_SOURCES[matched] : null;
}

function pose(style: ResolvedStyles['body']) {
  const [shoulders, hips, torso, legs] = BUILDS[style];
  // The waist follows the legs and the head follows the neck.
  const waistShift = (ART_WAIST - ART_ANKLE) * (legs - 1);
  const headShift = waistShift + (ART_NECK - ART_WAIST) * (torso - 1);
  return {
    head: `translate(0 ${headShift})`,
    top: `translate(64 ${ART_WAIST + waistShift}) scale(${shoulders} ${torso}) translate(-64 -${ART_WAIST})`,
    legs: `translate(64 ${ART_ANKLE}) scale(${hips} ${legs}) translate(-64 -${ART_ANKLE})`,
    shoes: `translate(64 0) scale(${hips} 1) translate(-64 0)`,
  };
}

interface Props {
  config: AvatarConfigDto;
  crop?: AvatarCrop;
  label?: string;
  className?: string;
  testId?: string;
}

export default memo(function Avatar({ config, crop = 'portrait', label, className, testId }: Props) {
  const paint = useMemo(() => paintFor(config), [config]);
  const styles = stylesFor(config.styles);
  const tailored = config.rig === 'women';
  const { body, top, hair, pants, shoes, socks } = styles;
  const hijab = isHijab(hair);
  const raised = top === 'hood-up';
  const folded = top === 'hoodie' || top === 'zip-hoodie';
  const full = crop === 'full' || crop === 'body';
  const topOnly = crop === 'top';
  const showTop = full || crop === 'portrait' || topOnly;
  const showHead = full || crop === 'portrait' || crop === 'hair' || crop === 'face' || crop === 'beard';
  const current = pose(full ? body : 'balanced');
  const exact = originalPose(config.rig, styles);
  // Preserve the original proportions and relative placement of the extracted pose.
  const complete = !!exact && (!full || body === 'balanced');
  const sourceHead = exact ?? (raised && !hijab ? 'lilac' : pickHead(styles));
  const sourceTop = exact ?? pickTop(styles, tailored);
  const sourceLegs = exact ?? pickLegs(styles, tailored);
  const sourceShoes = exact ?? (shoes === 'trainers' ? sourceLegs : pickShoes(styles, tailored));
  const viewBox = topOnly && raised ? '9 0 110 161' : VIEW[crop];
  const layerProps = { config, paint, complete, tailored };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-testid={testId}
      data-crop={crop}
      data-rig={config.rig}
      data-art-style="sprite-32bit"
      data-reference-source={exact ?? undefined}
    >
      <g data-style-layer="body" data-variant={body}>
        {(full || crop === 'pants') && (
          <g transform={full ? current.legs : undefined} data-body-region="lower">
            <g data-style-layer="pants" data-variant={pants}>
              <g data-art-detail={tailored ? 'tailored-pants' : undefined} data-variant={tailored ? pants : undefined}>
                <g
                  data-style-layer={full && shoes !== 'barefoot' ? 'socks' : undefined}
                  data-variant={full && shoes !== 'barefoot' ? socks : undefined}
                >
                  <ReferenceLayer source={sourceLegs} region="legs" {...layerProps} />
                </g>
              </g>
            </g>
          </g>
        )}
        {(full || crop === 'shoes') && (
          <g transform={full ? current.shoes : undefined}>
            {shoes === 'barefoot' ? (
              <g data-style-layer="shoes" data-variant={shoes}>
                {full && socks !== 'no-socks' ? (
                  <SpriteSocks style={socks} paint={paint} crop={false} />
                ) : (
                  <SpriteFeet paint={paint} />
                )}
              </g>
            ) : (
              <g data-style-layer="shoes" data-variant={shoes}>
                {full && !complete ? (
                  ([0, 1] as const).map((side) => (
                    <ReferenceLayer
                      key={side}
                      source={sourceShoes}
                      region="shoes"
                      {...layerProps}
                      shoe={{ side, x: alignedAnkle(sourceLegs, side, tailored) }}
                    />
                  ))
                ) : (
                  <ReferenceLayer source={sourceShoes} region="shoes" {...layerProps} />
                )}
              </g>
            )}
          </g>
        )}
        {crop === 'socks' && <SpriteSocks style={socks} paint={paint} crop />}
        {!complete && !hijab && !raised && showHead && showTop && (
          <g transform={current.head}>
            <path d="M58 72h12v8l5 5-11 4-11-4 5-5z" fill={paint.skin} stroke={paint.outline} strokeWidth="2" />
            <path d="M59 74h10v5l-10-2z" fill={paint.skinShade} />
          </g>
        )}
        {showTop && (
          <g transform={current.top} data-body-region="upper">
            <g data-style-layer="top" data-variant={top} data-fit={tailored ? 'tailored' : undefined}>
              <g data-art-detail={folded ? 'folded-hood' : undefined}>
                <g data-art-detail={folded ? 'stitched-hoodie' : top === 'sleeveless-hoodie' ? top : undefined}>
                  <ReferenceLayer source={sourceTop} region="top" {...layerProps} />
                </g>
              </g>
            </g>
          </g>
        )}
        {showHead && (
          <g transform={current.head} data-body-region="head">
            {raised && hijab && (
              <g data-art-detail="raised-hood" transform="translate(-3 -5) scale(1.05)">
                <ReferenceLayer source="paleWrap" region="head" {...layerProps} hood="behind" />
              </g>
            )}
            <g
              data-art-detail={raised && !hijab ? 'raised-hood' : !raised && isTiedHair(hair) ? 'back-hair' : undefined}
              data-style-layer={!raised || hijab ? 'hair' : undefined}
              data-variant={!raised || hijab ? hair : undefined}
            >
              <ReferenceLayer
                source={sourceHead}
                region="head"
                {...layerProps}
                hood={raised && !hijab ? 'raised' : undefined}
              />
            </g>
            <ReferenceFace source={sourceHead} styles={styles} {...layerProps} />
          </g>
        )}
        {topOnly && raised && (
          <g data-art-detail="raised-hood">
            <ReferenceLayer source="paleWrap" region="head" {...layerProps} hood="raised" />
          </g>
        )}
      </g>
    </svg>
  );
});
