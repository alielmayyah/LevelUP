import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const inputs = fileURLToPath(new URL('../art/avatar/cartoon/', import.meta.url));
const output = fileURLToPath(new URL('../public/avatar/cartoon-portrait/', import.meta.url));
const size = 418;
const pixels = size * size;
const maxBuffer = pixels * 4 + 65536;
const portraits = [
  {
    prefix: '',
    looks: ['curls', 'fade', 'swept'],
    eyes: [170, 245, 191.5],
    shirt: 319,
    hoodie: 287,
    jacket: 304,
    headLimit: 382,
  },
  {
    prefix: 'girl-',
    looks: ['curls', 'bob', 'bun', 'hijab'],
    eyes: [172, 244, 181.5],
    shirt: 307,
    hoodie: 281,
    jacket: 286,
    headLimit: 370,
  },
];

function read(name) {
  const image = execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', join(inputs, `${name}.webp`), '-frames:v', '1', '-pix_fmt', 'rgba', '-f', 'rawvideo', '-'],
    { maxBuffer },
  );
  if (image.length !== pixels * 4) throw new Error(`${name} must be ${size} × ${size}.`);
  return image;
}

function write(name, image) {
  if (!image.some((value, index) => index % 4 === 3 && value > 0)) throw new Error(`Empty avatar layer: ${name}.`);
  const webp = execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgba',
      '-s',
      `${size}x${size}`,
      '-i',
      '-',
      '-frames:v',
      '1',
      '-c:v',
      'libwebp',
      '-lossless',
      '1',
      '-quality',
      '94',
      '-compression_level',
      '6',
      '-f',
      'webp',
      '-',
    ],
    { input: image, maxBuffer },
  );
  writeFileSync(join(output, `${name}.webp`), webp);
}

