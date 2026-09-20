require('dotenv').config();
const cron = require('node-cron');
const db = require('./database');
const { scrapeProduct } = require('./scraper');

console.log('🤖 Starting background Cron Job for Web Scraper...');
console.log('🕒 Schedule: Every 2 hours ("0 */2 * * *")');

// Schedule tasks to be run on the server.
// "0 */2 * * *" means at minute 0 past every 2nd hour
cron.schedule('0 */2 * * *', async () => {
  console.log(`\n[CRON] Running scheduled scrape at ${new Date().toISOString()}`);
  try {
    const products = await db.getTrackedProducts();
    if (products.length === 0) {
      console.log('[CRON] No tracked products found. Skipping.');
      return;
    }

    console.log(`[CRON] Found ${products.length} product(s) to scrape.`);

    for (const product of products) {
      console.log(`[CRON] Scraping: ${product.product_name}`);
      const scrapeResult = await scrapeProduct(product.product_url);
      await db.performAndLogScrape(product.id, scrapeResult);
    }
    
    console.log(`[CRON] Scheduled scrape completed.`);
  } catch (error) {
    console.error('[CRON] Scheduled scrape failed:', error);
  }
});
