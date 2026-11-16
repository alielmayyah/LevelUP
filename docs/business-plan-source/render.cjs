const { chromium } = require('C:/Users/aliel/Downloads/LevelUP/levelup-frontend/node_modules/playwright');
const path = require('path');
(async () => {
  const [, , html, out, pngDir] = process.argv;
  let browser;
  try { browser = await chromium.launch(); } catch { browser = await chromium.launch({ channel: 'msedge' }); }
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.goto('file:///' + path.resolve(html).replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  if (pngDir) {
    const n = await page.locator('section.page').count();
    for (let i = 0; i < n; i++) await page.locator('section.page').nth(i).screenshot({ path: `${pngDir}/p${i + 1}.png` });
  }
  await browser.close();
  console.log('ok');
})().catch(e => { console.error(e); process.exit(1); });
