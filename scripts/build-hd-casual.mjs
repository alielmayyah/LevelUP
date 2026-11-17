import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Native-resolution production masks for the supplied 1024 × 1536 illustration.
// Run from any directory: node scripts/build-hd-casual.mjs [original-reference.png]

const width = 1024;
const height = 1536;
const pixels = width * height;
const output = fileURLToPath(new URL('../public/avatar/', import.meta.url));
const reference = process.argv[2] ?? join(output, 'hd-casual.png');
const layerFolder = join(output, 'hd-casual-layers');
const raw = execFileSync(
  'ffmpeg',
  ['-v', 'error', '-i', reference, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'],
  { maxBuffer: pixels * 4 + 65536 },
);
const size = JSON.parse(
  execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', reference],
    { encoding: 'utf8' },
  ),
).streams[0];
if (size.width !== width || size.height !== height || raw.length !== pixels * 4) {
  throw new Error('The manually placed masks require the uncropped 1024 × 1536 reference.');
}

const layers = [
  'backpack-rear',
  'body',
  'cargo-pants',
  'shoe-left',
  'shoe-right',
  'hoodie',
  'head',
  'hair',
  'backpack-straps',
];
const layer = Object.fromEntries(layers.map((name, i) => [name, i + 1]));
const paint = Object.fromEntries(layers.map((name) => [name, Buffer.alloc(pixels * 4)]));
const owner = new Uint8Array(pixels);

// A four-connected exterior matte preserves near-black outlines inside the
// figure. Nothing samples, scales or blurs pixels from the source artwork.
const outside = new Uint8Array(pixels);
const queue = new Uint32Array(pixels);
let count = 0;
function enqueue(p) {
  if (outside[p]) return;
  const i = p * 4;
  if (raw[i + 3] && Math.max(raw[i], raw[i + 1], raw[i + 2]) > 10) return;
  outside[p] = 1;
  queue[count++] = p;
}
for (let x = 0; x < width; x++) {
  enqueue(x);
  enqueue(pixels - width + x);
}
for (let y = 1; y < height - 1; y++) {
  enqueue(y * width);
  enqueue(y * width + width - 1);
}
for (let at = 0; at < count; at++) {
  const p = queue[at];
  if (p % width > 0) enqueue(p - 1);
  if (p % width < width - 1) enqueue(p + 1);
  if (p >= width) enqueue(p - width);
  if (p < pixels - width) enqueue(p + width);
}

// Hand-traced polygons use reference coordinates. Scan conversion at the
// original pixel centers yields a hard, complementary mask at every joint.
function mask(points) {
  const out = new Uint8Array(pixels);
  const minY = Math.max(0, Math.min(...points.map((p) => p[1])));
  const maxY = Math.min(height, Math.max(...points.map((p) => p[1])));
  for (let y = minY; y < maxY; y++) {
    const crossings = [];
    for (let j = 0; j < points.length; j++) {
      const [ax, ay] = points[j];
      const [bx, by] = points[(j + 1) % points.length];
      const line = y + 0.5;
      if (ay > line !== by > line) crossings.push(ax + ((line - ay) * (bx - ax)) / (by - ay));
    }
    crossings.sort((a, b) => a - b);
    for (let i = 0; i + 1 < crossings.length; i += 2) {
      const left = Math.max(0, Math.ceil(crossings[i] - 0.5));
      const right = Math.min(width, Math.ceil(crossings[i + 1] - 0.5));
      out.fill(1, y * width + left, y * width + right);
    }
  }
  return out;
}

const head = mask([
  [345, 18],
  [641, 18],
  [649, 142],
  [614, 257],
  [595, 277],
  [566, 279],
  [559, 301],
  [551, 325],
  [516, 325],
  [492, 306],
  [465, 289],
  [439, 277],
  [445, 254],
  [436, 249],
  [393, 244],
  [345, 202],
]);
const hair = mask([
  [345, 18],
  [644, 18],
  [649, 139],
  [626, 155],
  [610, 159],
  [594, 151],
  [591, 133],
  [582, 119],
  [547, 118],
  [545, 132],
  [534, 141],
  [524, 147],
  [516, 143],
  [506, 153],
  [497, 164],
  [489, 181],
  [477, 197],
  [470, 182],
  [461, 173],
  [449, 169],
  [438, 177],
  [434, 194],
  [442, 213],
  [453, 224],
  [448, 250],
  [395, 249],
  [345, 213],
]);

