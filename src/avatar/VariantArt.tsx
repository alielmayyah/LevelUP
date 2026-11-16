import type { AvatarPaint, HijabStyle, ResolvedStyles, WOMEN_HAIR } from './catalog';
import { Mirrored, PantDetails, ShoeDetails, TopDetails } from './ClothingDetails';
import { StudioLeggings } from './WomenArt';

interface VariantProps<K extends keyof ResolvedStyles> {
  style: ResolvedStyles[K];
  paint: AvatarPaint;
}

type AltHairStyle = Exclude<ResolvedStyles['hair'], 'curls' | HijabStyle | (typeof WOMEN_HAIR)[number]>;
const HAIR: Record<Exclude<AltHairStyle, 'shaved'>, [string, string, string, string]> = {
  fade: [
    'M1184 166H1205V131H1240V111H1282V99H1382V111H1424V131H1459V166H1480V251H1466V286H1450V307H1436V256H1412V238H1381V226H1282V238H1252V256H1220V307H1206V287H1193V251H1184Z',
    'M1201 170H1223V146H1258V127H1290V115H1374V127H1406V146H1441V170H1463V220H1438V236H1418V221H1388V209H1273V221H1246V236H1220V220H1201Z',
    'M1223 153H1258V134H1290V121H1374V133H1404V146H1378V139H1291V151H1256V164H1223Z',
    'M1201 220H1220V236H1246V249H1211V274H1201Z M1438 220H1463V251H1455V274H1446V248H1418V236H1438Z',
  ],
  'side-part': [
    'M1157 158H1181V123H1211V102H1252V79H1309V65H1426V80H1456V111H1483V149H1500V232H1479V275H1450V316H1435V247H1413V221H1389V198H1362V183H1339V205H1308V225H1274V244H1237V265H1218V315H1203V281H1181V255H1157Z',
    'M1177 161H1200V135H1231V115H1268V94H1327V82H1421V96H1440V127H1465V157H1482V216H1465V241H1448V224H1427V199H1402V178H1374V157H1335V179H1301V204H1267V224H1233V243H1209V231H1177Z',
    'M1200 148H1231V126H1272V108H1332V94H1418V110H1341V125H1296V143H1252V161H1200Z M1395 130H1435V147H1458V163H1431V148H1395Z',
    'M1177 202H1215V186H1260V173H1295V154H1325V176H1301V204H1267V224H1233V243H1209V231H1177Z M1374 157H1397V168H1424V188H1448V209H1482V216H1465V241H1448V224H1427V199H1402V178H1374Z',
  ],
  locs: [
    'M1140 135H1164V101H1199V78H1237V54H1288V43H1383V54H1437V76H1470V100H1502V136H1522V251H1538V356H1522V396H1478V378H1457V320H1434V248H1407V227H1377V210H1291V227H1262V246H1239V318H1214V374H1194V397H1148V369H1129V269H1140Z',
    'M1157 145H1181V114H1213V94H1250V70H1300V60H1371V71H1422V93H1456V113H1485V145H1505V263H1521V350H1505V379H1489V356H1473V301H1453V237H1424V214H1393V193H1278V210H1248V232H1222V303H1198V357H1179V380H1162V358H1146V277H1157Z',
    'M1177 145H1198V202H1186V263H1169V211H1177Z M1212 113H1234V166H1221V210H1204V166H1212Z M1256 82H1279V137H1266V184H1245V135H1256Z M1309 71H1332V117H1322V171H1301V117H1309Z M1357 80H1379V125H1390V179H1369V125H1357Z M1409 98H1430V144H1443V199H1422V144H1409Z M1457 126H1479V179H1491V237H1470V179H1457Z',
    'M1146 309H1162V336H1179V380H1162V358H1146Z M1198 277H1214V314H1198V357H1182V320H1198Z M1453 268H1469V305H1489V356H1473V301H1453Z M1505 296H1521V350H1505V379H1489V360H1505Z',
  ],
  'top-knot': [
    'M1181 162H1204V128H1231V107H1268V86H1248V53H1265V27H1294V13H1369V27H1400V53H1417V86H1397V105H1431V128H1461V162H1482V247H1466V277H1450V306H1435V248H1410V231H1383V216H1280V231H1253V248H1220V306H1205V272H1192V245H1181Z',
    'M1267 55H1282V38H1301V29H1360V39H1384V55H1400V78H1380V93H1287V78H1267Z M1198 170H1220V140H1250V120H1280V103H1384V120H1415V140H1444V170H1466V232H1443V226H1416V209H1389V196H1274V210H1245V227H1218V232H1198Z',
    'M1282 48H1308V34H1352V48H1368V59H1313V70H1282Z M1220 150H1251V133H1290V115H1372V129H1316V144H1277V164H1220Z',
    'M1287 75H1326V62H1363V74H1400V78H1380V93H1287Z M1198 208H1230V193H1265V178H1399V194H1425V208H1466V232H1443V226H1416V209H1389V196H1274V210H1245V227H1218V232H1198Z',
  ],
  'buzz-cut': [
    'M1188 245v-40h18v-30h27v-24h39v-17h120v17h40v24h28v30h15v40h-24v24h-18v-22h-24v-11h-154v11h-24v22h-18v-24z',
    'M1205 229v-20h17v-27h27v-20h34v-13h97v13h38v20h26v27h15v20h-17v13h-24v-18h-173v18h-24v-13z',
    'M1248 180h35v-15h81v8h-74v14h-42z M1298 190h7v5h-7z M1323 184h7v5h-7z M1348 192h7v5h-7z M1375 184h7v5h-7z M1401 189h7v5h-7z',
    'M1208 216h22v-10h28v-6h143v6h29v10h24v14h-14v11h-22v-17h-173v17h-22v-11h-15z',
  ],
  waves: [
    'M1188 244v-48h18v-28h31v-23h39v-13h112v13h39v23h31v29h17v47h-20v20h-19v-21h-28v-12h-153v12h-28v21h-19v-20z',
    'M1206 224v-24h18v-24h28v-18h34v-12h91v12h35v18h28v24h17v26h-19v11h-16v-17h-180v17h-17v-13z',
    'M1226 198h21v-12h29v-13h35v-12h49v7h-44v13h-34v13h-30v12h-26z M1255 211h24v-10h36v-12h46v-9h26v6h-20v10h-46v12h-37v9h-29z M1342 213h31v-10h39v-10h20v7h-15v10h-38v10h-37z',
    'M1206 222h18v-8h22v6h-5v17h-17v-13h-18z M1424 219h15v-8h11v15h-12v11h-14z',
  ],
  spikes: [
    'M1184 256v-71h17v-31h-8v-52h27v14h25V75h30v18h28V55h30v23h30v19h28V69h30v31h25v31h28v85h-17v35h-18v-16h-30v-12h-32v-13h-84v13h-34v12h-29v21z',
    'M1200 232v-43h19v-36h-8v-32h12v15h40v-39h19v14h38V78h9v19h24v22h53V92h10v28h21v31h21v53h-15v25h-20v-14h-38v-11h-32v-11h-104v11h-32v12h-32v16z',
    'M1223 144h45v-34h12v20h44V97h9v42h-18v14h-43v15h-49z M1398 126h20v21h21v21h-18v-13h-23z',
    'M1219 193h39v-16h51v-12h38v12h43v13h40v22h-28v-8h-49v-11h-104v11h-30z',
  ],
  braids: [
    'M1185 220v-51h19v-34h31v-27h39V91h115v17h40v27h30v34h19v51h-13v34h-13v67h-11v60h-41v-32h10v-64h13v-51h-30v-12h-125v12h-29v51h13v64h11v32h-41v-60h-11v-67h-13v-34z',
    'M1202 214v-39h18v-30h29v-24h37v-13h93v13h37v24h29v30h16v38h-12v57h-12v60h-10v37h-16v-18h8v-65h14v-56h-27v-19h-147v19h-26v56h13v65h8v18h-15v-37h-11v-60h-12v-57z',
    'M1233 153h20v-18h28v-13h101v7h-69v18h-20v55h-8v-53h-13v16h-23v38h-9v-32h-7z M1344 132h8v70h-8z M1383 143h18v16h15v43h-8v-35h-18v-15h-7z M1214 222h15v8h-15z M1227 268h15v8h-15z M1236 316h15v8h-15z M1435 222h15v8h-15z M1422 268h15v8h-15z M1413 316h15v8h-15z',
    'M1211 198h21v11h26v-13h147v13h27v-11h21v14h-17v15h-30v-8h-147v8h-30v-15h-18z',
  ],
  'tapered-curls': [
    'M1177 250v-62h15v-32h15v-19h19v-22h28V94h31V78h38v13h24V77h39v16h32v20h25v22h21v24h14v32h11v59h-16v29h-22v25h-16v-49h-17v-22h-19v-15h-30v-14h-91v14h-29v15h-20v22h-17v49h-16v-25h-22v-29z',
    'M1194 241v-48h14v-30h15v-19h21v-15h25v-20h29V94h15v13h40V93h24v15h29v20h25v21h22v24h12v26h12v42h-19v22h-12v-25h-19v-23h-21v-15h-37v-14h-92v14h-37v15h-21v23h-19v25h-12v-22z',
    'M1210 187h17v-15h18v-17h23v-16h32v-10h18v10h20v-9h28v-13h22v14h29v19h23v21h-12v-13h-23v-14h-29v7h-38v9h-27v-10h-18v9h-29v13h-22v15h-16v14h-16z',
    'M1194 225h27v-16h22v-15h35v-13h33v8h39v-7h35v13h34v15h22v15h36v16h-19v22h-12v-25h-19v-23h-21v-15h-37v-14h-92v14h-37v15h-21v23h-19v25h-12v-22z',
  ],
};

