import type { AvatarPaint, HijabStyle, ResolvedStyles, WOMEN_HAIR } from './catalog';
import { Mirrored } from './ClothingDetails';

type HairStyle = (typeof WOMEN_HAIR)[number];

// Each swept fringe meets the shared temples. Hair behind the head is drawn
// below the face, so the ponytails and buns never cover eyes or clothing.
const SWEPT_FRINGE = {
  outline:
    'M1176 235v-35h12v-39h16v-24h24v-20h32v-14h38V92h81v14h31v15h29v22h19v32h13v89h-11v41h-19v-38h-14v-28h-16v-20h-17v-26h-16v-29h-21v26h-14v15h-21v16h-29v14h-33v12h-40v14h-32v29h-17v-25h-19v-31z',
  fill: 'M1194 235v-26h12v-40h16v-24h24v-17h32v-12h33v-10h58v16h34v14h27v19h17v29h10v74h-10v-24h-18v-21h-18v-27h-16v-30h-21v-11h-17v20h-14v22h-19v15h-27v16h-36v15h-39v12h-31v-10z',
  light:
    'M1206 216h18v-34h17v-20h22v-17h31v-14h40v10h-27v12h-28v18h-22v18h-17v24h-17v10h-17z M1370 127h17v11h24v19h19v23h12v31h-8v-21h-13v-19h-19v-18h-21v-12h-11z',
  shade:
    'M1194 235h36v-12h30v-13h37v-17h29v-15h18v-18h13v9h-14v18h-19v15h-27v16h-36v15h-39v12h-28z M1401 167h9v22h17v22h17v26h11v21h-8v-24h-18v-21h-18v-27h-10z',
};

