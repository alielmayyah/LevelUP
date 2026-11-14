import type { ReactNode } from 'react';

import type { AvatarPaint, ResolvedStyles } from './catalog';

// All garment panels share the same shoulder, waist, wrist and ankle anchors.
// These details use the same coordinates and palette as their base shapes.
export function Mirrored({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <g transform="translate(2664 0) scale(-1 1)">{children}</g>
    </>
  );
}

export function Hands({ paint: p, sleeves }: { paint: AvatarPaint; sleeves: boolean }) {
  return (
    <g data-style-layer="hands">
      <Mirrored>
        {sleeves && (
          <>
            <path fill={p.outline} d="M1153 614h70v23h8v18h-7v12h-10v11h-11v6h-28v-6h-12v-7h-10v-13h-6v-23h6z" />
            <path fill={p.skin} d="M1163 629h46v8h11v17h-7v-6h-8v17h-6v9h-21v-6h-11v-8h-8v-23h4z" />
          </>
        )}
        <path
          fill={p.skinShade}
          d={
            sleeves
              ? 'M1167 649h5v10h5v8h-5v-6h-5z M1179 650h5v13h4v10h-5v-8h-4z M1191 648h5v13h3v7h-5v-6h-3z M1204 641h9v5h-9z'
              : 'M1170 634h5v12h5v9h-5v-7h-5z M1181 639h5v11h4v10h-5v-7h-4z M1193 637h5v13h3v6h-5v-7h-3z M1204 634h9v6h-9z'
          }
        />
        <path
          fill={p.skinLight}
          d={
            sleeves
              ? 'M1163 638h12v4h-5v7h-7z M1178 639h15v4h-15z M1202 636h9v4h-9z'
              : 'M1163 625h12v4h-5v8h-7z M1178 629h15v4h-15z M1202 627h9v4h-9z'
          }
        />
      </Mirrored>
    </g>
  );
}

function LongSleeveDetails({ paint: p }: { paint: AvatarPaint }) {
  return (
    <Mirrored>
      <path
        fill={p.topLight}
        d="M1226 447h22v5h-19v12h-12v15h-11v19h-6v-22h11v-16h15z M1192 515h17v6h-12v14h-13v9h-8v-12h8v-12h8z M1176 558h19v6h-13v12h-12v-6h6z"
      />
      <path
        fill={p.topShade}
        d="M1215 487h17v5h-11v12h-13v-6h7z M1189 545h19v5h-9v10h-14v-6h4z M1174 583h25v5h-11v7h-19v-5h5z"
      />
      <path
        fill={p.topLight}
        d="M1160 606h68v4h-68z M1174 613h4v8h-4z M1184 613h4v13h-4z M1194 613h4v14h-4z M1204 613h4v12h-4z M1214 613h4v5h-4z"
      />
    </Mirrored>
  );
}