export function AltHair({ style, paint: p }: VariantProps<'hair'> & { style: AltHairStyle }) {
  if (style === 'shaved') {
    return (
      <g data-style-layer="hair" data-variant={style}>
        <path fill={p.outline} d="M1189 285v-66h14v-30h20v-21h29v-18h38v-12h84v12h38v18h29v21h20v30h13v66z" />
        <path fill={p.skin} d="M1207 290v-66h15v-27h20v-18h24v-14h32v-10h69v10h31v14h25v18h20v27h14v66z" />
        <path fill={p.skinLight} d="M1230 206h16v-16h24v-14h29v-10h52v7h-48v10h-28v14h-24v16h-21z" />
      </g>
    );
  }
  const [outline, fill, light, shade] = HAIR[style];
  return (
    <g data-style-layer="hair" data-variant={style}>
      <path fill={p.outline} d={outline} />
      <path fill={p.hair} d={fill} />
      <path fill={p.hairLight} d={light} />
      <path fill={p.hairShade} d={shade} />
    </g>
  );
}

export function SleeveTop({
  style,
  paint: p,
}: VariantProps<'top'> & { style: Exclude<ResolvedStyles['top'], 'tank'> }) {
  const tee = style === 'tee' || style === 'mesh-tee';
  return (
    <g data-style-layer="top" data-variant={style}>
      <path
        fill={p.outline}
        d={
          tee
            ? 'M1215 422H1261V407H1403V422H1448V444H1470V467H1486V519H1467V540H1428V582H1408V610H1256V582H1237V540H1198V519H1178V467H1195V444H1215Z'
            : 'M1199 442H1220V421H1260V405H1404V421H1444V442H1465V461H1484V494H1501V535H1514V583H1524V638H1489V650H1434V630H1416V589H1410V615H1254V589H1248V630H1230V650H1175V638H1140V583H1150V535H1163V494H1180V461H1199Z'
        }
      />
      <path
        fill={p.tank}
        d={
          tee
            ? 'M1222 438H1273V422H1391V438H1442V458H1456V477H1469V512H1453V524H1412V575H1395V594H1269V575H1253V524H1211V512H1195V477H1208V458H1222Z'
            : 'M1225 438H1273V422H1391V438H1439V455H1456V475H1467V504H1485V542H1497V587H1507V622H1480V634H1450V617H1434V567H1413V505H1394V585H1388V599H1276V585H1270V505H1251V567H1230V617H1214V634H1184V622H1157V587H1167V542H1179V504H1197V475H1208V455H1225Z'
        }
      />
      <path
        fill={p.topShade}
        d={
          tee
            ? 'M1195 500H1242V512H1253V524H1211V512H1195Z M1412 512H1423V500H1469V512H1453V524H1412Z M1269 581H1395V594H1269Z'
            : 'M1157 605H1230V617H1214V634H1184V622H1157Z M1434 605H1507V622H1480V634H1450V617H1434Z M1276 580H1388V599H1276Z'
        }
      />
      <TopDetails style={style} paint={p} />
    </g>
  );
}

