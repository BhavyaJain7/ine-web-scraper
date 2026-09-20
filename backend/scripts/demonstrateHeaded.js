const { scrapeProductHeaded } = require('../headedScraper');

async function runDemo() {
  console.log('========== HEADED SCRAPER DEMONSTRATION ==========');
  console.log('This will open a browser window to demonstrate the scrape process.');
  
  // A valid URL to test
  const validUrl = 'https://demo.inelabteamdev.com/';
  console.log(`\n1. Testing with valid URL: ${validUrl}`);
  await scrapeProductHeaded(validUrl);

  // An invalid URL to demonstrate retries and failure
  const invalidUrl = 'https://demo.inelabteamdev.com/invalid-product-page-for-testing';
  console.log(`\n2. Testing with invalid URL to demonstrate retries and error handling: ${invalidUrl}`);
  await scrapeProductHeaded(invalidUrl);
  
  console.log('\n========== DEMONSTRATION COMPLETE ==========');
}

runDemo().catch(console.error);
