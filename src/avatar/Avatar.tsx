import { memo, useMemo } from 'react';

import { isHijab, isTiedHair, paintFor, stylesFor, type AvatarConfigDto, type ResolvedStyles } from './catalog';
import {
  ART_ANKLE,
  ART_NECK,
  ART_WAIST,
  alignedAnkle,
  pickHead,
  pickLegs,
  pickShoes,
  pickTop,
} from './referenceGeometry';
import { ReferenceFace, ReferenceLayer } from './ReferenceArt';
import { SpriteFeet, SpriteSocks } from './SpriteLower';
import { RaisedHood, SpriteTiedHair } from './SpriteDetails';

const VIEW = {
  full: '0 -17 128 231',
  portrait: '4 -18 120 122',
  hair: '4 -18 120 122',
  face: '30 24 69 60',
  body: '0 -17 128 231',
  top: '0 72 128 91',
  pants: '16 116 96 74',
  shoes: '8 172 112 43',
  socks: '15 141 98 71',
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
  const showShoes = full || crop === 'shoes';
  const current = pose(full ? body : 'balanced');
  const sourceHead = raised && !hijab ? 'lilac' : pickHead(styles);
  const sourceLegs = pickLegs(styles, tailored);
  const ankles = ([0, 1] as const).map((side) => alignedAnkle(sourceLegs, side, tailored));
  const viewBox = topOnly && raised ? '0 0 128 162' : VIEW[crop];
  const layerProps = { config, paint, tailored, styles };
  const showHair = !raised || hijab;

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
    >
      <g data-style-layer="body" data-variant={body}>
        {showShoes && shoes === 'barefoot' && (
          <g data-style-layer="shoes" data-variant={shoes} transform={full ? current.shoes : undefined}>
            {full && socks !== 'no-socks' ? (
              <SpriteSocks style={socks} paint={paint} ankles={ankles} />
            ) : (
              <SpriteFeet paint={paint} ankles={full ? ankles : undefined} />
            )}
          </g>
        )}
        {(full || crop === 'pants') && (
          <g transform={full ? current.legs : undefined} data-body-region="lower">
            <g data-style-layer="pants" data-variant={pants}>
              <g data-art-detail={tailored ? 'tailored-pants' : undefined} data-variant={tailored ? pants : undefined}>
                <g
                  data-style-layer={full && (shoes !== 'barefoot' || socks === 'no-socks') ? 'socks' : undefined}
                  data-variant={full && (shoes !== 'barefoot' || socks === 'no-socks') ? socks : undefined}
                >
                  <ReferenceLayer source={sourceLegs} region="legs" withSocks={full} {...layerProps} />
                </g>
              </g>
            </g>
          </g>
        )}
        {showShoes && shoes !== 'barefoot' && (
          <g data-style-layer="shoes" data-variant={shoes} transform={full ? current.shoes : undefined}>
            {full ? (
              ([0, 1] as const).map((side) => (
                <ReferenceLayer
                  key={side}
                  source={pickShoes(styles, tailored)}
                  region="shoes"
                  {...layerProps}
                  shoe={{ side, x: ankles[side] }}
                />
              ))
            ) : (
              <ReferenceLayer source={pickShoes(styles, tailored)} region="shoes" {...layerProps} />
            )}
          </g>
        )}
        {crop === 'socks' && <SpriteSocks style={socks} paint={paint} />}
        {!hijab && !raised && showHead && showTop && (
          <g transform={current.head}>
            <path d="M56 69h16v10l5 5-13 5-13-5 5-5z" fill={paint.skin} stroke={paint.outline} strokeWidth="2" />
            <path d="M57 72h14v7l-14-2z" fill={paint.skinShade} />
          </g>
        )}
        {showTop && (
          <g transform={current.top} data-body-region="upper">
            <g data-style-layer="top" data-variant={top} data-fit={tailored ? 'tailored' : undefined}>
              <g data-art-detail={folded ? 'folded-hood' : undefined}>
                <g data-art-detail={folded ? 'stitched-hoodie' : top === 'sleeveless-hoodie' ? top : undefined}>
                  <ReferenceLayer source={pickTop(styles, tailored)} region="top" {...layerProps} />
                </g>
              </g>
            </g>
          </g>
        )}
        {showHead && (
          <g transform={current.head} data-body-region="head">
            {raised && <RaisedHood paint={paint} />}
            {showHair &&
              ((sourceHead === 'sideHead' && (isTiedHair(hair) || hair === 'top-knot')) ||
                hair === 'braids' ||
                hair === 'locs') && <SpriteTiedHair style={hair} paint={paint} />}
            <g
              data-art-detail={!raised && isTiedHair(hair) ? 'back-hair' : undefined}
              data-style-layer={showHair ? 'hair' : undefined}
              data-variant={showHair ? hair : undefined}
            >
              <ReferenceLayer
                source={sourceHead}
                region="head"
                {...layerProps}
                hood={raised && !hijab ? 'raised' : undefined}
              />
            </g>
            <ReferenceFace source={sourceHead} styles={styles} paint={paint} tailored={tailored} />
          </g>
        )}
        {topOnly && raised && (
          <>
            <RaisedHood paint={paint} />
            <ReferenceLayer source="lilac" region="head" {...layerProps} hood="raised" />
          </>
        )}
      </g>
    </svg>
  );
});
