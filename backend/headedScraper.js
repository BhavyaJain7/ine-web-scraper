const { chromium } = require('playwright');
const { SCRAPE_CONFIG } = require('./scraper');

/**
 * Headed scraper to demonstrate UI scraping, handling slow/failing responses.
 * Uses Playwright to physically launch a browser window.
 */
async function scrapeProductHeaded(productUrl) {
  let browser;
  let lastError = null;

  for (let attempt = 1; attempt <= SCRAPE_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`[Headed Attempt ${attempt}/${SCRAPE_CONFIG.maxRetries}] Launching browser for: ${productUrl}`);
      
      // Launch headed browser
      browser = await chromium.launch({ headless: false, slowMo: 500 });
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Simulate slow response by waiting if we are demonstrating failures
      console.log('Navigating to page...');
      
      const response = await page.goto(productUrl, { timeout: SCRAPE_CONFIG.timeout, waitUntil: 'domcontentloaded' });
      
      if (!response || !response.ok()) {
         throw new Error(`HTTP ${response ? response.status() : 'Unknown'}`);
      }

      // Handle cookie banner overlay which blocks hover events
      try {
        console.log('Checking for cookie banner...');
        const acceptBtn = page.locator('button[aria-label="Accept cookies"]');
        await acceptBtn.waitFor({ state: 'visible', timeout: 5000 });
        await acceptBtn.click();
        await page.waitForTimeout(500); // Wait for modal to disappear
      } catch (e) {
        // No cookie banner found, proceed
      }

      console.log('Hovering to reveal price...');
      await page.hover('.price-block', { force: true });
      await page.waitForTimeout(2000);

      // Extract price
      console.log('Extracting price...');
      const priceText = await page.locator('.price, [data-price], .product-price').first().innerText({ timeout: 5000 }).catch(() => null);
      let price = null;
      if (priceText) {
          const priceMatch = priceText.match(/[\d.]+/);
          price = priceMatch ? parseFloat(priceMatch[0]) : null;
      }
      
      // Extract stock
      console.log('Extracting stock...');
      const stockText = await page.locator('.stock, [data-stock], .product-stock').first().innerText({ timeout: 5000 }).catch(() => null);
      let stock = null;
      if (stockText) {
         const stockMatch = stockText.match(/\d+/);
         if (stockMatch) stock = parseInt(stockMatch[0], 10);
      } else {
         const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
         if (pageText.includes('out of stock')) stock = 0;
         else if (pageText.includes('in stock')) stock = 1;
      }

      if (price === null || stock === null) {
         throw new Error('Could not extract valid price or stock');
      }

      console.log(`[Headed Success] Price: $${price}, Stock: ${stock}`);
      await browser.close();
      return { success: true, price, stock, error: null };

    } catch (error) {
      lastError = error.message;
      console.error(`[Headed Attempt ${attempt} Failed] ${lastError}`);
      
      if (browser) {
         await browser.close();
      }

      if (attempt < SCRAPE_CONFIG.maxRetries) {
         const delayMs = SCRAPE_CONFIG.retryDelays[attempt - 1];
         console.log(`Waiting ${delayMs}ms before retry...`);
         await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  console.error(`[Final Headed Failure] After ${SCRAPE_CONFIG.maxRetries} attempts: ${lastError}`);
  return { success: false, price: null, stock: null, error: lastError };
}

module.exports = { scrapeProductHeaded };