const rearBag = mask([
  [210, 550],
  [228, 441],
  [237, 390],
  [271, 348],
  [313, 325],
  [363, 330],
  [373, 342],
  [349, 351],
  [320, 372],
  [304, 398],
  [291, 423],
  [281, 456],
  [261, 474],
  [255, 497],
  [253, 522],
  [246, 543],
  [227, 574],
]);
const strapNear = mask([
  [344, 326],
  [365, 310],
  [407, 315],
  [437, 328],
  [448, 347],
  [459, 374],
  [465, 408],
  [466, 444],
  [456, 478],
  [449, 505],
  [433, 535],
  [420, 563],
  [405, 592],
  [393, 619],
  [379, 653],
  [375, 689],
  [369, 723],
  [363, 754],
  [342, 755],
  [339, 711],
  [350, 680],
  [347, 648],
  [349, 606],
  [357, 571],
  [371, 537],
  [386, 498],
  [395, 462],
  [405, 420],
  [404, 391],
  [396, 363],
  [386, 346],
  [367, 339],
]);
const strapFar = mask([
  [598, 324],
  [623, 323],
  [639, 339],
  [648, 365],
  [656, 395],
  [662, 423],
  [666, 449],
  [663, 481],
  [657, 510],
  [647, 540],
  [641, 561],
  [631, 552],
  [632, 520],
  [635, 485],
  [635, 445],
  [629, 411],
  [621, 383],
  [610, 353],
]);
const buckles = mask([
  [424, 375],
  [449, 375],
  [449, 400],
  [425, 401],
]);
const farBuckle = mask([
  [628, 374],
  [651, 377],
  [656, 400],
  [637, 402],
]);
const nearHand = mask([
  [240, 754],
  [270, 746],
  [294, 738],
  [314, 734],
  [336, 740],
  [352, 750],
  [382, 770],
  [376, 852],
  [241, 861],
]);
const farHand = mask([
  [671, 754],
  [693, 740],
  [722, 727],
  [749, 726],
  [764, 748],
  [760, 848],
  [670, 856],
]);
const belowWaist = mask([
  [265, 858],
  [359, 806],
  [365, 744],
  [380, 727],
  [400, 706],
  [454, 710],
  [498, 722],
  [560, 732],
  [604, 734],
  [651, 725],
  [659, 746],
  [680, 803],
  [786, 871],
  [799, 1536],
  [244, 1536],
]);
const nearShoe = mask([
  [245, 1377],
  [283, 1354],
  [296, 1331],
  [310, 1326],
  [327, 1324],
  [328, 1316],
  [338, 1306],
  [393, 1306],
  [410, 1319],
  [410, 1333],
  [445, 1375],
  [490, 1498],
  [490, 1520],
  [245, 1520],
]);
const farShoe = mask([
  [500, 1358],
  [520, 1328],
  [545, 1322],
  [562, 1316],
  [570, 1304],
  [586, 1305],
  [603, 1294],
  [647, 1294],
  [656, 1313],
  [681, 1341],
  [798, 1412],
  [806, 1520],
  [500, 1520],
]);

function skin(r, g, b) {
  return r > 40 && r > g + 17 && g > b + 10;
}
function strap(r, g, b) {
  return r < 41 || (b + 13 >= r && b > g);
}
function write(buf, p, r, g, b) {
  const at = p * 4;
  buf[at] = r;
  buf[at + 1] = g;
  buf[at + 2] = b;
  buf[at + 3] = 255;
}

