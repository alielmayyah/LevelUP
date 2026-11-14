import { memo, useMemo } from 'react';

import { paintFor, stylesFor, type AvatarConfigDto } from './catalog';
import { Hands, TopDetails } from './ClothingDetails';
import { AltHair, Beard, Pants, ShoePair, SleeveTop, Socks } from './VariantArt';

/*
 * The standard character, drawn on its art grid. Coordinates are the original
 * artwork's, so both crops are just view boxes over the same paths.
 * Fills are passed per avatar, so two characters on one screen never share colors.
 */

const VIEW = {
  /** Head to sneakers, for the editor. */
  full: '1066 -55 532 960',
  /** Head and shoulders, for the Profile header and lists. */
  portrait: '1108 4 450 450',
  hair: '1108 0 450 430',
  body: '1066 329 532 583',
  top: '1108 360 450 325',
  pants: '1139 566 386 330',
  shoes: '1138 709 194 180',
  socks: '1139 680 386 208',
  beard: '1172 265 318 191',
} as const;

export type AvatarCrop = keyof typeof VIEW;

const BODY_PROPORTIONS = {
  balanced: [1, 1],
  lean: [0.88, 1.045],
  broad: [1.18, 1.015],
  compact: [1.06, 0.86],
  tall: [0.98, 1.125],
  stocky: [1.23, 0.925],
  athletic: [1.12, 1.07],
  relaxed: [1.12, 0.96],
};

interface Props {
  config: AvatarConfigDto;
  crop?: AvatarCrop;
  /** Accessible name. Leave out when the avatar is decorative (a name is already beside it). */
  label?: string;
  className?: string;
  testId?: string;
}