export function TopDetails({ style, paint: p }: { style: ResolvedStyles['top']; paint: AvatarPaint }) {
  switch (style) {
    case 'tank':
      return (
        <g data-art-detail="training-tank">
          <path
            fill={p.topLight}
            d="M1272 437h6v68h-11v22h-5v-25h10z M1382 437h6v65h10v25h-5v-22h-11z M1298 459h11v10h44v-10h11v6h-8v10h-50v-10h-8z M1278 576h108v5h-108z"
          />
          <path
            fill={p.topShade}
            d="M1273 535h12v19h6v15h-10v-15h-8z M1379 523h13v20h-7v26h-11v-25h5z M1296 542h51v6h-14v6h-37z"
          />
          <path
            fill={p.topLight}
            d="M1292 497h4v4h-4z M1305 501h4v4h-4z M1318 497h4v4h-4z M1331 501h4v4h-4z M1344 497h4v4h-4z M1357 501h4v4h-4z M1292 510h4v4h-4z M1305 514h4v4h-4z M1318 510h4v4h-4z M1331 514h4v4h-4z M1344 510h4v4h-4z M1357 514h4v4h-4z"
          />
          <path fill={p.topTrim} d="M1273 445h4v48h-4z M1383 445h4v48h-4z M1311 468h39v3h-39z" />
        </g>
      );
    case 'tee':
      return (
        <g data-art-detail="pocket-tee">
          <path
            fill={p.topShade}
            d="M1222 449h41v5h-39v15h-13v22h-7v-25h13v-14h5z M1410 447h27v8h12v19h9v17h-6v-15h-9v-15h-13v-8h-20z M1261 534h15v13h18v7h-23v-13h-10z M1366 544h29v9h-15v8h-47v-5h33z M1283 568h87v5h-22v4h-65z"
          />
          <path
            fill={p.topLight}
            d="M1274 430h8v16h14v11h73v-11h14v-16h8v21h-11v9h-10v7h-75v-7h-11v-9h-10z M1200 507h45v4h-45z M1419 507h45v4h-45z M1275 585h114v4h-114z"
          />
          <path fill={p.topShade} d="M1354 480h40v35h-7v7h-26v-7h-7z" />
          <path fill={p.tank} d="M1358 488h32v24h-6v5h-20v-5h-6z" />
          <path fill={p.topTrim} d="M1359 484h29v4h-29z M1363 512h5v3h-5z M1373 512h5v3h-5z M1383 512h4v3h-4z" />
        </g>
      );
    case 'hoodie':
      return (
        <g data-art-detail="stitched-hoodie">
          <LongSleeveDetails paint={p} />
          <path
            fill={p.topShade}
            d="M1265 433h134v12h-15v13h-18v13h-68v-13h-18v-13h-15z M1295 531h74v9h13v14h7v20h-114v-20h7v-14h13z"
          />
          <path
            fill={p.topLight}
            d="M1282 441h7v12h17v10h53v-10h16v-12h7v15h-16v12h-67v-12h-17z M1295 528h74v5h-74z M1282 545h6v12h-7v12h101v-12h-7v-12h6v10h7v19h-113v-19h7z M1276 584h112v5h-112z"
          />
          <path
            fill={p.topTrim}
            d="M1296 454h11v5h-11z M1358 454h11v5h-11z M1299 459h5v41h-5z M1361 459h5v47h-5z M1298 500h7v6h-7z M1360 506h7v6h-7z M1301 533h7v3h-7z M1315 533h7v3h-7z M1329 533h7v3h-7z M1343 533h7v3h-7z M1357 533h7v3h-7z M1379 480h7v11h-7z"
          />
          <path
            fill={p.topShade}
            d="M1282 591h4v7h-4z M1296 591h4v7h-4z M1310 591h4v7h-4z M1324 591h4v7h-4z M1338 591h4v7h-4z M1352 591h4v7h-4z M1366 591h4v7h-4z M1380 591h4v7h-4z"
          />
        </g>
      );
    case 'track-jacket':
      return (
        <g data-art-detail="piped-track-jacket">
          <LongSleeveDetails paint={p} />
          <Mirrored>
            <path
              fill={p.topTrim}
              d="M1223 440h31v5h-29v15h-15v20h-13v26h-13v29h-6v-31h13v-27h13v-20h14v-13h5z M1228 450h26v4h-23v15h-13v19h-11v20h-4v-22h11v-20h14z M1160 611h66v4h-66z M1167 620h49v4h-49z"
            />
            <path fill={p.topShade} d="M1288 530h14v12h-8v14h-9v11h-9v-15h8v-12h4z" />
            <path fill={p.topTrim} d="M1289 534h6v9h-6v10h-6v10h-4v-13h6v-9h4z" />
          </Mirrored>
          <path fill={p.topShade} d="M1284 425h19v19h15v11h27v-11h16v-19h19v26h-17v13h-16v135h-30V464h-16v-13h-17z" />
          <path fill={p.topTrim} d="M1329 464h5v133h-5z M1326 471h11v14h-11z M1288 429h4v14h-4z M1371 429h4v14h-4z" />
        </g>
      );
    case 'sweatshirt':
      return (
        <g data-art-detail="crewneck-sweatshirt">
          <LongSleeveDetails paint={p} />
          <path fill={p.topShade} d="M1270 431h124v15h-13v13h-16v9h-66v-9h-16v-13h-13z M1279 577h107v16h-107z" />
          <path
            fill={p.topLight}
            d="M1289 443h13v9h12v7h36v-7h12v-9h13v9h-12v10h-13v6h-36v-6h-13v-10h-12z M1284 512h46v7h-46z M1295 521h24v5h-24z M1279 578h107v4h-107z"
          />
          <path
            fill={p.tank}
            d="M1288 583h4v10h-4z M1302 583h4v10h-4z M1316 583h4v10h-4z M1330 583h4v10h-4z M1344 583h4v10h-4z M1358 583h4v10h-4z M1372 583h4v10h-4z"
          />
        </g>
      );
    case 'varsity':
      return (
        <g data-art-detail="varsity-jacket">
          <Mirrored>
            <path
              fill={p.topTrim}
              d="M1226 441h32v22h-12v27h-10v26h-10v29h-10v23h-9v29h-13v12h-19v-12h-12v-15h8v-36h11v-39h12v-27h12v-21h20z"
            />
            <path
              fill={p.topShade}
              d="M1229 451h20v6h-19v17h-11v16h-7v-19h11v-16h6z M1164 607h64v5h-64z M1171 616h48v4h-48z M1284 530h11v9h-8v12h-9v12h-7v-14h8v-12h5z"
            />
          </Mirrored>
          <path
            fill={p.topTrim}
            d="M1290 432h12v13h13v9h34v-9h13v-13h12v18h-12v11h-12v7h-36v-7h-12v-11h-12z M1279 584h108v4h-108z"
          />
          <path fill={p.topShade} d="M1325 468h14v128h-14z" />
          <path
            fill={p.topTrim}
            d="M1329 481h6v6h-6z M1329 503h6v6h-6z M1329 525h6v6h-6z M1329 547h6v6h-6z M1329 569h6v6h-6z M1359 483h24v6h-8v23h-8v-23h-8z"
          />
        </g>
      );
    case 'mesh-tee':
      return (
        <g data-art-detail="mesh-training-tee">
          <Mirrored>
            <path
              fill={p.topShade}
              d="M1223 444h48v7h-30v9h-16v15h-14v26h-7v-30h14v-14h5z M1256 510h17v20h10v46h-14v-12h-7v-37h-6z"
            />
            <path fill={p.topTrim} d="M1199 501h42v4h-42z M1248 452h16v4h-16z M1262 524h4v29h-4z" />
          </Mirrored>
          <path fill={p.topLight} d="M1280 439h12v12h15v8h50v-8h15v-12h12v16h-14v12h-74v-12h-16z M1285 578h94v5h-94z" />
          <path
            fill={p.topShade}
            d="M1296 488h5v5h-5z M1313 488h5v5h-5z M1330 488h5v5h-5z M1347 488h5v5h-5z M1364 488h5v5h-5z M1304 501h5v5h-5z M1321 501h5v5h-5z M1338 501h5v5h-5z M1355 501h5v5h-5z M1296 514h5v5h-5z M1313 514h5v5h-5z M1330 514h5v5h-5z M1347 514h5v5h-5z M1364 514h5v5h-5z"
          />
        </g>
      );
    case 'compression-top':
      return (
        <g data-art-detail="compression-top">
          <Mirrored>
            <path
              fill={p.topShade}
              d="M1244 444h22v27h-13v30h-18v35h-12v38h-14v33h-13v-39h13v-38h13v-36h14v-28h8z M1280 499h17v72h-12v13h-6z"
            />
            <path
              fill={p.topLight}
              d="M1246 448h8v19h-14v31h-14v36h-12v41h-11v33h-5v-36h11v-41h12v-37h14v-31h11z M1285 498h4v67h-4z M1164 601h60v5h-60z"
            />
          </Mirrored>
          <path fill={p.topTrim} d="M1306 461h51v4h-51z M1318 483h7v13h-7z M1328 487h6v9h-6z" />
        </g>
      );
    case 'quarter-zip':
      return (
        <g data-art-detail="quarter-zip">
          <LongSleeveDetails paint={p} />
          <path
            fill={p.topShade}
            d="M1270 430h124v20h-17v12h-13v15h-64v-15h-13v-12h-17z M1321 463h22v60h-22z M1278 572h108v19h-108z"
          />
          <path
            fill={p.topTrim}
            d="M1290 441h11v13h14v8h34v-8h14v-13h11v16h-13v11h-24v50h-6v-50h-28v-11h-13z M1336 470h7v12h-7z"
          />
          <path fill={p.topLight} d="M1278 576h108v5h-108z" />
        </g>
      );
    case 'sleeveless-hoodie':
      return (
        <g data-art-detail="sleeveless-hoodie">
          <path
            fill={p.topShade}
            d="M1272 430h19v18h12v11h58v-11h12v-18h18v23h-14v15h-13v12h-64v-12h-14v-15h-14z M1295 532h74v10h11v10h7v23h-110v-23h7v-10h11z"
          />
          <path
            fill={p.topLight}
            d="M1273 451h6v52h-8v24h-5v-28h7z M1385 451h6v48h7v28h-5v-24h-8z M1296 535h72v5h-72z M1283 565h97v4h-97z M1279 577h107v5h-107z"
          />
          <path fill={p.topTrim} d="M1301 465h5v43h-5z M1358 465h5v49h-5z" />
        </g>
      );
  }
}