const SHOES: Record<ResolvedStyles['shoes'], [string, string, string, string]> = {
  trainers: [
    'M1205 779H1303V811H1312V865H1300V877H1179V866H1165V820H1179V803H1205Z',
    'M1219 795H1273V820H1294V859H1183V822H1219Z',
    'M1220 795H1273V808H1220Z M1274 824H1294V851H1274Z',
    'M1183 846H1294V858H1183Z',
  ],
  'high-tops': [
    'M1204 750H1298V765H1312V863H1301V877H1176V864H1161V819H1175V803H1204Z',
    'M1220 768H1287V785H1295V851H1178V824H1192V816H1220Z',
    'M1220 768H1287V785H1220Z M1269 800H1295V851H1279V827H1269Z',
    'M1178 850H1295V861H1178Z',
  ],
  runners: [
    'M1206 789H1224V777H1286V790H1303V818H1319V857H1309V871H1282V877H1162V866H1149V836H1163V824H1182V810H1206Z',
    'M1217 803H1237V792H1277V804H1289V826H1301V848H1167V840H1184V831H1202V818H1217Z',
    'M1204 831H1232V817H1249V805H1272V818H1258V832H1240V848H1186V839H1204Z M1289 829H1301V848H1276V839H1289Z',
    'M1167 848H1301V856H1279V864H1167Z M1222 810H1252V818H1222Z',
  ],
  'slip-ons': [
    'M1203 799H1230V790H1285V801H1301V823H1315V866H1302V877H1172V867H1158V838H1170V824H1185V812H1203Z',
    'M1201 826H1218V813H1241V805H1277V818H1290V831H1298V852H1176V840H1187V832H1201Z',
    'M1187 836H1241V831H1267V840H1248V852H1176V842H1187Z',
    'M1176 852H1298V862H1176Z M1267 815H1280V828H1267Z',
  ],
  boots: [
    'M1206 721h86v13h15v88h11v42h-11v13h-130v-10h-20v-42h13v-12h23v-28h13z',
    'M1220 736h68v12h7v79h9v22h-132v-19h12v-9h24v-28h12z',
    'M1220 736h68v14h-68z M1280 754h15v69h9v26h-26v-28h2z M1175 836h39v13h-39z',
    'M1172 851h132v9h-132z',
  ],
  canvas: [
    'M1207 784h22v-9h50v9h19v23h11v24h10v32h-12v14h-137v-11h-15v-33h13v-15h21v-16h18z',
    'M1222 795h15v-7h40v10h11v23h13v17h6v19h-139v-20h15v-10h19v-16h20z',
    'M1248 794h26v14h13v19h12v15h-22v-16h-13v-14h-16z',
    'M1168 846h139v15h-139z M1170 833h27v13h-27z',
  ],
  lifters: [
    'M1202 784h24v-10h64v13h14v29h17v49h-12v12h-147v-11h-10v-32h13v-13h19v-16h18z',
    'M1219 794h18v-7h45v16h13v24h11v26h-138v-16h15v-10h22v-16h14z',
    'M1262 797h20v14h13v24h11v16h-32v-22h-12z',
    'M1168 849h138v14h-138z M1262 840h44v9h-44z',
  ],
  'cross-trainers': [
    'M1201 789h25v-15h58v10h17v28h16v15h9v35h-12v15h-147v-10h-15v-33h12v-15h21v-15h16z',
    'M1214 798h22v-12h43v11h13v27h16v10h5v15h-145v-12h16v-10h23v-14h7z',
    'M1214 824h25v-9h20v-14h25v12h-17v14h-24v10h-29z M1281 829h25v20h-29z',
    'M1168 848h145v14h-145z',
  ],
  barefoot: [
    'M1206 774h95v18h6v34h8v28h-8v12h-22v11h-106v-9h-15v-26h9v-15h14v-18h19z',
    'M1223 787h64v19h7v23h7v19h-9v12h-20v7h-86v-10h-9v-11h12v-16h14v-17h20z',
    'M1189 848h7v12h-7z M1209 853h6v14h-6z M1229 857h6v10h-6z M1251 857h6v10h-6z',
    '',
  ],
  'flat-lifters': [
    'M1207 780h23v-9h58v14h17v33h14v44h-10v15h-148v-11h-12v-38h13v-14h20v-12h25z',
    'M1223 792h16v-8h42v15h13v28h11v24h-142v-17h12v-12h21v-13h27z',
    'M1192 827h47v-11h49v13h-38v13h-72v-7h14z M1285 835h20v16h-29v-8h9z',
    'M1163 852h142v10h-142z M1217 808h67v9h-67z M1169 864h15v4h-15z M1200 864h15v4h-15z M1272 864h24v4h-24z',
  ],
  'cushioned-runners': [
    'M1202 792h19v-14h63v13h17v21h13v16h14v33h-10v12h-27v4h-131v-9h-15v-23h10v-15h13v-12h16v-15h18z',
    'M1215 802h20v-9h43v12h13v22h15v14h-141v-7h13v-9h18v-14h19z',
    'M1179 834h22v-10h26v-11h45v8h-19v11h-29v9h-45z M1292 826h14v15h-31v-7h17z',
    'M1160 844h153v13h-12v6h-22v3h-110v-7h-9z M1222 807h49v6h-49z',
  ],
};

