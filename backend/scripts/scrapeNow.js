require('dotenv').config();
const db = require('../database');
const { scrapeProduct } = require('../scraper');

async function scrapeNow() {
  console.log('========== MANUAL SCRAPE ALL RUN ==========');
  try {
    const products = await db.getTrackedProducts();
    if (products.length === 0) {
      console.log('No tracked products found.');
      return;
    }

    for (const product of products) {
      console.log(`\nScraping: ${product.product_name}`);
      const scrapeResult = await scrapeProduct(product.product_url);
      await db.performAndLogScrape(product.id, scrapeResult);
    }
    
    console.log(`\n========== COMPLETED: ${products.length} products ==========`);
    process.exit(0);
  } catch (error) {
    console.error('Manual scrape failed:', error);
    process.exit(1);
  }
}

scrapeNow();
