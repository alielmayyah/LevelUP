import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [standardPath, inclusivePath] = process.argv.slice(2);
if (!standardPath || !inclusivePath) {
  throw new Error('Usage: node scripts/trace-avatar-sheets.mjs <32-bit sheet.png> <inclusive sheet.png>');
}

const WIDTH = 1536;
const HEIGHT = 1024;
const sheets = [standardPath, inclusivePath].map((path) => {
  const rgb = execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', path, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
    {
      maxBuffer: WIDTH * HEIGHT * 4,
    },
  );
  if (rgb.length !== WIDTH * HEIGHT * 3) throw new Error('The reference sheets must be 1536 × 1024.');
  return rgb;
});

// Crop the front poses inside the panels. The four landmarks are the neck,
// waist, top of the shoes, and ground line in the original illustrations.
// Hips also delimit the arms where their outlines continue past the waist.
const FRAMES = {
  silver: [0, [385, 69, 497, 287], [445, 145, 190, 254], [414, 474]],
  cloud: [0, [512, 69, 617, 287], [567, 143, 198, 260], [545, 593]],
  teal: [0, [630, 68, 735, 287], [689, 144, 189, 258], [663, 711]],
  cap: [0, [749, 69, 859, 287], [801, 143, 201, 260], [782, 833]],
  violet: [0, [865, 69, 974, 285], [924, 145, 200, 257], [898, 949]],
  lilac: [1, [1070, 70, 1156, 258], [1115, 137, 175, 230], [1095, 1130]],
  violetWrap: [1, [788, 71, 883, 258], [833, 143, 178, 230], [814, 859]],
  paleWrap: [1, [897, 71, 990, 256], [944, 143, 177, 229], [923, 972]],
  amber: [1, [541, 812, 620, 976], [585, 864, 905, 952], [562, 605]],
  curlyHead: [0, [1067, 352, 1181, 448], [1126, 448, 449, 450], [1090, 1150]],
  buzzHead: [0, [852, 357, 939, 447], [895, 447, 448, 449], [868, 919]],
  sideHead: [0, [727, 353, 838, 446], [783, 446, 447, 448], [754, 812]],
  waveHead: [0, [625, 354, 717, 446], [671, 446, 447, 448], [642, 697]],
};

// Coordinates inside each crop. Glasses and expressions use the same landmarks
// as the material masks, so an accessory follows the original pose of the face.
const FACES = {
  silver: {
    eyes: [
      [48, 55],
      [68, 54],
    ],
    mouth: [57, 67],
    jaw: [58, 74],
    cheeks: [28, 76],
    brow: 42,
  },
  cloud: {
    eyes: [
      [49, 51],
      [66, 51],
    ],
    mouth: [57, 63],
    jaw: [58, 70],
    cheeks: [28, 75],
    brow: 41,
  },
  teal: {
    eyes: [
      [51, 56],
      [71, 56],
    ],
    mouth: [60, 68],
    jaw: [59, 74],
    cheeks: [30, 82],
    brow: 44,
  },
  cap: {
    eyes: [
      [50, 47],
      [72, 48],
    ],
    mouth: [61, 62],
    jaw: [60, 73],
    cheeks: [28, 82],
    brow: 36,
  },
  violet: {
    eyes: [
      [48, 51],
      [69, 48],
    ],
    mouth: [58, 63],
    jaw: [58, 70],
    cheeks: [28, 77],
    brow: 38,
  },
  lilac: {
    eyes: [
      [35, 35],
      [51, 35],
    ],
    mouth: [43, 46],
    jaw: [43, 51],
    cheeks: [28, 57],
    brow: 25,
  },
  violetWrap: {
    eyes: [
      [38, 35],
      [53, 35],
    ],
    mouth: [46, 46],
    jaw: [47, 51],
    cheeks: [31, 59],
    brow: 24,
  },
  paleWrap: {
    eyes: [
      [34, 35],
      [50, 35],
    ],
    mouth: [42, 45],
    jaw: [42, 51],
    cheeks: [29, 53],
    brow: 25,
  },
  amber: {
    eyes: [
      [47, 25],
      [60, 25],
    ],
    mouth: [54, 33],
    jaw: [54, 39],
    cheeks: [43, 63],
    brow: 16,
  },
  curlyHead: {
    eyes: [
      [48, 68],
      [77, 68],
    ],
    mouth: [61, 81],
    jaw: [61, 89],
    cheeks: [28, 90],
    brow: 50,
  },
  buzzHead: {
    eyes: [
      [33, 63],
      [60, 63],
    ],
    mouth: [46, 77],
    jaw: [45, 84],
    cheeks: [9, 80],
    brow: 36,
  },
  sideHead: {
    eyes: [
      [46, 66],
      [74, 66],
    ],
    mouth: [58, 80],
    jaw: [60, 89],
    cheeks: [27, 91],
    brow: 42,
  },
  waveHead: {
    eyes: [
      [36, 67],
      [61, 67],
    ],
    mouth: [48, 80],
    jaw: [48, 89],
    cheeks: [25, 78],
    brow: 42,
  },
};