export function ShoePair({ style, paint: p }: VariantProps<'shoes'>) {
  const [outline, fill, shade, trim] = SHOES[style];
  const shoe = (
    <>
      <path fill={p.outline} d={outline} />
      <path fill={style === 'barefoot' ? p.skin : p.shoes} d={fill} />
      {shade && <path fill={style === 'barefoot' ? p.skinShade : p.shoeShade} d={shade} />}
      {trim && <path fill={p.trim} d={trim} />}
      {style !== 'barefoot' && <ShoeDetails style={style} paint={p} />}
    </>
  );
  return (
    <g data-style-layer="shoes" data-variant={style}>
      <Mirrored>{shoe}</Mirrored>
    </g>
  );
}

export function Socks({
  style,
  shoes,
  paint: p,
  underPants,
}: VariantProps<'socks'> & { shoes: ResolvedStyles['shoes']; underPants: boolean }) {
  const grip = style === 'grip-socks';
  const tab = style === 'tab-socks';
  const compression = style === 'compression-socks';
  const ankle = underPants || style === 'ankle-socks' || grip || tab;
  const tallShoe = shoes === 'high-tops' || shoes === 'boots';
  const knee = !underPants && (style === 'knee-highs' || compression);
  const y = ankle ? (tallShoe ? (shoes === 'boots' ? 711 : 739) : tab ? 774 : 767) : knee ? 695 : 719;
  return (
    <g data-style-layer="socks" data-variant={style}>
      {style !== 'no-socks' && (
        <Mirrored>
          <g
            transform={`translate(0 ${y})${knee ? ' scale(1 1.3)' : ''}${underPants ? ' translate(352 0) scale(.72 1)' : ''}`}
          >
            <path fill={p.outline} d={ankle ? 'M1210 0h98v70h-98z' : 'M1219 0h94v29h-7v25h-10v36h-87V30h10z'} />
            <path
              data-paint="sock-fabric"
              fill={p.socks}
              d={ankle ? 'M1220 3h77v61h-77z' : 'M1230 4h72v23h-7v26h-11v31h-65V32h11z'}
            />
            <path
              fill={p.sockShade}
              d={ankle ? 'M1220 3h77v5h-77z' : 'M1230 4h72v7h-72z M1297 13h5v14h-5z M1290 27h5v24h-5z'}
            />
            {!underPants && (style === 'striped-socks' || style === 'knee-highs') && (
              <path fill={p.sockTrim} d="M1230 12h72v5h-72z M1230 22h72v5h-72z" />
            )}
            {!underPants && (style === 'crew-socks' || style === 'cushioned-socks') && (
              <path fill={p.sockShade} d="M1240 14h4v18h-4z M1253 14h4v18h-4z M1266 14h4v18h-4z M1279 14h4v18h-4z" />
            )}
            {!underPants && style === 'cushioned-socks' && (
              <path fill={p.sockTrim} d="M1230 10h72v5h-72z M1219 54h65v14h-65z" />
            )}
            {tab && <path fill={p.sockTrim} d="M1278 0h19v12h-19z M1223 12h52v4h-52z" />}
            {!underPants && compression && (
              <path fill={p.sockTrim} d="M1230 8h72v4h-72z M1240 20h6v46h-6z M1253 29h6v28h-6z" />
            )}
            {grip && (
              <path fill={p.sockTrim} d="M1220 10h77v4h-77z M1224 28h7v7h-7z M1237 35h7v7h-7z M1284 28h7v7h-7z" />
            )}
          </g>
          {shoes === 'barefoot' && (
            <>
              <path fill={p.socks} d={SHOES.barefoot[1]} />
              <path fill={p.sockShade} d="M1187 850h106v10h-21v7h-87v-10h2z" />
              {grip && (
                <path
                  fill={p.sockTrim}
                  d="M1190 844h8v4h-8z M1206 849h8v4h-8z M1222 851h8v4h-8z M1238 851h8v4h-8z M1254 849h8v4h-8z"
                />
              )}
            </>
          )}
        </Mirrored>
      )}
    </g>
  );
}

