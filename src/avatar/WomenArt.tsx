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

// The three cuts share the same fitted crown and face opening. The drapes start at the jaw.
const HIJAB_CROWN =
  'M1191 361V328H1183V249H1191V207H1205V174H1224V149H1248V129H1278V114H1310V109H1350V116H1383V129H1415V149H1440V175H1459V207H1472V249H1480V328H1472V361';
const HIJAB_FABRIC =
  'M1203 359V325H1195V252H1203V210H1217V179H1235V154H1257V138H1286V124H1313V120H1347V127H1380V140H1409V158H1431V182H1448V212H1460V253H1468V325H1460V359';
const HIJAB_FACE =
  'M1295 194H1363V199H1388V210H1410V227H1426V252H1439V281H1445V324H1437V346H1423V365H1404V380H1381V393H1355V401H1309V393H1283V380H1260V365H1241V346H1227V324H1219V281H1225V252H1238V226H1255V210H1274V200H1295Z';

const HIJAB_DRAPE = {
  'sport-hijab': {
    outer: 'H1462V388H1448V410H1429V429H1401V447H1367V458H1297V447H1263V430H1236V411H1216V389H1203V361Z',
    fabric: 'H1451V385H1437V405H1418V423H1393V438H1361V447H1303V438H1270V423H1244V405H1227V385H1215V359Z',
    shade:
      'M1244 399H1264V409H1288V419H1312V426H1354V419H1378V409H1400V399H1418V409H1404V419H1382V430H1358V437H1307V430H1284V420H1260V411H1244Z',
    light: 'M1298 429H1322V435H1353V441H1319V437H1298Z',
  },
  'wrap-hijab': {
    outer:
      'H1459V389H1443V410H1455V428H1470V449H1456V464H1428V475H1379V481H1305V471H1274V451H1248V432H1228V409H1210V385H1200V361Z',
    fabric:
      'H1448V384H1431V410H1444V433H1457V444H1445V455H1423V465H1376V471H1310V461H1284V442H1257V425H1239V402H1221V381H1211V359Z',
    shade:
      'M1223 365H1234V385H1250V403H1270V416H1294V429H1322V440H1350V450H1382V459H1424V465H1376V458H1345V449H1316V438H1289V427H1266V415H1245V399H1232V383H1223Z',
    light:
      'M1234 386H1245V400H1266V413H1291V425H1317V435H1345V445H1334V441H1311V432H1286V420H1261V407H1242V394H1234Z M1397 449H1420V441H1440V447H1425V455H1397Z',
  },
  'longline-hijab': {
    outer:
      'H1459V386H1447V406H1454V430H1467V453H1480V477H1466V490H1436V503H1400V512H1264V503H1228V490H1198V477H1184V453H1197V430H1210V406H1217V386H1205V361Z',
    fabric:
      'H1448V383H1436V409H1443V433H1456V457H1467V472H1459V481H1429V493H1396V502H1268V493H1235V481H1205V472H1197V457H1208V433H1221V409H1228V383H1216V359Z',
    shade:
      'M1257 413H1277V423H1301V433H1363V423H1387V413H1407V423H1392V434H1368V444H1296V434H1272V423H1257Z M1210 461H1223V472H1245V483H1282V493H1235V481H1205V472H1210Z M1454 461H1441V472H1419V483H1382V493H1429V481H1459V472H1454Z',
    light: 'M1222 453H1233V463H1252V472H1278V479H1250V472H1229V462H1222Z M1406 474H1423V465H1443V474H1427V482H1406Z',
  },
} satisfies Record<HijabStyle, { outer: string; fabric: string; shade: string; light: string }>;