const foreground = Buffer.alloc(raw.length);
for (let y = 21; y < 1512; y++) {
  for (let x = 206; x < 798; x++) {
    const p = y * width + x;
    if (outside[p] || !raw[p * 4 + 3]) continue;
    const i = p * 4;
    const r = raw[i];
    const g = raw[i + 1];
    const b = raw[i + 2];
    let slot = 'hoodie';
    if (head[p]) slot = hair[p] ? 'hair' : 'head';
    else if ((nearHand[p] || farHand[p]) && (skin(r, g, b) || x < 354 || x > 682)) slot = 'body';
    else if (nearShoe[p]) slot = 'shoe-left';
    else if (farShoe[p]) slot = 'shoe-right';
    else if (belowWaist[p]) slot = 'cargo-pants';
    else if (rearBag[p]) slot = 'backpack-rear';
    else if ((strapNear[p] || strapFar[p]) && (strap(r, g, b) || buckles[p] || farBuckle[p])) slot = 'backpack-straps';
    owner[p] = layer[slot];
    write(foreground, p, r, g, b);
    write(paint[slot], p, r, g, b);
  }
}

// Underpainting is clipped to the occluding layer. Replacements never rely
// on a gap between parts, and none of these new pixels change the assembled look.
function underpaint(slot, points, rgb, hiddenBy) {
  const target = paint[slot];
  const shape = mask(points);
  const hidden = new Set(hiddenBy.map((name) => layer[name]));
  for (let p = 0; p < pixels; p++) {
    if (shape[p] && hidden.has(owner[p])) write(target, p, ...rgb);
  }
}

