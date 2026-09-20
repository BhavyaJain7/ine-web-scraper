const { chromium } = require('playwright');

async function getDom() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://demo.inelabteamdev.com/product/566', { waitUntil: 'networkidle' });
  
  // Click cookie banner if present
  try {
    const acceptBtn = page.locator('button[aria-label="Accept cookies"]');
    await acceptBtn.waitFor({ state: 'visible', timeout: 5000 });
    await acceptBtn.click();
    await page.waitForTimeout(500); // Wait for modal to disappear
  } catch (e) {
    console.log("No cookie banner found or failed to click:", e.message);
  }

  await page.hover('.price-block', { force: true });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'hover_test.png' });
  const html = await page.content();
  console.log(html);
  await browser.close();
}

getDom();