export function SportHijab({ style, paint: p }: { style: HijabStyle; paint: AvatarPaint }) {
  const drape = HIJAB_DRAPE[style];
  return (
    <g data-style-layer="hair" data-variant={style}>
      <path fill={p.outline} d={HIJAB_CROWN + drape.outer} />
      <path fill={p.hijab} data-paint="hijab-fabric" d={HIJAB_FABRIC + drape.fabric} />
      <path
        fill={p.hijabLight}
        d="M1217 179H1235V154H1257V138H1286V124H1313V120H1347V127H1317V132H1290V146H1262V162H1242V185H1226V211H1217Z"
      />
      <path
        fill={p.hijabShade}
        d="M1291 179H1367V187H1393V199H1417V218H1437V246H1450V278H1456V327H1448V351H1433V371H1410V388H1384V403H1358V411H1306V403H1280V388H1254V371H1231V351H1216V327H1208V278H1214V246H1227V218H1248V199H1270V188H1291Z"
      />
      <path fill={p.skin} data-art-detail="hijab-face" d={HIJAB_FACE} />
      <path
        fill={p.skinShade}
        d="M1295 194H1363V199H1388V210H1410V227H1426V252H1416V233H1401V217H1382V208H1358V204H1299V210H1281V219H1260V233H1248V252H1238V226H1255V210H1274V200H1295Z"
      />
      <path fill={p.hijabShade} d={drape.shade} />
      <path fill={p.hijabLight} d={drape.light} />
    </g>
  );
}

export function WomenArms({ paint: p }: { paint: AvatarPaint }) {
  return (
    <Mirrored>
      <path
        fill={p.outline}
        d="M1240 417H1271V493H1257V519H1244V550H1231V575H1219V611H1226V645H1215V665H1200V676H1173V667H1158V644H1151V608H1159V573H1170V535H1182V495H1195V462H1213V438H1240Z"
      />
      <path
        fill={p.skin}
        d="M1248 435H1259V485H1246V511H1233V542H1220V567H1207V607H1213V640H1204V657H1194V663H1178V654H1170V639H1163V610H1171V577H1182V539H1194V501H1207V468H1225V446H1248Z"
      />
      <path
        fill={p.skinShade}
        d="M1228 495H1246V511H1233V542H1220V567H1207V607H1213V624H1204V608H1199V563H1210V537H1220V511H1228Z"
      />
    </Mirrored>
  );
}

export function FittedZip({ paint: p }: { paint: AvatarPaint }) {
  return (
    <g data-style-layer="top" data-variant="fitted-zip" data-art-detail="fitted-zip">
      <path
        fill={p.outline}
        d="M1271 408H1393V417H1421V431H1445V449H1463V474H1478V511H1491V551H1501V594H1508V637H1495V651H1448V638H1437V607H1428V577H1415V548H1400V574H1410V596H1403V612H1261V596H1254V574H1264V548H1249V577H1236V607H1227V638H1216V651H1169V637H1156V594H1163V551H1173V511H1186V474H1201V449H1219V431H1243V417H1271Z"
      />
      <Mirrored>
        <path
          fill={p.tank}
          d="M1248 432H1283V481H1270V515H1254V542H1238V573H1226V604H1215V632H1209V638H1177V626H1169V597H1176V554H1187V515H1199V479H1213V455H1230V442H1248Z"
        />
        <path
          fill={p.topShade}
          d="M1220 501H1234V527H1225V553H1215V583H1206V613H1195V629H1177V638H1209V632H1215V604H1226V573H1238V542H1254V515H1266V492H1251V508H1243V525H1233V513H1220Z"
        />
        <path
          fill={p.topLight}
          d="M1213 464H1223V453H1237V445H1257V451H1241V461H1228V473H1220V485H1213Z M1170 610H1211V615H1170Z M1177 619H1182V630H1177Z M1188 619H1193V633H1188Z M1199 619H1204V630H1199Z"
        />
      </Mirrored>
      <path
        fill={p.tank}
        d="M1278 421H1386V433H1412V457H1420V487H1409V507H1396V532H1388V567H1397V589H1391V598H1273V589H1267V567H1276V532H1268V507H1255V487H1244V457H1252V433H1278Z"
      />
      <Mirrored>
        <path
          fill={p.topShade}
          d="M1257 454H1264V482H1277V505H1286V529H1293V561H1285V582H1274V567H1282V535H1275V511H1262V493H1257Z M1282 574H1303V579H1290V589H1282Z"
        />
        <path
          fill={p.topLight}
          d="M1275 444H1283V464H1295V472H1306V481H1289V474H1281V465H1275Z M1276 592H1324V597H1276Z"
        />
      </Mirrored>
      <path fill={p.topShade} d="M1301 421H1363V437H1352V455H1339V597H1325V455H1312V437H1301Z" />
      <path
        fill={p.topTrim}
        d="M1308 429H1314V442H1322V450H1342V442H1350V429H1356V445H1346V456H1335V597H1329V456H1318V445H1308Z M1336 461H1344V475H1336Z"
      />
    </g>
  );
}