export function Pants({ style, paint: p }: VariantProps<'pants'>) {
  if (style === 'high-rise-leggings' || style === 'capris') return <StudioLeggings style={style} paint={p} />;
  if (style === 'loose-training-shorts') {
    return (
      <g data-style-layer="pants" data-variant={style}>
        <path
          fill={p.outline}
          d="M1249 575h166v16h15v25h13v33h13v72h-106v-19h-10v-37h-16v37h-10v19h-106v-72h13v-33h13v-25h15z"
        />
        <path
          fill={p.shorts}
          d="M1260 588h144v16h14v24h12v31h13v49h-80v-18h-11v-40h-40v40h-11v18h-80v-49h13v-31h12v-24h14z"
        />
        <path fill={p.pantsShade} d="M1260 588h144v13h-144z M1221 696h80v12h-80z M1363 696h80v12h-80z" />
        <Mirrored>
          <path fill={p.pantsTrim} d="M1247 628h5v29h-12v33h-5v-36h12z M1225 697h61v4h-61z" />
          <path fill={p.pantsShade} d="M1255 623h30v7h-19v15h-11z" />
        </Mirrored>
      </g>
    );
  }
  if (style === 'liner-shorts' || style === 'split-shorts') {
    const lined = style === 'liner-shorts';
    return (
      <g data-style-layer="pants" data-variant={style}>
        {lined && (
          <>
            <path fill={p.outline} d="M1240 636h184v72h-11v16h-68v-50h-26v50h-68v-16h-11z" />
            <path fill={p.pantsShade} d="M1253 649h158v56h-9v8h-47v-48h-46v48h-47v-8h-9z" />
          </>
        )}
        <path
          fill={p.outline}
          d="M1252 578h160v18h14v26h13v23h9v24h-16v17h-80v-14h-8v-23h-24v23h-8v14h-80v-17h-16v-24h9v-23h13v-26h14z"
        />
        <path
          fill={p.shorts}
          d="M1262 591h140v20h14v22h12v14h8v13h-16v15h-60v-11h-8v-28h-40v28h-8v11h-60v-15h-16v-13h8v-14h12v-22h14z"
        />
        <Mirrored>
          <path fill={p.pantsTrim} d="M1234 650h10v12h8v8h51v4h-54v-8h-9v-12h-6z" />
          <path fill={p.pantsShade} d="M1258 616h26v4h-12v9h-14z M1261 650h26v5h-26z" />
        </Mirrored>
        <path fill={p.pantsTrim} d="M1327 599h10v5h7v12h-5v-9h-5v19h-5v-19h-5v10h-5v-13h8z" />
      </g>
    );
  }
  if (style === 'training-tights' || style === 'warmup-pants' || style === 'panel-tights') {
    const tights = style !== 'warmup-pants';
    return (
      <g data-style-layer="pants" data-variant={style}>
        <path
          fill={p.outline}
          d={
            tights
              ? 'M1250 575h164v27h13v30h10v47h7v67h10v56h-11v13h-72v-17h-12v-48h-12v-52h-8v-37h-14v37h-8v52h-12v48h-12v17h-72v-13h-11v-56h10v-67h7v-47h10v-30h13z'
              : 'M1250 572h164v27h17v33h15v35h10v60h-4v65h-12v21h-85v-21h-11v-56h-7v-53h-10v53h-7v56h-11v21h-85v-21h-12v-65h-4v-60h10v-35h15v-33h17z'
          }
        />
        <path
          fill={p.shorts}
          d={
            tights
              ? 'M1262 590h140v24h12v30h11v43h7v65h9v45h-58v-12h-12v-45h-11v-53h-9v-36h-38v36h-9v53h-11v45h-12v12h-58v-45h9v-65h7v-43h11v-30h12z'
              : 'M1263 587h138v25h17v29h14v32h10v54h-4v59h-13v13h-57v-13h-11v-57h-9v-55h-32v55h-9v57h-11v13h-57v-13h-13v-59h-4v-54h10v-32h14v-29h17z'
          }
        />
        <Mirrored>
          {tights ? (
            <>
              <path
                fill={p.pantsShade}
                d="M1245 676h54v12h-10v24h-16v19h-40v-20h12z M1231 771h45v16h-8v10h-45v-18h8z"
              />
              <path fill={p.pantsLight} d="M1254 647h6v31h-5v26h-5v21h-6v-25h5v-26h5z M1243 732h5v31h-5z" />
            </>
          ) : (
            <>
              <path
                fill={p.pantsShade}
                d="M1253 608h30v7h-15v9h-15z M1236 677h39v8h-14v15h-25z M1240 740h39v7h-15v13h-24z M1239 785h55v13h-55z"
              />
              <path
                fill={p.pantsLight}
                d="M1240 748h6v33h-6z M1241 754h21v5h-21z M1260 751h6v11h-6z M1239 785h55v4h-55z"
              />
            </>
          )}
        </Mirrored>
        {style === 'panel-tights' && (
          <Mirrored>
            <path fill={p.pantsLight} d="M1248 651h27v28h-9v35h-10v37h-9v30h-23v-24h10v-38h8v-34h6z" />
            <path fill={p.pantsTrim} d="M1256 658h12v5h-12z M1237 749h6v19h-6z" />
          </Mirrored>
        )}
        <path fill={p.pantsShade} d="M1265 591h134v10h-134z" />
      </g>
    );
  }
  if (style === 'bike-shorts') {
    return (
      <g data-style-layer="pants" data-variant={style}>
        <path fill={p.outline} d="M1253 580h158v23h17v24h15v94h-101v-58h-20v58h-101v-94h15v-24h17z" />
        <path fill={p.shorts} d="M1260 594h144v24h14v18h11v70h-74v-56h-46v56h-74v-70h11v-18h14z" />
        <Mirrored>
          <path fill={p.pantsTrim} d="M1253 630h5v65h-5z M1244 693h63v5h-63z" />
          <path fill={p.pantsShade} d="M1260 600h59v9h-59z M1240 680h12v12h-12z M1287 657h14v34h-14z" />
        </Mirrored>
      </g>
    );
  }
  const shorts = style === 'shorts';
  const tapered = style === 'tapered-joggers';
  const joggers = style === 'joggers' || tapered;
  return (
    <g data-style-layer="pants" data-variant={style}>
      <path
        fill={p.outline}
        d={
          shorts
            ? 'M1253 572H1409V591H1422V621H1437V639H1452V686H1444V705H1340V686H1324V705H1220V686H1212V639H1227V621H1241V591H1253Z'
            : 'M1253 572H1410V592H1426V623H1443V654H1454V716H1461V794H1451V811H1350V794H1341V738H1323V794H1314V811H1213V794H1203V716H1210V654H1221V623H1238V592H1253Z'
        }
      />
      <path
        fill={p.shorts}
        d={
          shorts
            ? 'M1254 586H1408V622H1422V640H1430V685H1350V636H1314V685H1233V640H1241V622H1254Z'
            : joggers
              ? 'M1263 590H1400V611H1415V640H1432V689H1440V770H1426V797H1374V770H1358V706H1347V665H1317V706H1306V770H1290V797H1238V770H1224V689H1232V640H1249V611H1263Z'
              : 'M1263 590H1400V611H1415V640H1431V668H1439V716H1446V794H1366V716H1352V665H1312V716H1298V794H1218V716H1225V668H1233V640H1249V611H1263Z'
        }
      />
      {joggers && (
        <>
          <path fill={p.pantsShade} d="M1238 778H1290V797H1238Z M1374 778H1426V797H1374Z M1263 590H1400V610H1263Z" />
          <path fill={p.pantsLight} d="M1318 600H1327V628H1318Z M1337 600H1346V635H1337Z" />
        </>
      )}
      {tapered && (
        <Mirrored>
          <path fill={p.pantsShade} d="M1247 615h38v9h-20v14h-18z M1228 683h22v31h-8v50h-12v-51h-2z" />
          <path fill={p.pantsLight} d="M1252 619h24v4h-18v11h-6z M1241 783h46v4h-46z M1241 790h46v3h-46z" />
        </Mirrored>
      )}
      {style === 'cargo' && (
        <>
          <path
            fill={p.pantsShade}
            d="M1226 667H1289V726H1226Z M1375 667H1438V726H1375Z M1252 755H1263V794H1252Z M1401 755H1412V794H1401Z"
          />
          <path fill={p.pantsLight} d="M1226 668H1289V681H1226Z M1375 668H1438V681H1375Z" />
        </>
      )}
      {style === 'track-pants' && (
        <path
          fill={p.pantsLight}
          d="M1249 611H1261V649H1246V717H1239V794H1227V717H1234V640H1249Z M1403 611H1415V640H1430V717H1437V794H1425V717H1418V649H1403Z"
        />
      )}
      <PantDetails style={style} paint={p} />
    </g>
  );
}

