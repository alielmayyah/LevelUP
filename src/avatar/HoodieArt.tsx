import { Mirrored } from './ClothingDetails';
import type { AvatarPaint } from './catalog';

const HOODIES = {
  hoodie: 'stitched-hoodie',
  'hood-up': 'stitched-hoodie',
  'zip-hoodie': 'zip-hoodie',
  'sleeveless-hoodie': 'sleeveless-hoodie',
} as const;

type HoodieStyle = keyof typeof HOODIES;

// The hood follows the head. Its narrow base overlaps the collar on every body fit.
const FACE =
  'M1295 165H1364V172H1394V184H1417V202H1434V226H1447V255H1456V327H1445V351H1430V371H1409V388H1385V401H1357V409H1307V401H1279V388H1255V371H1234V351H1219V327H1208V255H1217V225H1231V202H1249V183H1273V173H1295Z';
const CROWN =
  'M1307 86H1369V94H1408V107H1437V128H1461V155H1480V189H1494V231H1506V315H1496V354H1482V384H1463V408H1438V425H1408V438H1378V451H1354V463H1310V453H1283V442H1253V429H1225V413H1200V391H1181V363H1166V326H1155V236H1166V194H1182V159H1203V133H1229V112H1262V98H1307Z';
const SHELL =
  'M1314 99H1365V107H1403V120H1430V141H1452V167H1468V200H1481V241H1492V312H1483V350H1469V379H1451V401H1429V416H1401V429H1374V442H1350V454H1315V444H1288V433H1259V420H1232V405H1210V384H1193V358H1179V321H1169V243H1179V202H1195V169H1215V144H1238V124H1269V111H1314Z';
const SEAM =
  'M1290 153H1369V161H1400V173H1425V193H1443V218H1457V248H1467V330H1455V356H1440V377H1416V395H1390V409H1361V419H1303V409H1274V395H1248V377H1224V356H1209V330H1197V248H1207V217H1222V193H1242V172H1268V162H1290Z';

export function RaisedHood({ paint: p, hijab }: { paint: AvatarPaint; hijab: boolean }) {
  return (
    <g data-art-detail="raised-hood">
      {!hijab && (
        <>
          <path fill={p.skin} d={FACE} />
          <path
            fill={p.skinShade}
            d="M1295 165H1364V172H1394V184H1417V202H1434V226H1447V255H1436V231H1422V208H1409V193H1387V183H1358V176H1300V184H1279V194H1256V210H1242V232H1229V255H1217V225H1231V202H1249V183H1273V173H1295Z"
          />
        </>
      )}
      <path fill={p.outline} fillRule="evenodd" d={`${CROWN} ${FACE}`} />
      <path fill={p.tank} fillRule="evenodd" d={`${SHELL} ${SEAM}`} />
      <path
        fill={p.topShade}
        d="M1374 107H1403V120H1430V141H1452V167H1468V200H1481V241H1492V312H1483V350H1469V379H1451V401H1429V416H1401V429H1374V442H1350V454H1315V444H1288V433H1259V420H1232V405H1210V384H1193V358H1179V321H1187V353H1203V378H1222V398H1243V411H1268V424H1296V434H1325V444H1343V433H1364V420H1394V407H1423V393H1443V372H1459V345H1473V307H1480V245H1471V204H1458V172H1442V147H1422V128H1397V116H1374Z"
      />
      <path
        fill={p.topLight}
        d="M1197 178H1208V159H1226V139H1249V122H1281V112H1318V104H1357V111H1325V120H1287V130H1255V147H1232V167H1215V188H1204V205H1197Z M1179 260H1187V307H1179Z M1367 113H1381V125H1393V141H1386V130H1374V120H1367Z M1416 397H1434V385H1447V394H1443V404H1420V415H1402V408H1416Z M1235 398H1250V409H1273V420H1293V428H1271V421H1248V412H1235Z"
      />
    </g>
  );
}

function FoldedHood({ paint: p }: { paint: AvatarPaint }) {
  return (
    <g data-art-detail="folded-hood">
      <path fill={p.outline} d="M1217 438v-29h15v-21h22v-17h29v-10h98v10h29v17h22v21h15v29z" />
      <path fill={p.topShade} d="M1229 438v-25h15v-19h22v-15h25v-8h82v8h25v15h22v19h15v25z" />
      <path
        fill={p.tank}
        d="M1230 437v-22h17v-18h20v-13h17v11h-13v18h-13v24z M1406 437v-24h-13v-18h-13v-11h17v13h20v18h17v22z"
      />
    </g>
  );
}