type TailoredPantsStyle = 'track-pants' | 'tapered-joggers' | 'joggers' | 'warmup-pants';

export function TailoredPants({ style, paint: p }: { style: TailoredPantsStyle; paint: AvatarPaint }) {
  const joggers = style === 'joggers' || style === 'tapered-joggers';
  return (
    <g data-style-layer="pants" data-variant={style} data-art-detail="tailored-pants">
      <path
        fill={p.outline}
        d="M1261 558H1403V584H1417V605H1431V626H1444V653H1450V694H1446V725H1439V757H1441V800H1429V814H1367V803H1356V761H1348V725H1342V681H1322V725H1316V761H1308V803H1297V814H1235V800H1223V757H1225V725H1218V694H1214V653H1220V626H1233V605H1247V584H1261Z"
      />
      <Mirrored>
        <path
          fill={p.shorts}
          d="M1273 570H1332V668H1311V681H1309V723H1303V757H1295V797H1288V802H1243V794H1237V756H1239V720H1231V690H1227V654H1233V629H1246V606H1259V586H1273Z"
        />
        <path
          fill={p.pantsShade}
          d="M1313 618H1332V668H1311V681H1309V723H1303V757H1295V797H1288V802H1272V788H1280V751H1288V716H1294V675H1301V646H1307V632H1313Z"
        />
        <path
          fill={p.pantsLight}
          d="M1229 663H1238V688H1244V717H1248V740H1242V722H1237V692H1229Z M1247 767H1252V790H1247Z"
        />
        {style === 'track-pants' ? (
          <path
            fill={p.pantsTrim}
            d="M1262 600H1268V608H1261V620H1252V638H1244V652H1240V690H1244V717H1249V756H1253V794H1248V756H1243V719H1238V692H1234V650H1238V635H1246V617H1255V605H1262Z"
          />
        ) : (
          <path
            fill={p.pantsShade}
            d="M1264 606H1287V612H1273V619H1266V630H1257V621H1261V611H1264Z M1245 692H1268V699H1260V705H1249V701H1245Z"
          />
        )}
        {joggers && (
          <>
            <path fill={p.pantsShade} d="M1237 783H1296V797H1288V802H1243V795H1237Z" />
            <path fill={p.pantsLight} d="M1243 787H1289V792H1243Z" />
          </>
        )}
        {style === 'tapered-joggers' && (
          <path fill={p.pantsLight} d="M1247 641H1254V651H1248V672H1243V649H1247Z M1254 774H1278V778H1254Z" />
        )}
        {style === 'warmup-pants' && <path fill={p.pantsLight} d="M1254 704H1272V710H1254Z M1254 718H1264V723H1254Z" />}
      </Mirrored>
      <path fill={p.pantsShade} d="M1273 571H1391V587H1273Z" />
      <path fill={p.pantsLight} d="M1275 585H1389V590H1275Z" />
      {joggers && <path fill={p.pantsTrim} d="M1324 585H1340V590H1338V610H1333V591H1329V605H1324Z" />}
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