// Leave space for the smile at y=351–368. The boxed and full beards have
// different necklines and both open around the lips instead of painting them.
const LIP_OPENING = ' M1294 351h13v-3h44v3h14v12h-7v8h-14v4h-31v-4h-12v-7h-7z';
const MUSTACHE = 'M1283 351h9v-6h11v-6h13v-3h10v5h8v-5h10v3h13v6h11v6h9v6h-13v-4h-12v-5h-15v-3h-14v3h-15v5h-12v4h-13z';

interface BeardArt {
  base: string;
  shade?: string;
  texture?: string;
  opening?: boolean;
}

const BEARDS: Record<Exclude<ResolvedStyles['beard'], 'clean-shaven'>, BeardArt> = {
  stubble: {
    base: 'M1234 334h7v12h7v10h16v9h13v7h17v8h23v4h24v-4h24v-8h18v-7h13v-9h16v-10h7v-12h7v28h-9v13h-14v12h-14v9h-11v8h-102v-8h-11v-9h-14v-12h-14v-13h-8z',
    texture:
      'M1242 349h3v4h-3z M1251 361h4v3h-4z M1259 371h3v3h-3z M1269 370h4v4h-4z M1278 382h3v4h-3z M1288 380h4v4h-4z M1297 390h3v4h-3z M1307 385h4v3h-4z M1319 392h4v3h-4z M1329 387h4v4h-4z M1338 396h4v3h-4z M1348 387h3v4h-3z M1356 394h4v4h-4z M1365 381h4v3h-4z M1375 386h4v4h-4z M1386 376h3v4h-3z M1395 371h4v4h-4z M1406 363h4v3h-4z M1416 352h3v4h-3z',
  },
  mustache: {
    base: MUSTACHE,
    shade: 'M1292 350h12v-4h12v-3h9v3h-9v3h-12v4h-12z M1335 343h9v3h13v4h11v3h-11v-4h-13v-3h-9z',
    texture: 'M1306 341h8v3h-8z M1318 338h5v3h-5z M1338 338h5v3h-5z M1347 342h8v3h-8z',
  },
  goatee: {
    base: MUSTACHE + ' M1306 375h9v5h9v3h15v-3h9v-5h8v18h-5v10h-10v6h-24v-6h-8v-10h-3z',
    shade: 'M1311 391h6v7h11v5h13v-5h9v5h-9v6h-24v-6h-6z',
    texture: 'M1316 384h5v7h4v4h-5v-4h-4z M1329 386h5v12h-5z M1342 384h5v9h-5z',
  },
  'short-beard': {
    base: 'M1228 322h10v13h7v12h12v8h15v5h9v-10h12v-6h11v-6h16v4h20v-4h16v6h11v6h12v10h9v-5h15v-8h12v-12h7v-13h10v44h-8v16h-13v10h-14v9h-16v7h-19v6h-64v-6h-19v-7h-16v-9h-14v-10h-13v-16h-8z',
    shade:
      'M1230 343h8v22h9v14h14v8h18v10h21v7h59v-7h21v-10h17v-8h14v-14h10v-22h8v23h-8v16h-13v10h-14v9h-16v7h-19v5h-62v-5h-19v-7h-16v-9h-14v-10h-13v-16h-8z',
    texture:
      'M1250 356h7v9h-7z M1261 364h8v7h7v6h-8v-6h-7z M1284 376h8v8h-8z M1302 382h6v12h-6z M1321 383h6v8h3v6h-6v-7h-3z M1342 380h5v12h-5z M1362 377h8v6h-8z M1381 367h8v6h-8z M1400 360h8v10h-8z',
    opening: true,
  },
  'full-beard': {
    base: 'M1222 315h12v13h8v11h10v10h17v5h12v-7h12v-6h12v-7h16v5h17v-5h16v7h12v6h12v7h12v-5h17v-10h10v-11h8v-13h12v51h-6v19h-10v16h-13v13h-16v11h-16v7h-17v8h-21v5h-22v-5h-21v-8h-17v-7h-16v-11h-16v-13h-13v-16h-10v-19h-6z',
    shade:
      'M1226 339h8v24h9v19h11v14h14v12h16v9h19v7h20v7h16v-7h20v-7h19v-9h16v-12h14v-14h11v-19h9v-24h8v27h-6v19h-10v16h-13v13h-16v11h-16v7h-17v8h-21v5h-22v-5h-21v-8h-17v-7h-16v-11h-16v-13h-13v-16h-10v-19h-6z',
    texture:
      'M1240 348h6v14h7v10h-7v-7h-6z M1258 359h8v10h7v8h-7v-5h-8z M1267 384h7v8h8v8h-7v-5h-8z M1281 367h7v9h7v7h-7v-5h-7z M1297 386h8v10h5v8h-7v-5h-6z M1313 378h6v13h4v6h-7v-6h-3z M1313 406h7v9h7v7h-7v-5h-7z M1330 390h7v16h-7z M1340 410h8v10h-8z M1350 380h7v11h-7z M1356 397h8v11h-8z M1371 370h7v10h-7z M1374 388h7v9h-7z M1390 361h8v11h-8z M1390 380h8v9h-8z M1410 349h7v14h-7z',
    opening: true,
  },
  'chin-strap': {
    base: 'M1232 319h10v39h8v15h13v11h17v9h25v8h54v-8h25v-9h17v-11h13v-15h8v-39h10v48h-8v16h-14v12h-17v9h-23v9h-76v-9h-23v-9h-17v-12h-14v-16h-8z',
    shade:
      'M1243 370h7v10h14v12h17v9h25v7h52v-7h25v-9h17v-12h14v-10h7v13h-11v12h-17v9h-23v9h-76v-9h-23v-9h-17v-12h-11z',
    texture: 'M1269 388h10v4h-10z M1296 399h9v4h-9z M1318 403h17v4h-17z M1348 403h9v4h-9z M1384 389h11v4h-11z',
  },
  'fade-beard': {
    base: 'M1239 349h8v13h10v12h14v7h15v-6h22v-4h48v4h22v6h15v-7h14v-12h10v-13h8v24h-8v16h-14v10h-19v13h-22v8h-60v-8h-22v-13h-19v-10h-14v-16h-8z',
    shade: 'M1257 382h9v9h14v7h20v9h64v-9h20v-7h14v-9h9v15h-19v14h-22v8h-68v-8h-22v-14h-19z',
    texture:
      'M1270 383h5v6h-5z M1284 379h6v7h-6z M1301 382h5v12h-5z M1317 387h5v12h-5z M1333 384h6v14h-6z M1349 386h5v11h-5z M1367 380h5v9h-5z M1384 384h5v6h-5z',
  },
  'chin-tuft': {
    base: 'M1310 380h12v5h20v-5h12v13h-6v12h-6v9h-17v-9h-9v-12h-6z',
    shade: 'M1316 394h7v6h8v7h8v-7h8v5h-5v9h-17v-9h-9z',
    texture: 'M1324 387h5v9h-5z M1336 389h5v10h-5z',
  },
  'boxed-beard': {
    base: 'M1228 334h14v21h17v12h28v-17h13v-12h60v12h16v17h28v-12h16v-21h14v41h-11v13h-18v13h-22v20h-103v-20h-22v-13h-19v-13h-11z',
    shade: 'M1240 372h17v12h23v13h16v13h72v-13h17v-13h22v-12h17v14h-19v13h-22v22h-103v-22h-22v-13h-18z',
    texture: 'M1290 381h7v12h-7z M1311 386h7v15h-7z M1330 385h7v17h-7z M1351 383h7v14h-7z M1372 378h7v12h-7z',
    opening: true,
  },
  'circle-beard': {
    base: 'M1297 346h12v-9h42v9h14v13h9v26h-9v13h-13v8h-44v-8h-12v-13h-9v-26h10z',
    shade: 'M1293 378h8v11h12v7h35v-7h13v-11h7v9h-6v11h-12v8h-42v-8h-12v-13h-3z',
    texture: 'M1313 380h5v10h-5z M1328 381h5v13h-5z M1343 380h5v10h-5z',
    opening: true,
  },
};

export function Beard({ style, paint: p }: VariantProps<'beard'>) {
  const art = style === 'clean-shaven' ? null : BEARDS[style];
  const stubble = style === 'stubble';
  return (
    <g data-style-layer="beard" data-variant={style}>
      {art && (
        <>
          <path
            data-paint="beard-hair"
            fill={stubble ? p.stubble : p.beard}
            fillRule={art.opening ? 'evenodd' : undefined}
            d={art.base + (art.opening ? LIP_OPENING : '')}
          />
          {art.shade && <path fill={p.beardShade} d={art.shade} />}
          {art.texture && (
            <path fill={stubble ? p.beard : p.beardLight} fillOpacity={stubble ? 0.48 : 0.72} d={art.texture} />
          )}
        </>
      )}
    </g>
  );
}
