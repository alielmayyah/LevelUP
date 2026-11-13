// Fails when a color literal appears in src/**/*.{ts,tsx,css} outside src/theme/ and src/brand.config.ts.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const allowed = (rel) => rel.startsWith(`theme${sep}`) || rel === 'brand.config.ts';
const pattern = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi;

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) files.push(full);
  }
};
walk(root);

const hits = [];
for (const file of files) {
  const rel = relative(root, file);
  if (allowed(rel)) continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (pattern.test(line)) hits.push(`src${sep}${rel}:${i + 1}: ${line.trim()}`);
      pattern.lastIndex = 0;
    });
}

if (hits.length) {
  console.error('Color literals found outside src/theme/ and brand.config.ts:\n' + hits.join('\n'));
  process.exit(1);
}
console.log(`check-colors: ${files.length} files clean`);