function smooth(low, high, value) {
  const t = Math.min(1, Math.max(0, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

const alpha = (value) => Math.round(Math.min(1, Math.max(0, (value - 14) / 238)) * 255);
const luminance = (image, i) => image[i] * 0.2126 + image[i + 1] * 0.7152 + image[i + 2] * 0.0722;

/** Follow the gray fabric from the bottom so dark hair is never part of a jacket. */
function fabric(image, top, maxWarmth = 37) {
  const mask = new Uint8Array(pixels);
  const queue = new Uint32Array(pixels);
  let end = 0;
  function visit(p) {
    if (p < top * size || p >= pixels || mask[p]) return;
    const i = p * 4;
    if (!alpha(image[i + 3]) || image[i] - image[i + 2] > maxWarmth) return;
    mask[p] = 1;
    queue[end++] = p;
  }
  // The transparent safety margin can leave the final scanline completely empty.
  for (let p = pixels - size * 36; p < pixels; p++) visit(p);
  for (let start = 0; start < end; start++) {
    const p = queue[start];
    if (p % size) visit(p - 1);
    if (p % size < size - 1) visit(p + 1);
    visit(p - size);
    visit(p + size);
  }
  return mask;
}

function put(target, source, p, opacity) {
  if (opacity < 1) return;
  const i = p * 4;
  source.copy(target, i, i, i + 3);
  target[i + 3] = opacity;
}

/** A soft ellipse for each iris. Each family has a fixed eye line. */
function eyeWeight([left, right, line], x, y, radiusX, radiusY) {
  const dx = Math.min(Math.abs(x - left), Math.abs(x - right));
  return 1 - smooth(0.77, 1.06, Math.hypot(dx / radiusX, (y - line) / radiusY));
}

function buildHead(family, look, shaven) {
  const name = `${family.prefix}${look}`;
  const female = family.prefix === 'girl-';
  const hijab = look === 'hijab';
  const image = look === 'swept' ? shaven : read(name);
  const cloth = hijab ? null : fabric(image, family.shirt, female ? 29 : 37);
  const headLimit = hijab ? 389 : family.headLimit;
  const head = Buffer.alloc(image.length);
  const skin = Buffer.alloc(image.length);
  const hair = Buffer.alloc(image.length);
  const irises = Buffer.alloc(image.length);
  for (let p = 0; p < pixels; p++) {
    const i = p * 4;
    const opacity = alpha(image[i + 3]);
    const x = p % size;
    const y = Math.floor(p / size);
    if (!opacity || cloth?.[p] || y >= headLimit) continue;
    put(head, image, p, opacity);

    const r = image[i];
    const b = image[i + 2];
    const light = luminance(image, i);
    const edgeDistance = Math.min(x, size - x);
    const forehead = female ? 95 : look === 'curls' ? 104 : 100;
    const exposed = Math.max(smooth(forehead, forehead + 9, y) * smooth(110, 135, edgeDistance), smooth(176, 184, y));
    const warmth = smooth(38, 69, r - b) * smooth(91, 149, r);
    // Longer hair follows the cheek and jaw below the ears. Protect the face
    // so a light hair palette never paints into her lips, brows, or eyes.
    const side = female ? 115 + Math.max(0, y - 214) * 0.73 : 121;
    const scalpEnd = female ? 312 : 274;
    const crown = female ? 1 - smooth(141, 157, y) : 1 - smooth(148, 166, y);
    const scalpArea = Math.max(
      crown,
      (1 - smooth(side, side + 24, edgeDistance)) * (1 - smooth(scalpEnd - 23, scalpEnd, y)),
    );
    const scalpHair = hijab ? 0 : scalpArea * (1 - exposed * smooth(135, 177, r));
    const beardArea = smooth(221, 242, y) * (1 - smooth(321, 327, y)) * smooth(119, 132, edgeDistance);
    // The male clean-shaven master aligns with the beard variants.
    const beardHair = shaven ? beardArea * smooth(30, 91, luminance(shaven, i) - light) * (1 - smooth(126, 170, r)) : 0;

    // Include the warm antialiasing around the ink. The master already contains
    // the interpolated edges, so spreading the masks would reveal a second edge.
    const eyeGuard = eyeWeight(family.eyes, x, y, 12.2, 12.6) * (1 - smooth(126, 170, r));
    const complexion = exposed * warmth * (1 - scalpHair) * (1 - eyeGuard);
    put(skin, image, p, Math.round(opacity * complexion));
    // The hijab master contains grayscale cloth and a warm face, with no outfit.
    const headwear = hijab ? (1 - smooth(11, 26, r - b)) * (1 - smooth(118, 178, light)) : 0;
    const hairOrScarf = hijab ? headwear : Math.max(scalpHair, beardHair) * smooth(24, 62, light);
    put(hair, image, p, Math.round(opacity * hairOrScarf));
    const iris =
      eyeWeight(family.eyes, x, y, 10.7, 11.4) *
      smooth(25, 56, r - b) *
      smooth(23, 53, light) *
      (1 - smooth(132, 175, r));
    put(irises, image, p, Math.round(opacity * iris));
  }
  write(`${name}-head`, head);
  write(`${name}-skin`, skin);
  write(`${name}-${hijab ? 'scarf' : 'hair'}`, hair);
  write(`${name}-eyes`, irises);
}

function buildOutfit(family, name, source, top) {
  const image = read(`${family.prefix}${source}`);
  const mask = fabric(image, top, family.prefix ? 29 : 37);
  const outfit = Buffer.alloc(image.length);
  for (let p = 0; p < pixels; p++) {
    if (mask[p]) put(outfit, image, p, alpha(image[p * 4 + 3]));
  }
  write(`${family.prefix}${name}`, outfit);
}

mkdirSync(output, { recursive: true });
for (const family of portraits) {
  const shaven = family.prefix ? null : read('swept');
  for (const look of family.looks) buildHead(family, look, shaven);
  buildOutfit(family, 'tee', 'curls', family.shirt);
  buildOutfit(family, 'hoodie', 'hoodie', family.hoodie);
  buildOutfit(family, 'jacket', 'jacket', family.jacket);
}