const upperHidden = ['hoodie', 'backpack-straps'];
const lowerHidden = ['cargo-pants', 'shoe-left', 'shoe-right'];
const under = [
  [
    'body',
    [
      [344, 366],
      [420, 335],
      [491, 315],
      [553, 316],
      [618, 351],
      [663, 368],
      [677, 503],
      [662, 718],
      [367, 718],
      [347, 591],
    ],
    [43, 38, 56],
    upperHidden,
  ],
  [
    'body',
    [
      [405, 359],
      [463, 340],
      [506, 337],
      [559, 341],
      [607, 359],
      [633, 457],
      [589, 509],
      [480, 482],
      [411, 516],
    ],
    [61, 52, 74],
    upperHidden,
  ],
  [
    'body',
    [
      [388, 481],
      [417, 470],
      [457, 603],
      [576, 605],
      [641, 573],
      [654, 654],
      [632, 713],
      [381, 714],
    ],
    [32, 29, 46],
    upperHidden,
  ],
  [
    'body',
    [
      [439, 281],
      [475, 290],
      [511, 310],
      [555, 306],
      [568, 352],
      [545, 376],
      [510, 376],
      [458, 337],
      [433, 318],
    ],
    [190, 110, 75],
    upperHidden,
  ],
  [
    'body',
    [
      [440, 282],
      [471, 292],
      [506, 315],
      [517, 352],
      [499, 350],
      [451, 318],
    ],
    [228, 142, 87],
    upperHidden,
  ],
  [
    'body',
    [
      [334, 393],
      [368, 380],
      [405, 406],
      [398, 449],
      [372, 518],
      [355, 583],
      [347, 730],
      [340, 765],
      [272, 766],
      [261, 712],
      [275, 621],
      [282, 530],
      [304, 445],
    ],
    [192, 111, 79],
    upperHidden,
  ],
  [
    'body',
    [
      [333, 398],
      [363, 387],
      [378, 397],
      [371, 428],
      [340, 455],
      [327, 526],
      [311, 577],
      [302, 701],
      [292, 748],
      [264, 755],
      [265, 706],
      [285, 589],
      [294, 500],
      [306, 448],
    ],
    [238, 155, 98],
    upperHidden,
  ],
  [
    'body',
    [
      [377, 444],
      [396, 424],
      [393, 465],
      [368, 531],
      [354, 596],
      [347, 718],
      [335, 750],
      [320, 745],
      [324, 681],
      [330, 588],
      [350, 520],
    ],
    [151, 74, 65],
    upperHidden,
  ],
  [
    'body',
    [
      [624, 390],
      [652, 384],
      [677, 414],
      [690, 464],
      [695, 529],
      [718, 606],
      [726, 669],
      [736, 743],
      [708, 761],
      [683, 747],
      [684, 659],
      [667, 589],
      [648, 522],
      [633, 466],
    ],
    [171, 88, 66],
    upperHidden,
  ],
  [
    'body',
    [
      [654, 429],
      [678, 413],
      [685, 465],
      [684, 519],
      [704, 598],
      [712, 639],
      [709, 737],
      [692, 749],
      [687, 664],
      [672, 600],
      [662, 535],
    ],
    [222, 130, 81],
    upperHidden,
  ],
  [
    'body',
    [
      [378, 690],
      [655, 698],
      [664, 841],
      [645, 949],
      [639, 1083],
      [653, 1259],
      [644, 1321],
      [550, 1340],
      [523, 1268],
      [523, 1154],
      [508, 1048],
      [503, 971],
      [473, 1004],
      [450, 1122],
      [420, 1247],
      [406, 1337],
      [303, 1344],
      [312, 1260],
      [333, 1194],
      [339, 1080],
      [363, 955],
      [366, 816],
    ],
    [39, 34, 52],
    lowerHidden,
  ],
  [
    'body',
    [
      [382, 726],
      [492, 737],
      [492, 888],
      [457, 991],
      [416, 1161],
      [395, 1249],
      [375, 1304],
      [330, 1304],
      [339, 1176],
      [363, 1044],
      [380, 887],
    ],
    [59, 49, 70],
    lowerHidden,
  ],
  [
    'body',
    [
      [556, 747],
      [641, 735],
      [649, 850],
      [602, 1001],
      [595, 1176],
      [628, 1276],
      [614, 1306],
      [554, 1287],
      [551, 1142],
      [530, 1021],
      [520, 900],
    ],
    [55, 45, 67],
    lowerHidden,
  ],
  [
    'body',
    [
      [310, 1285],
      [403, 1285],
      [404, 1360],
      [301, 1386],
      [294, 1359],
    ],
    [190, 111, 73],
    lowerHidden,
  ],
  [
    'body',
    [
      [531, 1280],
      [634, 1280],
      [643, 1351],
      [554, 1364],
      [524, 1344],
    ],
    [164, 84, 59],
    lowerHidden,
  ],
  [
    'body',
    [
      [321, 1325],
      [391, 1321],
      [389, 1361],
      [400, 1385],
      [417, 1414],
      [430, 1438],
      [425, 1450],
      [412, 1457],
      [355, 1457],
      [329, 1451],
      [300, 1436],
      [298, 1409],
      [309, 1375],
    ],
    [103, 51, 48],
    ['shoe-left'],
  ],
  [
    'body',
    [
      [325, 1329],
      [386, 1325],
      [384, 1363],
      [395, 1385],
      [413, 1415],
      [424, 1437],
      [420, 1447],
      [406, 1452],
      [354, 1452],
      [328, 1445],
      [306, 1432],
      [304, 1410],
      [316, 1374],
    ],
    [202, 118, 76],
    ['shoe-left'],
  ],
  [
    'body',
    [
      [324, 1354],
      [351, 1352],
      [368, 1381],
      [388, 1404],
      [404, 1416],
      [411, 1431],
      [403, 1441],
      [376, 1443],
      [348, 1437],
      [315, 1421],
      [312, 1406],
    ],
    [232, 148, 92],
    ['shoe-left'],
  ],
  [
    'body',
    [
      [540, 1320],
      [609, 1311],
      [624, 1361],
      [648, 1381],
      [688, 1404],
      [704, 1415],
      [713, 1431],
      [706, 1443],
      [677, 1448],
      [625, 1446],
      [582, 1433],
      [544, 1423],
      [527, 1414],
      [524, 1389],
    ],
    [94, 48, 47],
    ['shoe-right'],
  ],
  [
    'body',
    [
      [546, 1324],
      [605, 1318],
      [617, 1364],
      [643, 1388],
      [683, 1409],
      [699, 1419],
      [705, 1431],
      [700, 1438],
      [676, 1442],
      [626, 1440],
      [584, 1427],
      [546, 1417],
      [534, 1406],
      [531, 1390],
    ],
    [184, 99, 67],
    ['shoe-right'],
  ],
  [
    'body',
    [
      [548, 1352],
      [585, 1341],
      [602, 1378],
      [632, 1398],
      [667, 1411],
      [689, 1422],
      [689, 1431],
      [670, 1435],
      [626, 1428],
      [587, 1417],
      [547, 1407],
      [540, 1396],
    ],
    [224, 133, 79],
    ['shoe-right'],
  ],
  [
    'head',
    [
      [437, 208],
      [432, 171],
      [445, 130],
      [466, 101],
      [494, 85],
      [531, 82],
      [561, 91],
      [580, 109],
      [590, 132],
      [574, 159],
      [518, 176],
      [477, 210],
    ],
    [181, 98, 61],
    ['hair'],
  ],
  [
    'head',
    [
      [444, 169],
      [455, 133],
      [479, 103],
      [508, 93],
      [536, 91],
      [562, 102],
      [577, 118],
      [577, 143],
      [544, 156],
      [487, 176],
      [463, 184],
    ],
    [216, 132, 79],
    ['hair'],
  ],
  [
    'head',
    [
      [464, 133],
      [483, 107],
      [502, 99],
      [530, 95],
      [548, 99],
      [558, 110],
      [530, 114],
      [509, 122],
      [483, 144],
      [462, 152],
    ],
    [246, 165, 101],
    ['hair'],
  ],
  [
    'head',
    [
      [438, 209],
      [442, 180],
      [464, 169],
      [483, 176],
      [479, 194],
      [467, 213],
    ],
    [158, 81, 58],
    ['hair'],
  ],
  [
    'backpack-rear',
    [
      [248, 464],
      [263, 402],
      [292, 362],
      [340, 340],
      [371, 342],
      [409, 370],
      [411, 481],
      [343, 589],
      [276, 591],
      [242, 565],
    ],
    [35, 29, 47],
    ['hoodie', 'backpack-straps'],
  ],
  [
    'backpack-rear',
    [
      [261, 432],
      [281, 397],
      [331, 368],
      [353, 372],
      [371, 398],
      [371, 512],
      [327, 554],
      [271, 556],
      [259, 525],
    ],
    [53, 44, 63],
    ['hoodie', 'backpack-straps'],
  ],
  [
    'backpack-rear',
    [
      [289, 429],
      [320, 405],
      [342, 409],
      [344, 505],
      [321, 531],
      [286, 538],
      [278, 505],
    ],
    [40, 33, 51],
    ['hoodie', 'backpack-straps'],
  ],
];
for (const args of under) underpaint(...args);