const PONYTAILS: Record<HairStyle, readonly [outline: string, fill: string, light: string, shade: string]> = {
  'high-ponytail': [
    'M1310 117V79h14V52h20V35h26V21h71v15h23v16h16v22h16v31h13v61h-10v46h13v18h16v46h-13v27h-15v23h-17v29h-43v-37h13v-36h11v-48h-13v-24h-16v-33h-12v-53h-18v-19h-31v12h-64z',
    'M1328 110V86h13V61h19V47h24V35h44v15h23v14h16v24h15v27h12v50h-11v52h14v18h15v35h-13v25h-16v24h-12v20h-15v-19h13v-35h12v-53h-12v-25h-17v-31h-12v-51h-18v-17h-23V97h-23v13h-48z',
    'M1344 84h13V65h21V50h27V42h22v12h22v16h14v25h14v30h-8V104h-16V82h-16V66h-18V57h-19v8h-19v13h-18v15h-19z',
    'M1440 109h17v18h12v47h12v43h14v18h16v29h-13v26h-14v24h-13v-29h12v-53h-12v-25h-17v-31h-14z',
  ],
  'braided-ponytail': [
    'M1324 124V83h14V60h21V43h60v14h24v22h20v36h20v43h18v50h16v49h-8v47h-12v44h-13v37h-16v22h-28v-22h-12v-46h11v-51h9v-44h-10v-44h-13v-37h-14v-31h-24v-8z',
    'M1340 119V92h14V71h16V57h37v13h24v22h16v35h22v42h17v49h14v37h-7v46h-12v44h-12v34h-11v13h-9v-18h-6v-34h10v-49h10v-50h-11v-45h-12v-37h-14v-34h-20v-14h-46z',
    'M1380 67h23v12h16v12h-22V80h-17z M1438 123h19v10h12v12h-18v-11h-13z M1453 171h20v10h13v12h-19v-12h-14z M1469 220h17v9h11v13h-17v-10h-11z M1476 270h17v11h-12v13h-17v-11h12z M1462 320h17v11h-12v12h-15v-11h10z M1450 365h16v10h-7v11h-12v-12h3z',
    'M1445 139h22v10h-15v13h-7z M1461 191h23v10h-15v12h-8z M1475 243h23v11h-13v13h-10z M1466 295h17v12h-13v12h-8z M1452 344h17v10h-14v13h-7z',
  ],
  'low-bun': [
    'M1420 222h39v11h32v17h22v22h17v57h-14v22h-22v17h-56v-15h-22v-22h-15v-61h13z',
    'M1430 237h25v10h30v16h19v20h10v37h-13v20h-17v13h-42v-12h-17v-22h-10v-38h12z',
    'M1461 253h25v13h17v20h-11v-14h-13v-10h-18z M1497 301h9v16h-13v17h-20v-9h15v-12h9z',
    'M1422 293h17v29h17v13h24v-8h16v-12h12v14h-11v14h-13v10h-42v-12h-17v-22h-10v-26z',
  ],
  puff: [
    'M1271 106V76h14V54h20V38h28V21h49v9h22v16h23v23h16v32h-14v24h-28v14h-77v-12h-36v-21z',
    'M1287 105V81h14V61h19V50h23V36h33v11h22v14h22v16h10v23h-15v14h-22v11h-57v-11h-34v-9z',
    'M1308 74h16V60h22V46h24v9h19v10h-25V54h-16v15h-20v16h-20z M1388 77h20v11h15v12h-15V89h-20z',
    'M1291 96h19v8h24v-8h20v-7h27v12h21v-8h26v9h-14v12h-22v11h-56v-11h-34v-9h-11z',
  ],
  'double-braids': [
    'M1188 168h37v58h-16v54h-14v67h-12v69h-14v22h-27v-22h-12v-69h12v-67h17v-55h15z M1476 168h-37v58h16v54h14v67h12v69h14v22h27v-22h12v-69h-12v-67h-17v-55h-15z',
    'M1198 189h12v30h-16v58h-14v66h-12v70h-18v-61h8v-66h17v-55h12z M1466 189h-12v30h16v58h14v66h12v70h18v-61h-8v-66h-17v-55h-12z',
    'M1178 257h17v8h-17z M1164 303h16v8h-16z M1151 350h18v8h-18z M1150 394h18v8h-18z M1469 257h17v8h-17z M1484 303h16v8h-16z M1495 350h18v8h-18z M1496 394h18v8h-18z',
    'M1148 409h22v9h-22z M1494 409h22v9h-22z',
  ],
  'high-bun': [
    'M1250 119V74h14V41h24V22h29V10h45v13h26v18h19v28h14v49h-30v16h-115v-15z',
    'M1267 104V79h13V50h22V35h23V24h30v11h25v16h16v25h11v29h-25v13h-98v-14z',
    'M1289 73V55h18V42h25V32h23v9h-18v14h-24v16h-12v12h-12z',
    'M1276 94h25v-8h26v9h44v-9h25v-9h11v28h-25v13h-98v-14h-8z',
  ],
};

export function TiedHair({ style, paint: p, back = false }: { style: HairStyle; paint: AvatarPaint; back?: boolean }) {
  if (back) {
    const [outline, fill, light, shade] = PONYTAILS[style];
    return (
      <g aria-hidden="true">
        <path fill={p.outline} d={outline} />
        <path fill={p.hair} d={fill} />
        <path fill={p.hairLight} d={light} />
        <path fill={p.hairShade} d={shade} />
      </g>
    );
  }
  return (
    <g data-style-layer="hair" data-variant={style}>
      <path fill={p.outline} d={SWEPT_FRINGE.outline} />
      <path fill={p.hair} d={SWEPT_FRINGE.fill} />
      <path fill={p.hairLight} d={SWEPT_FRINGE.light} />
      <path fill={p.hairShade} d={SWEPT_FRINGE.shade} />
    </g>
  );
}

export const HIJAB_FACE_OPENING =
  'M1300 176h62v12h27v17h20v27h14v45h8v45h-9v25h-14v17h-19v17h-25v13h-66v-12h-27v-16h-19v-18h-15v-26h-9v-46h9v-44h15v-26h20v-18h28z';

// All three fits share a close face opening. The lower edges have different
// lengths and folds, so the drape reads in both the portrait and full crop.
const HIJAB_CROWN =
  'M1192 377v-22h-13v-46h-7v-61h10v-53h12v-39h15v-29h22v-23h27V88h38V73h70v15h39v16h28v23h22v29h15v39h12v53h10v61h-7v46h-13v22';
