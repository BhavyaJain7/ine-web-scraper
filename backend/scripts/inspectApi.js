// Final test: does a HEADED (non-headless) browser get the price?
// The isTrusted check may specifically block headless mode
const { chromium } = require('playwright');

(async () => {
  // Run HEADED to see if isTrusted works with real browser
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const networkCalls = [];
  page.on('response', async r => {
    const url = r.url();
    if (!url.includes('.js') && !url.includes('.css') && !url.includes('favicon')) {
      let body = '';
      try { body = await r.text(); } catch(e) {}
      networkCalls.push({ url, body: body.substring(0, 200) });
    }
  });

  await page.goto('https://demo.inelabteamdev.com/product/566', { waitUntil: 'networkidle' });
  
  // Accept cookies
  try {
    const btn = page.locator('button[aria-label="Accept cookies"]');
    await btn.waitFor({ state: 'visible', timeout: 3000 });
    await btn.click();
    await page.waitForTimeout(500);
  } catch(e) {}

  networkCalls.length = 0; // reset

  // Move mouse over price block and wait for price to load
  const box = await page.locator('.price-block').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  }
  await page.waitForTimeout(5000);

  console.log('Network calls after hover:', JSON.stringify(networkCalls, null, 2));

  const priceHtml = await page.locator('.price-block').innerHTML();
  console.log('Price block HTML:', priceHtml.substring(0, 500));
  
  await page.screenshot({ path: 'headed_result.png' });
  await browser.close();
})().catch(console.error);
