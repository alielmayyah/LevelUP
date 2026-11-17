import type { AvatarPaint, ResolvedStyles } from './catalog';
import { ART_ANKLE, sockTop } from './referenceGeometry';

type Socks = ResolvedStyles['socks'];

const DEFAULT_ANKLES = [43, 85] as const;

function FootPair({
  paint: p,
  style,
  ankles,
  start,
}: {
  paint: AvatarPaint;
  style: Socks;
  ankles: readonly number[];
  start: number;
}) {
  const skin = style === 'no-socks';
  const outline = `M-9 ${start}H9V190h3v5h8v4h3v7h-3v3H-7v-4h-3v-13h1Z`;
  return (
    <g shapeRendering="crispEdges">
      {ankles.map((x, side) => (
        <g key={side} transform={`translate(${x} 0) scale(${side ? 1 : -1} 1)`}>
          <path
            d={outline}
            fill={skin ? p.skin : p.socks}
            stroke={p.outline}
            strokeWidth="2"
            data-paint={skin ? undefined : 'sock-fabric'}
          />
          <path d="M-8 195h4v7h24v4h-4H-7v-4h-1Z" fill={skin ? p.skinShade : p.sockShade} />
          <path d="M9 197h9v2H9Z" fill={skin ? p.skinGlow : p.sockTrim} />
          {skin && <path d="M15 200h1v3h-1Zm4 0h1v3h-1Z" fill={p.skinShade} />}
          {!skin && (
            <>
              <path d={`M-8 ${start + 1}H8v2H-8Z`} fill={p.sockShade} />
              {(style === 'striped-socks' || style === 'knee-highs') && (
                <path d={`M-8 ${start + 1}H8v2H-8Zm0 4H8v2H-8Z`} fill={p.sockTrim} />
              )}
              {style === 'grip-socks' && <path d="M3 206h3v1H3Zm6 0h3v1H9Zm6 0h3v1h-3Z" fill={p.sockTrim} />}
              {style === 'compression-socks' && <path d={`M0 ${start + 4}h2V194H0Z`} fill={p.sockTrim} />}
              {style === 'tab-socks' && <path d={`M-8 ${start - 2}h5v4h-5Z`} fill={p.socks} />}
            </>
          )}
        </g>
      ))}
    </g>
  );
}

export function SpriteSocks({
  style,
  paint,
  ankles,
}: {
  style: Socks;
  paint: AvatarPaint;
  ankles?: readonly number[];
}) {
  const start = ankles ? ART_ANKLE - 3 : style === 'no-socks' ? 166 : sockTop(style);
  return (
    <g data-style-layer="socks" data-variant={style}>
      <FootPair paint={paint} style={style} ankles={ankles ?? DEFAULT_ANKLES} start={start} />
    </g>
  );
}

export function SpriteFeet({ paint, ankles = DEFAULT_ANKLES }: { paint: AvatarPaint; ankles?: readonly number[] }) {
  return <FootPair paint={paint} style="no-socks" ankles={ankles} start={ART_ANKLE - 3} />;
}