// Reconstruct crimson cloth behind the narrow strap areas from neighboring
// fabric tones and authored fold shadows. This runs only on missing material;
// the original highlight, stitching and sole pixels remain at their own scale.
const jacket = mask([
  [343, 318],
  [357, 300],
  [416, 303],
  [473, 337],
  [551, 368],
  [603, 328],
  [638, 335],
  [678, 372],
  [693, 458],
  [745, 530],
  [774, 631],
  [777, 708],
  [721, 740],
  [682, 739],
  [655, 731],
  [611, 737],
  [561, 739],
  [477, 724],
  [397, 713],
  [369, 733],
  [338, 743],
  [317, 751],
  [239, 748],
  [215, 709],
  [207, 650],
  [222, 561],
  [252, 489],
  [275, 429],
  [299, 382],
  [339, 351],
  [371, 336],
]);
const fabricFields = [
  [
    [
      [339, 315],
      [444, 332],
      [485, 395],
      [470, 488],
      [421, 586],
      [366, 700],
      [323, 694],
      [339, 555],
      [365, 456],
    ],
    [132, 28, 58],
  ],
  [
    [
      [335, 342],
      [379, 329],
      [425, 343],
      [442, 379],
      [421, 374],
      [405, 360],
      [366, 361],
    ],
    [162, 42, 71],
  ],
  [
    [
      [385, 346],
      [418, 347],
      [434, 370],
      [450, 413],
      [447, 447],
      [425, 437],
      [411, 400],
      [397, 387],
    ],
    [151, 33, 63],
  ],
  [
    [
      [389, 360],
      [411, 358],
      [424, 379],
      [433, 414],
      [426, 427],
      [420, 405],
      [411, 383],
      [396, 375],
    ],
    [171, 45, 70],
  ],
  [
    [
      [420, 367],
      [429, 376],
      [442, 414],
      [443, 456],
      [431, 494],
      [415, 529],
      [402, 550],
      [389, 558],
      [414, 509],
      [424, 473],
      [428, 435],
    ],
    [107, 24, 53],
  ],
  [
    [
      [424, 375],
      [430, 384],
      [441, 423],
      [440, 455],
      [434, 475],
      [428, 443],
      [431, 423],
    ],
    [117, 26, 55],
  ],
  [
    [
      [445, 427],
      [463, 442],
      [456, 480],
      [439, 521],
      [412, 555],
      [414, 533],
      [429, 501],
      [443, 474],
    ],
    [154, 32, 63],
  ],
  [
    [
      [386, 508],
      [405, 506],
      [412, 519],
      [399, 547],
      [378, 578],
      [373, 572],
    ],
    [121, 24, 51],
  ],
  [
    [
      [378, 545],
      [397, 554],
      [393, 580],
      [372, 616],
      [353, 664],
      [346, 649],
      [349, 601],
    ],
    [77, 19, 43],
  ],
  [
    [
      [402, 555],
      [423, 531],
      [414, 557],
      [394, 591],
      [377, 620],
      [363, 652],
      [358, 642],
      [379, 595],
    ],
    [151, 36, 63],
  ],
  [
    [
      [374, 605],
      [397, 579],
      [388, 606],
      [368, 641],
      [362, 664],
      [351, 672],
      [356, 644],
    ],
    [103, 23, 49],
  ],
  [
    [
      [355, 651],
      [373, 644],
      [382, 651],
      [370, 675],
      [361, 696],
      [343, 700],
    ],
    [82, 20, 44],
  ],
  [
    [
      [592, 321],
      [630, 324],
      [647, 350],
      [676, 424],
      [674, 477],
      [651, 565],
      [624, 572],
      [619, 496],
      [619, 417],
    ],
    [128, 27, 57],
  ],
  [
    [
      [606, 331],
      [632, 333],
      [643, 355],
      [649, 381],
      [641, 379],
      [631, 359],
      [617, 348],
    ],
    [161, 37, 67],
  ],
  [
    [
      [624, 359],
      [639, 366],
      [653, 390],
      [664, 431],
      [663, 465],
      [648, 503],
      [638, 518],
      [640, 482],
      [649, 453],
      [645, 410],
    ],
    [145, 32, 60],
  ],
  [
    [
      [639, 423],
      [646, 427],
      [651, 453],
      [645, 487],
      [628, 528],
      [626, 506],
      [635, 465],
    ],
    [105, 23, 49],
  ],
  [
    [
      [650, 479],
      [658, 464],
      [657, 492],
      [647, 532],
      [638, 551],
      [628, 554],
      [634, 527],
    ],
    [142, 33, 57],
  ],
].map(([points, rgb]) => ({ area: mask(points), rgb }));