export function PantDetails({ style, paint: p }: { style: ResolvedStyles['pants']; paint: AvatarPaint }) {
  const short = style === 'shorts';
  return (
    <g data-art-detail={style}>
      <Mirrored>
        <path fill={p.pantsShade} d="M1254 615h34v5h-14v8h-9v11h-16v-6h11v-9h-6z" />
        <path fill={p.pantsLight} d="M1250 627h9v-7h9v-5h8v4h-8v6h-7v8h-11z" />
        {short ? (
          <>
            <path fill={p.pantsShade} d="M1234 674h75v10h-75z M1249 651h34v5h-13v7h-21z" />
            <path fill={p.pantsLight} d="M1236 674h73v4h-73z M1240 651h4v14h-4z" />
          </>
        ) : (
          <>
            <path fill={p.pantsShade} d="M1241 681h34v5h-15v10h-19z M1253 731h36v7h-14v9h-22z M1252 764h21v7h-21z" />
            <path fill={p.pantsLight} d="M1236 692h10v24h-6v18h-4z M1246 748h17v4h-12v7h-5z" />
          </>
        )}
        {style === 'track-pants' && (
          <path fill={p.pantsTrim} d="M1249 615h6v26h-12v29h-9v48h-8v72h-4v-75h7v-49h9v-29h11z" />
        )}
        {style === 'cargo' && <path fill={p.pantsLight} d="M1231 683h53v4h-53z M1231 690h4v30h-4z M1267 687h9v5h-9z" />}
        {style === 'jeans' && (
          <>
            <path fill={p.pantsLight} d="M1245 646h4v48h-6v52h-4v-55h6z M1225 780h70v5h-70z M1225 788h70v5h-70z" />
            <path
              fill={p.pantsTrim}
              d="M1257 615h5v5h-5z M1274 620h4v4h-4z M1246 657h3v6h-3z M1246 672h3v6h-3z M1240 706h3v6h-3z M1240 722h3v6h-3z"
            />
          </>
        )}
        {style === 'joggers' && (
          <path
            fill={p.pantsLight}
            d="M1243 774h40v4h-40z M1244 782h4v10h-4z M1256 782h4v10h-4z M1268 782h4v10h-4z M1280 782h4v10h-4z"
          />
        )}
      </Mirrored>
      {short && <path fill={p.pantsTrim} d="M1324 595h14v4h8v12h-7v-8h-6v22h-5v-22h-6v13h-6v-17h8z" />}
      {style === 'jeans' && <path fill={p.pantsShade} d="M1323 605h15v24h-5v7h-10z" />}
    </g>
  );
}

