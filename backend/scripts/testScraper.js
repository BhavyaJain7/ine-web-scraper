/**
 * Test script to verify scraper works correctly
 * Usage: node scripts/testScraper.js
 */

const { scrapeProduct } = require('../scraper');
require('dotenv').config();

async function testScraper() {
  console.log('========== SCRAPER TEST ==========\n');

  // Test with a mock store product page
  const testUrl = 'https://demo.inelabteamdev.com/product/566';

  console.log(`Testing scrape at: ${testUrl}\n`);

  const result = await scrapeProduct(testUrl, 3); // 3 retries

  console.log('\nTest Result:');
  console.log(JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('\n✅ Scraper test PASSED');
    process.exit(0);
  } else {
    console.log('\n❌ Scraper test FAILED');
    process.exit(1);
  }
}

testScraper().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