const Avatar: React.FC<Props> = ({ config, crop = 'portrait', label, className, testId }) => {
  const p = useMemo(() => paintFor(config), [config]);
  const styles = stylesFor(config.styles);
  const full = crop === 'full' || crop === 'body' || crop === 'pants';
  const showLegs = full || crop === 'socks';
  const showTorso = crop === 'portrait' || crop === 'full' || crop === 'body' || crop === 'top';
  const showHead = crop === 'portrait' || crop === 'hair' || crop === 'full' || crop === 'beard';
  const { top } = styles;
  const tankCut = top === 'tank' || top === 'sleeveless-hoodie';
  const longSleeves = !tankCut && styles.top !== 'tee' && styles.top !== 'mesh-tee';
  const barefoot = styles.shoes === 'barefoot';
  const [width, height] = BODY_PROPORTIONS[styles.body];
  // Scale around the shoulders, then line up everyone's soles in full crops.
  const shoulder = 416;
  const offset = full ? (877 - shoulder) * (1 - height) : 0;
  const bodyTransform = `translate(1332 ${shoulder + offset}) scale(${width} ${height}) translate(-1332 ${-shoulder})`;
  const smilePath = 'M1298 355Q1311 367 1329 367Q1347 367 1359 355';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEW[crop]}
      className={className}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-testid={testId}
      data-crop={crop}
    >
      {crop === 'shoes' && <ShoePair style={styles.shoes} paint={p} />}
      {(showTorso || showLegs) && (
        <g transform={bodyTransform} data-style-layer="body" data-variant={styles.body}>
          {showLegs && (
            <>
              {/* Legs */}
              <path
                fill={p.outline}
                d="M1219 685H1324V708H1316V760H1303V796H1205V777H1207V734H1219Z M1340 685H1445V734H1458V777H1460V796H1361V760H1348V708H1340Z"
              />
              <path
                fill={p.skin}
                d="M1237 704H1298V753H1285V779H1224V739H1237Z M1365 704H1427V739H1440V779H1378V753H1365Z"
              />
              {barefoot && <ShoePair style={styles.shoes} paint={p} />}
              <Socks style={styles.socks} shoes={styles.shoes} paint={p} />
              {full && <Pants style={styles.pants} paint={p} />}
              {!barefoot && <ShoePair style={styles.shoes} paint={p} />}
            </>
          )}
          {/* Arms */}
          {showTorso && !longSleeves && (
            <>
              <path
                fill={p.outline}
                d="M1218 415H1273V492H1260V533H1248V554H1236V570H1225V586H1237V654H1209V670H1165V655H1149V640H1135V585H1149V526H1165V488H1181V451H1200V433H1218Z M1389 415H1446V433H1464V451H1482V488H1498V526H1514V585H1528V640H1514V655H1499V670H1455V654H1427V586H1439V570H1427V554H1415V533H1403V492H1389Z"
              />
              <path
                fill={p.skin}
                d="M1224 434H1254V498H1238V533H1221V562H1207V596H1222V639H1204V653H1167V639H1153V587H1167V529H1185V495H1202V453H1219V442H1224Z M1407 434H1437V442H1444V453H1461V495H1479V529H1496V587H1510V639H1496V653H1459V639H1440V596H1454V562H1441V533H1424V498H1407Z"
              />
            </>
          )}
          {showTorso && <Hands paint={p} sleeves={longSleeves} />}
          {showTorso &&
            (tankCut ? (
              <g data-style-layer="top" data-variant={top}>
                {top === 'sleeveless-hoodie' && (
                  <>
                    <path fill={p.outline} d="M1243 438v-23h14v-14h17v-13h31v-6h54v6h31v13h17v14h14v23z" />
                    <path fill={p.topShade} d="M1257 433v-13h15v-13h15v-11h90v11h15v13h15v13z" />
                    <path
                      fill={p.topLight}
                      d="M1262 420h14v-13h12v-8h14v5h-11v10h-12v13h-17z M1402 420h-14v-13h-12v-8h-14v5h11v10h12v13h17z"
                    />
                  </>
                )}
                <path
                  fill={p.outline}
                  d="M1254 413H1407V500H1424V533H1413V585H1395V601H1268V586H1248V533H1238V500H1254Z"
                />
                <path
                  fill={p.tank}
                  d="M1271 429H1288V443H1298V455H1309V466H1352V454H1363V443H1373V429H1390V505H1403V533H1394V578H1387V585H1275V578H1268V533H1259V505H1271Z"
                />
                <TopDetails style={top} paint={p} />
              </g>
            ) : (
              <SleeveTop style={top} paint={p} />
            ))}
        </g>
      )}
      {showHead && (
        <g transform={offset ? `translate(0 ${offset})` : undefined}>
          {/* Neck and head */}
          <path fill={p.outline} d="M1280 392H1380V432H1373V444H1362V456H1298V444H1288V431H1280Z" />
          <path fill={p.skin} d="M1297 409H1363V443H1351V453H1309V443H1297Z" />
          <path fill={p.skinShade} d="M1297 409H1363V435H1297Z" />
          <path
            fill={p.outline}
            d="M1190 240H1219V221H1241V206H1417V222H1445V244H1474V278H1487V294H1500V337H1484V358H1470V374H1435V389H1417V405H1398V419H1261V405H1243V389H1220V374H1192V358H1176V340H1162V294H1174V276H1190Z"
          />
          <path
            fill={p.skin}
            d="M1219 258H1236V242H1255V229H1391V243H1411V257H1436V293H1451V295H1481V338H1467V351H1434V375H1416V389H1386V404H1274V389H1244V375H1225V351H1194V339H1180V295H1205V292H1219Z"
          />
          <g data-feature="eyes">
            <path fill={p.eyes} d="M1262 282H1288V332H1262Z M1368 282H1394V332H1368Z" />
            {p.eyeAccent !== p.eyes && (
              <path
                fill={p.eyeAccent}
                shapeRendering="geometricPrecision"
                d="M1264 285H1272V300H1264Z M1370 285H1378V300H1370Z"
              />
            )}
          </g>
          <Beard style={styles.beard} paint={p} />
          <path
            data-feature="smile"
            fill="none"
            stroke={p.mouth}
            strokeWidth={9}
            strokeLinecap="round"
            shapeRendering="auto"
            d={smilePath}
          />
          {styles.hair === 'curls' ? (
            <g data-style-layer="hair" data-variant="curls">
              <path
                fill={p.outline}
                d="M1122 116H1150V81H1175V55H1225V34H1265V12H1323V34H1334V55H1342V12H1400V34H1418V55H1485V91H1519V120H1543V182H1524V230H1499V270H1478V295H1451V331H1436V264H1415V246H1391V228H1372V214H1282V224H1254V243H1236V264H1219V331H1205V295H1181V277H1162V229H1143V182H1122Z"
              />
              <path
                fill={p.hair}
                d="M1148 128H1180V81H1220V100H1247V55H1278V34H1310V55H1333V77H1355V34H1388V55H1397V96H1422V77H1463V113H1495V134H1519V167H1497V188H1502V210H1483V230H1468V253H1450V242H1437V226H1414V211H1389V196H1362V210H1337V203H1305V212H1282V202H1251V218H1228V238H1211V253H1183V231H1170V198H1148Z"
              />
              <path
                fill={p.hairLight}
                d="M1148 128H1180V81H1220V100H1247V55H1278V34H1310V55H1333V77H1355V34H1388V55H1397V96H1422V77H1463V113H1495V134H1519V154H1483V140H1450V110H1425V128H1396V95H1367V85H1345V126H1315V85H1291V117H1270V108H1247V142H1220V120H1197V153H1148Z"
              />
              <path
                fill={p.hairShade}
                d="M1169 179H1197V169H1233V154H1268V142H1285V168H1324V142H1350V168H1389V152H1407V179H1461V199H1484V190H1498V215H1483V230H1468V253H1450V242H1437V226H1414V211H1389V196H1362V210H1337V203H1305V212H1282V202H1251V218H1228V238H1211V253H1183V231H1170Z"
              />
              <path
                fill={p.hairLight}
                d="M1181 169h8v-9h12v-7h16v7h8v12h-7v-8h-18v10h-8v12h-11z M1235 136h9v-9h13v-8h16v7h9v13h-7v-8h-18v9h-9v10h-13z M1285 143h10v-9h13v-7h17v7h9v11h-7v-7h-20v9h-9v11h-13z M1345 136h9v-9h13v-7h17v7h9v13h-7v-8h-18v8h-10v12h-13z M1404 143h9v-9h17v-7h15v7h9v12h-7v-8h-18v8h-10v12h-15z M1460 163h11v-9h17v8h10v13h-7v-7h-17v9h-14z"
              />
              <path
                fill={p.hairLight}
                fillOpacity={0.56}
                d="M1212 199h9v-9h16v-7h16v7h8v10h-7v-6h-19v8h-12v10h-11z M1265 187h10v-9h16v-6h15v6h9v11h-7v-7h-19v8h-12v11h-12z M1320 183h11v-10h16v-6h15v6h9v11h-7v-7h-18v9h-13v12h-13z M1376 187h10v-8h15v-6h17v6h8v11h-7v-7h-18v8h-11v10h-14z M1431 203h9v-9h15v-6h16v6h9v10h-7v-6h-17v8h-11v10h-14z"
              />
            </g>
          ) : (
            <AltHair style={styles.hair} paint={p} />
          )}
        </g>
      )}
    </svg>
  );
};

/** Memoized: leaderboard rows and the editor's swatch grid re-render often. */
export default memo(Avatar);