function seamTone(p, step) {
  for (let q = p + step; Math.abs(q - p) <= 8 && Math.floor(q / width) === Math.floor(p / width); q += step) {
    if (owner[q] !== layer.hoodie) continue;
    const i = q * 4;
    const r = raw[i];
    const g = raw[i + 1];
    const b = raw[i + 2];
    if (r > 42 && r > b + 10 && r > g * 1.4) return q;
  }
  return -1;
}
for (let y = 317; y < 752; y++) {
  for (let x = 250; x < 688; x++) {
    const p = y * width + x;
    if (owner[p] !== layer['backpack-straps'] || !jacket[p]) continue;
    const cell = (y - (y % 3) + 1) * width + x - (x % 3) + 1;
    const fabric = fabricFields.findLast(({ area }) => area[cell])?.rgb ?? [101, 22, 50];
    const edge = seamTone(cell, -1);
    const other = seamTone(cell, 1);
    const match = edge < 0 || (other >= 0 && other - cell < cell - edge) ? other : edge;
    const mix = match < 0 ? 0 : 0.55 * (1 - Math.abs(cell - match) / 9);
    const colors = fabric.map(
      (value, c) => Math.round((value * (1 - mix) + (mix ? raw[match * 4 + c] * mix : 0)) / 3) * 3,
    );
    write(paint.hoodie, p, ...colors);
  }
}