const HIJAB_FABRIC =
  'M1204 381v-31h-12v-44h-7v-53h10v-52h12v-39h15v-29h22v-19h27V99h31V86h58v13h36v15h26v19h22v29h15v39h12v52h10v53h-7v44h-12v31';
const FACE_SEAM =
  'M1293 166h76v12h26v17h23v28h15v44h9v62h-9v26h-15v18h-22v18h-26v14h-80v-13h-26v-16h-23v-19h-15v-28h-9v-62h9v-45h16v-27h23v-17h28z';

const HIJAB_DRAPE = {
  'sport-hijab': {
    outer: 'h-15v30h-16v29h-22v24h-32v16h-41v9h-69v-9h-41v-16h-32v-24h-23v-29h-16v-30h-14z',
    fabric: 'h-14v30h-16v28h-23v23h-29v14h-38v8h-56v-8h-38v-14h-29v-23h-23v-28h-16v-30h-13z',
    folds:
      'M1254 413h15v12h18v9h22v7h40v8h-44v-7h-23v-9h-20v-12h-8z M1398 413h10v11h-14v12h-18v8h-18v-7h15v-9h14v-9h11z',
  },
  'wrap-hijab': {
    outer: 'h-15v24h-13v18h-13v18h27v17h-18v15h-30v11h-36v8h-114v-8h-29v-14h-21v-22h-15v-22h-15v-23h-15z',
    fabric: 'h-14v24h-13v20h-17v24h27v7h-15v12h-28v9h-34v8h-102v-8h-25v-14h-20v-21h-15v-22h-15v-23h-7z',
    folds:
      'M1223 379h10v14h13v13h16v11h19v11h24v10h26v10h31v9h28v7h-37v-7h-29v-9h-26v-10h-23v-10h-20v-11h-16v-13h-13v-15h-3z M1400 456h21v-7h25v-8h9v9h-10v7h-22v7h-23z',
  },
  'longline-hijab': {
    outer: 'h-15v22h12v25h19v24h25v22h-20v14h-37v12h-46v9h-121v-9h-46v-12h-37v-14h-20v-22h25v-24h19v-25h13v-22h-15z',
    fabric: 'h-13v20h12v27h19v24h23v6h-17v13h-34v11h-45v9h-109v-9h-45v-11h-34v-13h-17v-6h23v-24h19v-27h13v-20h-13z',
    folds:
      'M1223 452h17v12h26v9h20v8h-23v-8h-27v-10h-13z M1270 412h17v10h20v10h49v-8h18v-10h16v7h-12v10h-18v9h-56v-9h-21v-11h-13z M1391 473h28v-9h20v-12h13v9h-10v11h-20v9h-31z',
  },
} satisfies Record<HijabStyle, { outer: string; fabric: string; folds: string }>;

export function SportHijab({ style, paint: p }: { style: HijabStyle; paint: AvatarPaint }) {
  const drape = HIJAB_DRAPE[style];
  return (
    <g data-style-layer="hair" data-variant={style}>
      <path fill={p.outline} fillRule="evenodd" d={`${HIJAB_CROWN}${drape.outer} ${HIJAB_FACE_OPENING}`} />
      <path
        fill={p.hijab}
        data-paint="hijab-fabric"
        fillRule="evenodd"
        d={`${HIJAB_FABRIC}${drape.fabric} ${FACE_SEAM}`}
      />
      <path fill={p.hijabLight} d="M1215 192v-25h16v-28h22v-16h25v-15h33V96h42v7h-35v13h-32v15h-26v17h-21v27h-16v17z" />
      <path
        fill={p.hijabShade}
        d="M1200 274h8v51h8v27h12v20h17v18h22v13h26v12h74v-12h27v-13h22v-18h17v-20h12v-27h8v-51h8v53h-8v29h-13v22h-17v19h-24v15h-27v11h-84v-11h-27v-15h-24v-19h-17v-22h-12v-29h-8z"
      />
      <path fill={p.hijabLight} d={drape.folds} />
    </g>
  );
}