// Shoe collar centers, wrist-to-hand boundaries, and the first exposed sock row.
// These are measured from the individual drawings, including their asymmetry.
const BODY = {
  silver: [[31, 71], 129, 176],
  cloud: [[38, 76], 130, 187],
  teal: [[35, 77], 130, 176],
  cap: [[39, 76], 131, 187],
  violet: [[38, 73], 129, 182],
  lilac: [[30, 63], 108, 155],
  violetWrap: [[30, 60], 107, 154],
  paleWrap: [[30, 67], 106, 154],
  amber: [[26, 56], 94, 136],
};

const luminance = ([r, g, b]) => (r * 2 + g * 5 + b) / 8;
const isWarm = ([r, g, b]) => r > 68 && g > 26 && r > g + 10 && g > b + 5 && r > b + 25;
const isSkin = ([r, g, b]) => r > 91 && g > 45 && r > g + 13 && r > b + 20 && g > b - 3;
const distance = (a, b) => Math.max(...a.map((c, i) => Math.abs(c - b[i])));
const average = (pixels) =>
  [0, 1, 2].map((channel) => Math.round(pixels.reduce((sum, p) => sum + p[channel], 0) / pixels.length));

function paletteFor(pixels, max) {
  const boxes = [pixels];
  while (boxes.length < max) {
    let target = -1;
    let maxSpan = 0;
    let component = 0;
    boxes.forEach((box, i) => {
      if (box.length < 10) return;
      for (let k = 0; k < 3; k++) {
        const values = box.map((pixel) => pixel.rgb[k]);
        const span = (Math.max(...values) - Math.min(...values)) * Math.sqrt(box.length);
        if (span > maxSpan) {
          target = i;
          maxSpan = span;
          component = k;
        }
      }
    });
    if (target < 0) break;
    const sorted = boxes[target].sort((a, b) => a.rgb[component] - b.rgb[component]);
    const middle = sorted.length >> 1;
    boxes.splice(target, 1, sorted.slice(0, middle), sorted.slice(middle));
  }
  return boxes;
}

