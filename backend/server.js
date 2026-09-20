require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { scrapeProduct } = require('./scraper');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============= SEARCH ENDPOINT =============
/**
 * Search the mock store for products by name.
 * NOTE: The store's /api/catalog?q= parameter is IGNORED server-side — it always
 * returns items in random order regardless of the query. We must fetch all pages
 * and filter client-side.
 * GET /api/search?q=product_name
 */
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.status(400).json({ error: 'Search query required' });
    }

    console.log(`Searching mock store catalog for: "${query}"`);

    const PAGE_SIZE = 60; // Max the API supports
    const matched = [];

    // Fetch page 1 first to discover total page count
    const firstPage = await axios.get(
      `https://demo.inelabteamdev.com/api/catalog?page=1&pageSize=${PAGE_SIZE}`,
      { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const totalPages = firstPage.data.pages || 1;
    console.log(`Total catalog pages: ${totalPages}`);

    // Filter first page
    for (const item of (firstPage.data.items || [])) {
      if (item.name.toLowerCase().includes(query.toLowerCase())) {
        matched.push({
          id: item.id,
          name: item.name,
          brand: item.brand,
          category: item.category,
          sku: item.sku,
          url: `https://demo.inelabteamdev.com/product/${item.id}`,
          image: '',
          searchRelevance: item.name.toLowerCase().startsWith(query.toLowerCase()) ? 1 : 0
        });
      }
      // Stop early if we have enough results
      if (matched.length >= 20) break;
    }

    // If not enough results, fetch remaining pages in parallel (up to page 17 max)
    if (matched.length < 20 && totalPages > 1) {
      const pageNums = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const pageRequests = pageNums.map(p =>
        axios.get(
          `https://demo.inelabteamdev.com/api/catalog?page=${p}&pageSize=${PAGE_SIZE}`,
          { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
        ).catch(() => null)
      );

      const pages = await Promise.all(pageRequests);
      for (const page of pages) {
        if (!page?.data?.items) continue;
        for (const item of page.data.items) {
          if (item.name.toLowerCase().includes(query.toLowerCase())) {
            matched.push({
              id: item.id,
              name: item.name,
              brand: item.brand,
              category: item.category,
              sku: item.sku,
              url: `https://demo.inelabteamdev.com/product/${item.id}`,
              image: '',
              searchRelevance: item.name.toLowerCase().startsWith(query.toLowerCase()) ? 1 : 0
            });
          }
        }
        if (matched.length >= 20) break;
      }
    }

    // Sort: exact-start matches first, then alphabetical
    matched.sort((a, b) => {
      if (b.searchRelevance !== a.searchRelevance) return b.searchRelevance - a.searchRelevance;
      return a.name.localeCompare(b.name);
    });

    const results = matched.slice(0, 20);
    console.log(`Found ${results.length} matching products for "${query}"`);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Failed to search products', details: error.message });
  }
});

// ============= TRACK PRODUCT ENDPOINT =============
/**
 * Add a product to tracked list
 * POST /api/track
 * Body: { productName, productUrl, productImage }
 */
app.post('/api/track', async (req, res) => {
  try {
    const { productName, productUrl, productImage } = req.body;

    if (!productName || !productUrl) {
      return res.status(400).json({ error: 'Product name and URL required' });
    }

    const product = await db.addTrackedProduct(productName, productUrl, productImage);

    if (!product) {
      return res.status(500).json({ error: 'Failed to track product' });
    }

    console.log(`Tracked new product: ${productName}`);
    res.json({ success: true, product });
  } catch (error) {
    console.error('Track error:', error.message);
    res.status(500).json({ error: 'Failed to track product', details: error.message });
  }
});

// ============= GET TRACKED PRODUCTS =============
/**
 * Get all tracked products
 * GET /api/products
 */
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getTrackedProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error.message);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// ============= DELETE PRODUCT =============
/**
 * Delete a tracked product
 * DELETE /api/products/:productId
 */
app.delete('/api/products/:productId', async (req, res) => {
  try {
    const success = await db.deleteTrackedProduct(req.params.productId);
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============= PRICE HISTORY =============
/**
 * Get price history for a product
 * GET /api/history/:productId
 */
app.get('/api/history/:productId', async (req, res) => {
  try {
    const history = await db.getPriceHistory(req.params.productId);
    res.json({ success: true, history });
  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// ============= SCRAPE LOG =============
/**
 * Get scrape log for a product
 * GET /api/scrape-log/:productId
 */
app.get('/api/scrape-log/:productId', async (req, res) => {
  try {
    const log = await db.getScrapeLog(req.params.productId);
    res.json({ success: true, log });
  } catch (error) {
    console.error('Scrape log error:', error.message);
    res.status(500).json({ error: 'Failed to get scrape log' });
  }
});

// ============= MANUAL SCRAPE (HEADED MODE) =============
/**
 * Manually scrape a product (for testing/headed mode)
 * POST /api/scrape-now/:productId
 */
app.post('/api/scrape-now/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await db.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(`\n[Manual Scrape] Starting for: ${product.product_name}`);
    const result = await scrapeProduct(product.product_url);
    await db.performAndLogScrape(productId, result);

    res.json({ success: true, result, product });
  } catch (error) {
    console.error('Manual scrape error:', error.message);
    res.status(500).json({ error: 'Scrape failed', details: error.message });
  }
});

// ============= SCHEDULED SCRAPE (CRON ENDPOINT) =============
/**
 * Scrape all tracked products (called by external cron service every 2 hours)
 * POST /api/scrape-all
 * Optional: ?token=SECRET_CRON_TOKEN for security
 */
app.post('/api/scrape-all', async (req, res) => {
  try {
    // Optional token validation
    const token = req.query.token || req.headers['x-cron-token'];
    if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('\n========== SCHEDULED SCRAPE RUN ==========');
    const products = await db.getTrackedProducts();
    const results = [];

    for (const product of products) {
      console.log(`\nScraping: ${product.product_name}`);
      const scrapeResult = await scrapeProduct(product.product_url);
      await db.performAndLogScrape(product.id, scrapeResult);
      results.push({
        productId: product.id,
        productName: product.product_name,
        ...scrapeResult
      });
    }

    console.log(`========== COMPLETED: ${products.length} products ==========\n`);
    res.json({ success: true, scrapedCount: products.length, results });
  } catch (error) {
    console.error('Scheduled scrape error:', error.message);
    res.status(500).json({ error: 'Scheduled scrape failed', details: error.message });
  }
});

// ============= HEALTH CHECK =============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start the cron job alongside the server
require('./cron');

// ============= START SERVER =============
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