export function HoodieTop({
  style,
  paint: p,
  tailored,
}: {
  style: HoodieStyle;
  paint: AvatarPaint;
  tailored: boolean;
}) {
  const raised = style === 'hood-up';
  const zip = style === 'zip-hoodie';
  const sleeveless = style === 'sleeveless-hoodie';
  return (
    <g data-style-layer="top" data-variant={style} data-fit={tailored ? 'tailored' : undefined}>
      {!raised && <FoldedHood paint={p} />}
      <path
        fill={p.outline}
        d={
          sleeveless
            ? 'M1250 410h39v-7h86v7h39v70h10v43h-8v39h-9v49h-15v12h-120v-12h-15v-49h-9v-39h-8v-43h10z'
            : tailored
              ? 'M1268 408H1396V420H1423V433H1447V449H1467V475H1480V511H1492V550H1502V594H1510V639H1498V651H1445V639H1436V611H1426V575H1410V549H1404V579H1411V605H1403V630H1261V605H1253V579H1260V549H1254V575H1238V611H1228V639H1219V651H1166V639H1154V594H1162V550H1172V511H1184V475H1197V449H1217V433H1241V420H1268Z'
              : 'M1268 408H1396V420H1432V433H1455V451H1476V475H1492V510H1505V550H1517V595H1524V641H1496V652H1446V639H1431V615H1421V575H1417V603H1405V634H1259V603H1247V575H1243V615H1233V639H1218V652H1168V641H1140V595H1147V550H1159V510H1172V475H1188V451H1209V433H1232V420H1268Z'
        }
      />
      {!sleeveless && (
        <Mirrored>
          <g transform={tailored ? 'translate(1187 0) scale(.82 1) translate(-1187 0)' : undefined}>
            <path
              fill={p.tank}
              d="M1259 435h23v58h-15v39h-17v39h-17v41h-11v23h-12v6h-34v-11h-23v-32h7v-44h12v-39h13v-34h16v-23h20v-15h38z"
            />
            <path
              fill={p.topShade}
              d="M1262 470h20v23h-15v39h-17v39h-17v41h-11v23h-12v6h-34v-11h-23v-19h30v-10h26v-27h16v-40h15v-34h11v-20h11z"
            />
            <path
              fill={p.topLight}
              d="M1211 457h20v7h-14v12h-14v16h-8v-20h16z M1175 534h12v7h-7v15h-11v-8h6z M1162 610h57v5h-57z M1177 618h5v13h-5z M1190 618h5v16h-5z M1203 618h5v14h-5z"
            />
          </g>
        </Mirrored>
      )}
      <g data-art-detail={HOODIES[style]}>
        <path
          fill={p.tank}
          d={
            sleeveless
              ? 'M1263 423h29v-7h80v7h29v61h10v37h-8v39h-9v44h-12v7h-100v-7h-12v-44h-9v-39h-8v-37h10z'
              : tailored
                ? 'M1278 421H1386V434H1414V483H1407V510H1397V543H1391V581H1399V603H1391V621H1273V603H1265V581H1273V543H1267V510H1257V483H1250V434H1278Z'
                : 'M1246 435h34v-14h104v14h34v55h-7v55h-7v56h-12v20h-120v-20h-12v-56h-7v-55h-7z'
          }
        />
        <Mirrored>
          <path
            fill={p.topShade}
            d={
              sleeveless
                ? 'M1263 432h9v54h-11v27h-8v-29h10z'
                : tailored
                  ? 'M1254 453H1264V482H1272V510H1280V545H1285V581H1277V603H1268V581H1275V546H1269V516H1262V490H1254Z'
                  : 'M1246 458h9v31h8v27h-10v-26h-7z M1261 553h9v38h9v17h-7v-7h-12z'
            }
          />
          <path fill={p.topLight} d={sleeveless ? 'M1265 429h6v50h-6z' : 'M1259 438h20v6h-20z'} />
        </Mirrored>
        <path fill={p.topShade} d={sleeveless ? 'M1282 593h100v18h-100z' : 'M1272 602h120v19h-120z'} />
        <path
          fill={p.topLight}
          d={
            sleeveless
              ? 'M1282 594h100v5h-100z'
              : 'M1272 603h120v5h-120z M1287 611h5v8h-5z M1304 611h5v8h-5z M1321 611h5v8h-5z M1338 611h5v8h-5z M1355 611h5v8h-5z M1372 611h5v8h-5z'
          }
        />
        <path fill={p.topShade} d="M1267 422h19v12h15v11h62v-11h15v-12h19v20h-13v13h-18v9h-68v-9h-18v-13h-13z" />
        <path fill={p.topLight} d="M1280 435h8v10h14v9h60v-9h14v-10h8v12h-14v11h-76v-11h-14z" />
        {zip ? (
          <>
            <Mirrored>
              <path fill={p.topShade} d="M1294 545h17v8h-10v13h-10v14h20v7h-32v-18h7v-13h8z" />
              <path fill={p.topLight} d="M1282 581h29v5h-29z" />
            </Mirrored>
            <path fill={p.topShade} d="M1324 449h16v172h-16z" />
            <path fill={p.topTrim} d="M1330 455h4v163h-4z M1327 461h10v15h-10z" />
          </>
        ) : (
          <>
            <path fill={p.topShade} d="M1299 535h66v10h10v11h10v25h-106v-25h10v-11h10z" />
            <path fill={p.tank} d="M1302 541h60v8h9v12h8v14h-94v-14h8v-12h9z" />
            <path
              fill={p.topLight}
              d="M1301 536h62v5h-62z M1293 548h7v7h-6v11h-9v-6h8z M1364 548h7v12h8v6h-9v-11h-6z M1285 574h94v5h-94z"
            />
            <path
              fill={p.topTrim}
              d="M1287 452h6v13h8v31h-6v-27h-8z M1371 452h6v21h-8v34h-6v-39h8z M1294 495h8v6h-8z M1362 505h8v6h-8z"
            />
          </>
        )}
      </g>
    </g>
  );
}