function trace(name, [sheet, bounds, landmarks, hips]) {
  const [x0, y0, x1, y1] = bounds;
  const [center, neck, waist, ankle] = landmarks;
  const w = x1 - x0;
  const h = y1 - y0;
  const face = FACES[name];
  const [feet, handRow, sockRow] = BODY[name] ?? [[0, 0], h, h];
  const rgb = sheets[sheet];
  const at = (x, y) => Array.from(rgb.subarray((WIDTH * y + x) * 3, (WIDTH * y + x) * 3 + 3));
  const colors = [];
  const body = new Uint8Array(w * h);
  const border = [x0 - 3, x0 - 2, x0 - 1, x0, x1 - 1, x1, x1 + 1, x1 + 2];
  const panel = average(border.map((x) => at(x, y0)));
  for (let y = y0; y < y1; y++) {
    // An arm or shoe can touch the crop, so use the background samples that
    // match the clear panel instead of averaging in those foreground pixels.
    const edge = border.map((x) => at(x, y)).sort((a, b) => distance(a, panel) - distance(b, panel));
    const bg = average(edge.slice(0, 4));
    for (let x = x0; x < x1; x++) {
      const pixel = at(x, y);
      colors.push(pixel);
      // The panels are almost uniform, while the sprite's ink is darker.
      if (distance(pixel, bg) > (y > ankle + 19 ? 15 : 11)) body[(y - y0) * w + x - x0] = 1;
    }
  }

  // Keep the largest connected sprite and fill enclosed one-pixel gaps where
  // a shadow within the artwork happens to match the panel background.
  const seen = new Uint8Array(w * h);
  let biggest = [];
  for (let i = 0; i < body.length; i++) {
    if (!body[i] || seen[i]) continue;
    const component = [i];
    seen[i] = 1;
    for (let j = 0; j < component.length; j++) {
      const cursor = component[j];
      const x = cursor % w;
      const y = Math.floor(cursor / w);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const adjacent = cursor + dy * w + dx;
          if (x + dx >= 0 && x + dx < w && y + dy >= 0 && y + dy < h && body[adjacent] && !seen[adjacent]) {
            seen[adjacent] = 1;
            component.push(adjacent);
          }
        }
      }
    }
    if (component.length > biggest.length) biggest = component;
  }
  body.fill(0);
  for (const i of biggest) body[i] = 1;
  for (let i = w + 1; i < body.length - w - 1; i++) {
    if (!body[i] && body[i - 1] && body[i + 1] && body[i - w] && body[i + w]) body[i] = 1;
  }

  const covered = ['lilac', 'violetWrap', 'paleWrap', 'amber'].includes(name);
  const groups = new Map();
  for (let i = 0; i < body.length; i++) {
    if (!body[i]) continue;
    const x = x0 + (i % w);
    const y = y0 + Math.floor(i / w);
    const p = colors[i];
    const light = luminance(p);
    const warm = isWarm(p);
    const localX = x - x0;
    const localY = y - y0;
    const outsideHips = x < hips[0] || x > hips[1];
    const hand = y >= waist && y < Math.max(waist + 14, y0 + handRow + 16) && outsideHips;
    const backHair = name === 'teal' && localY < 87 && localX < 39 && !isSkin(p) && light < 103;
    const collar =
      (((name === 'cloud' && localY >= 66) ||
        (name === 'violet' && localY >= 66) ||
        (name === 'cap' && localY >= 68)) &&
        localX < face.jaw[0] - 13) ||
      ((name === 'cloud' || name === 'violet') && localY >= 70 && localX > face.jaw[0] + 13);
    const region =
      (y < neck && !collar) || backHair ? 'head' : y < waist || hand ? 'top' : y < ankle ? 'legs' : 'shoes';
    let paint = 'ink';
    if (light > 16) {
      if (region === 'head') {
        const large = !BODY[name];
        const dx = large ? 5 : 3.5;
        const dy = large ? 6 : 4;
        const [mx, my] = face.mouth;
        const eye = face.eyes.some(([cx, cy]) => Math.abs(localX - cx) <= dx && Math.abs(localY - cy) <= dy);
        const eyeSocket = face.eyes.some(
          ([cx, cy]) => Math.abs(localX - cx) <= dx * 1.85 && Math.abs(localY - cy) <= dy * 1.4,
        );
        const mouth = Math.abs(localX - mx) <= dx * 1.65 && Math.abs(localY - my) <= dy * 0.7;
        const inFace =
          localY >= face.brow && localY <= face.jaw[1] && localX >= face.cheeks[0] && localX <= face.cheeks[1];
        const paleCheek = name === 'paleWrap' && p[0] > 130 && p[0] > p[2] + 6 && p[0] > p[1] + 10;
        const beard = name === 'cap' && localY >= 55 && localX >= 40 && localX <= 78 && !isSkin(p);
        if (eye && light < 80 && Math.max(...p) - Math.min(...p) < 60) paint = 'iris';
        else if (!beard && mouth && p[0] > p[1] + 27 && light < 154) paint = 'mouth';
        else if (beard) paint = 'beard';
        else if (inFace && !backHair && (isSkin(p) || paleCheek)) paint = 'skin';
        else if (eyeSocket && (light < 57 || (light > 159 && Math.max(...p) - Math.min(...p) < 44))) paint = 'ink';
        else if (name === 'amber' && light > 90 && p[1] > p[2] + 35) paint = 'top';
        else if (light > 32 || p[2] > p[0] + 9) paint = covered ? 'hijab' : 'hair';
      } else if (region === 'top') {
        const bareTop = name === 'silver' || name === 'teal';
        const arm = bareTop && localY < handRow - 10 && (localX < face.jaw[0] - 12 || localX > face.jaw[0] + 15);
        const wrist = localY >= handRow && outsideHips && localY < handRow + 19;
        const bareNeck = bareTop && Math.abs(localX - face.jaw[0]) < 16 && localY < neck - y0 + 10;
        const midriff = name === 'teal' && localY >= 112 && localY < 122 && !outsideHips;
        if (isSkin(p) && (wrist || arm || bareNeck || midriff)) paint = 'skin';
        else if (name === 'silver' && !outsideHips && localY < 111 && p[1] > 115 && p[0] > 145 && p[2] < 110)
          paint = 'crest';
        else paint = 'top';
      } else if (region === 'legs') {
        if ((name === 'silver' || name === 'teal') && localY > (name === 'silver' ? 155 : 144) && warm) paint = 'skin';
        else if (localY >= sockRow && light > 104 && Math.max(...p) - Math.min(...p) < 68) paint = 'socks';
        else paint = 'pants';
      } else if (Math.max(...p) - Math.min(...p) > 25 || light < 105) {
        paint = 'shoes';
      }
    }
    const key = region + '/' + paint;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ i, rgb: p });
  }

  const entries = [];
  // A common base64 boundary keeps matching runs compressible across rows.
  const stride = Math.ceil(w / 3) * 3;
  const pixels = Buffer.alloc(stride * h);
  for (const [key, group] of groups) {
    const [region, paint] = key.split('/');
    const centerLight = luminance(average(group.map(({ rgb }) => rgb)));
    const shadeCount = paint === 'skin' || paint === 'hair' || paint === 'hijab' ? 8 : paint === 'ink' ? 4 : 5;
    const colors = paletteFor(group, shadeCount).map((cluster) => average(cluster.map(({ rgb }) => rgb)));
    const first = entries.length + 1;
    for (const color of colors) {
      const hex = color.map((channel) => channel.toString(16).padStart(2, '0')).join('');
      entries.push([region, paint, hex, Math.round(luminance(color) - centerLight)]);
    }
    for (const { i, rgb } of group) {
      let nearest = 0;
      let smallest = Infinity;
      colors.forEach((color, index) => {
        const error = color.reduce((sum, channel, k) => sum + (channel - rgb[k]) ** 2, 0);
        if (error < smallest) {
          nearest = index;
          smallest = error;
        }
      });
      pixels[Math.floor(i / w) * stride + (i % w)] = first + nearest;
    }
  }
  if (entries.length > 255) throw new Error('Palette index overflow: ' + name);
  return {
    w,
    h,
    center: center - x0,
    neck: neck - y0,
    waist: waist - y0,
    ankle: ankle - y0,
    belt: hips.map((x) => x - x0),
    feet,
    face: { eyes: face.eyes, mouth: face.mouth, jaw: face.jaw },
    palette: entries,
    pixels: pixels.toString('base64'),
  };
}

const sprites = Object.fromEntries(Object.entries(FRAMES).map(([name, frame]) => [name, trace(name, frame)]));
writeFileSync(new URL('../src/avatar/referenceSprites.json', import.meta.url), JSON.stringify(sprites));