function boundsOf(buf) {
  let left = width;
  let top = height;
  let right = 0;
  let bottom = 0;
  for (let p = 0; p < pixels; p++) {
    if (!buf[p * 4 + 3]) continue;
    const x = p % width;
    const y = Math.floor(p / width);
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x + 1);
    bottom = Math.max(bottom, y + 1);
  }
  if (left >= right || top >= bottom) throw new Error('Empty artwork layer.');
  return { x: left, y: top, width: right - left, height: bottom - top };
}
function encode(buf, bounds) {
  const { x, y, width: w, height: h } = bounds;
  const crop = Buffer.alloc(w * h * 4);
  for (let row = 0; row < h; row++) {
    const start = ((y + row) * width + x) * 4;
    buf.copy(crop, row * w * 4, start, start + w * 4);
  }
  return execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgba',
      '-s',
      `${w}x${h}`,
      '-i',
      '-',
      '-frames:v',
      '1',
      '-c:v',
      'png',
      '-compression_level',
      '9',
      '-pred',
      'mixed',
      '-f',
      'image2pipe',
      '-',
    ],
    { input: crop, maxBuffer: pixels * 4 + 65536 },
  );
}

// Compare the actual ordered composite, including the hidden underpainting,
// to the source after matte extraction. Fail if a seam alters original pixels.
const assembled = Buffer.alloc(raw.length);
for (const name of layers) {
  const image = paint[name];
  for (let i = 0; i < assembled.length; i += 4) {
    if (image[i + 3]) assembled.writeUInt32LE(image.readUInt32LE(i), i);
  }
}
if (!assembled.equals(foreground)) throw new Error('The layer stack changed source pixels.');

mkdirSync(layerFolder, { recursive: true });
const embeds = [];
const assets = [];
for (const name of layers) {
  const bounds = boundsOf(paint[name]);
  const encoded = encode(paint[name], bounds);
  const filename = `${name}.png`;
  writeFileSync(join(layerFolder, filename), encoded);
  embeds.push(
    `  <g id="${name}"><image x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" href="data:image/png;base64,${encoded.toString('base64')}"/></g>`,
  );
  assets.push({ id: name, file: filename, ...bounds });
}
writeFileSync(join(output, 'hd-casual.png'), encode(assembled, { x: 0, y: 0, width, height }));
writeFileSync(
  join(output, 'hd-casual.svg'),
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" image-rendering="pixelated" role="img" aria-labelledby="title">`,
    '  <title id="title">LevelUP Casual — Illustrative Pixel HD</title>',
    ...embeds,
    '</svg>',
    '',
  ].join('\n'),
);
writeFileSync(
  join(layerFolder, 'manifest.json'),
  JSON.stringify(
    {
      width,
      height,
      view: 'front-three-quarter-right',
      slots: {
        hair: ['hair'],
        top: ['hoodie'],
        bottom: ['cargo-pants'],
        footwear: ['shoe-left', 'shoe-right'],
        backpack: ['backpack-rear', 'backpack-straps'],
      },
      anchors: {
        crown: [518, 61],
        neck: [501, 288],
        shoulders: [
          [353, 383],
          [637, 370],
        ],
        wrists: [
          [298, 745],
          [720, 736],
        ],
        waist: [517, 724],
        ankles: [
          [354, 1315],
          [588, 1305],
        ],
        floor: [535, 1499],
      },
      layers: assets,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Wrote ${assets.length} native-resolution layers and checked a pixel-exact composite.`);