export function FittedTank({ style, paint: p }: { style: 'longline-tank' | 'racerback-bra'; paint: AvatarPaint }) {
  const crop = style === 'racerback-bra';
  return (
    <g data-style-layer="top" data-variant={style}>
      <path fill={p.outline} d="M1286 478h89v50h9v55h-106v-55h8z" />
      <path fill={p.skin} d="M1295 491h71v47h8v44h-87v-44h8z" />
      <path fill={p.skinShade} d="M1295 539h71v8h-71z" />
      <path
        fill={p.outline}
        d={
          crop
            ? 'M1254 415h42v27h70v-27h42v33h11v58h-12v20h-15v17h-121v-17h-15v-20h-12v-58h10z'
            : 'M1254 415h42v27h70v-27h42v33h11v58h-12v17h-14v31h13v19h13v23h-176v-23h13v-19h13v-31h-13v-17h-12v-58h10z'
        }
      />
      <path
        fill={p.tank}
        d={
          crop
            ? 'M1267 429h15v24h98v-24h15v32h12v40h-11v13h-12v16h-104v-16h-12v-13h-11v-40h10z'
            : 'M1267 429h15v24h98v-24h15v32h12v40h-11v13h-13v45h12v21h11v4h-148v-4h11v-21h12v-45h-13v-13h-11v-40h10z'
        }
      />
      <path
        fill={p.topLight}
        d="M1268 433h6v24h-8v39h9v12h-7v-9h-6v-45h6z M1390 433h6v21h6v45h-6v9h-7v-12h9v-39h-8z M1287 454h89v5h-89z"
      />
      {crop ? (
        <>
          <path fill={p.topShade} d="M1279 510h104v20h-104z" />
          <path fill={p.topLight} d="M1284 514h94v5h-94z M1284 523h94v3h-94z" />
        </>
      ) : (
        <Mirrored>
          <path fill={p.topLight} d="M1278 510h8v42h-6v17h-7v14h-6v-18h7v-16h4z M1260 579h72v5h-72z" />
          <path fill={p.topShade} d="M1295 533h37v7h-28v6h-9z" />
        </Mirrored>
      )}
    </g>
  );
}

export function StudioLeggings({
  style,
  paint: p,
}: {
  style: Extract<ResolvedStyles['pants'], 'high-rise-leggings' | 'capris'>;
  paint: AvatarPaint;
}) {
  const capris = style === 'capris';
  return (
    <g data-style-layer="pants" data-variant={style}>
      <path
        fill={p.outline}
        d={
          capris
            ? 'M1247 553h170v38h16v27h11v43h-8v43h-11v36h-63v-10h-12v-35h-10v-38h-16v38h-10v35h-12v10h-63v-36h-11v-43h-8v-43h11v-27h16z'
            : 'M1247 553h170v38h16v27h11v43h-8v43h-9v41h13v49h-9v8h-67v-8h-9v-43h-10v-43h-9v-51h-8v51h-9v43h-10v43h-9v8h-67v-8h-9v-49h13v-41h-9v-43h-8v-43h11v-27h16z'
        }
      />
      <path
        fill={p.shorts}
        d={
          capris
            ? 'M1260 567h144v32h16v28h11v26h-8v43h-11v30h-40v-9h-11v-31h-10v-39h-38v39h-10v31h-11v9h-40v-30h-11v-43h-8v-26h11v-28h16z'
            : 'M1260 567h144v32h16v28h11v26h-8v45h-9v55h13v36h-52v-6h-7v-39h-10v-43h-9v-54h-34v54h-9v43h-10v39h-7v6h-52v-36h13v-55h-9v-45h-8v-26h11v-28h16z'
        }
      />
      <Mirrored>
        <path fill={p.pantsLight} d="M1246 606h7v25h-7v24h8v40h7v29h-7v-25h-7v-41h-8v-31h7z" />
        <path fill={p.pantsShade} d="M1253 633h24v9h-17v13h-7z M1279 694h14v17h-12v11h-9v-12h7z" />
        {capris ? (
          <path fill={p.pantsLight} d="M1253 720h39v5h-39z" />
        ) : (
          <path fill={p.pantsLight} d="M1254 734h7v20h-12v25h-7v-29h12z M1241 783h46v4h-46z" />
        )}
      </Mirrored>
      <path fill={p.pantsShade} d="M1260 567h144v18h-144z" />
      <path fill={p.pantsLight} d="M1261 584h142v5h-142z" />
    </g>
  );
}