export function ShoeDetails({ style, paint: p }: { style: ResolvedStyles['shoes']; paint: AvatarPaint }) {
  const lace = style === 'high-tops' || style === 'trainers' || style === 'canvas';
  return (
    <g data-art-detail={style}>
      <path fill={p.shoeLight} d="M1185 832h20v-5h20v-5h9v6h-9v5h-20v5h-20z M1277 826h8v16h-8z" />
      {lace && (
        <>
          <path fill={p.shoeShade} d="M1222 789h46v8h-8v11h-10v10h-12v9h-28v-6h10v-8h10v-10h-8z" />
          <path fill={p.shoeTrim} d="M1226 797h33v4h-33z M1221 805h32v4h-32z M1215 813h31v4h-31z M1208 821h30v4h-30z" />
          <path fill={p.shoeLight} d="M1221 797h4v4h-4z M1216 805h4v4h-4z M1210 813h4v4h-4z M1203 821h4v4h-4z" />
        </>
      )}
      {style === 'high-tops' && (
        <path fill={p.shoeLight} d="M1221 770h65v5h-65z M1274 788h9v8h-9z M1262 830h16v5h-16z" />
      )}
      {style === 'runners' && (
        <path
          fill={p.shoeTrim}
          d="M1196 834h17v-6h19v-6h18v-7h12v5h-9v7h-18v6h-19v6h-20z M1243 802h24v4h-24z M1234 810h23v4h-23z"
        />
      )}
      {style === 'slip-ons' && (
        <path fill={p.shoeTrim} d="M1190 836h23v-6h23v-6h10v4h-9v7h-23v5h-24z M1254 821h15v4h-15z" />
      )}
      {style === 'boots' && (
        <>
          <path fill={p.shoeLight} d="M1222 743h57v5h-57z M1219 765h47v45h-10v-35h-37z M1180 832h38v5h-38z" />
          <path
            fill={p.shoeTrim}
            d="M1232 759h38v4h-38z M1232 770h38v4h-38z M1228 781h38v4h-38z M1224 792h39v4h-39z M1220 803h36v4h-36z"
          />
        </>
      )}
      {style === 'canvas' && <path fill={p.shoeTrim} d="M1173 850h130v4h-130z M1248 828h28v4h-28z" />}
      {style === 'lifters' && (
        <>
          <path fill={p.shoeLight} d="M1200 818h96v17h-96z M1227 798h40v6h-40z" />
          <path fill={p.shoeTrim} d="M1204 821h81v11h-81z M1289 821h9v11h-9z M1266 845h38v7h-38z" />
        </>
      )}
      {style === 'cross-trainers' && (
        <path fill={p.shoeTrim} d="M1230 802h46v5h-46z M1221 813h39v5h-39z M1277 828h31v7h-31z" />
      )}
      <path
        fill={p.shoeShade}
        d="M1185 855h9v4h-9z M1201 855h9v4h-9z M1217 855h9v4h-9z M1233 855h9v4h-9z M1249 855h9v4h-9z M1265 855h9v4h-9z M1281 855h9v4h-9z"
      />
    </g>
  );
}
