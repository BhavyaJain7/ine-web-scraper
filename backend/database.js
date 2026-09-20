const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Get all tracked products
 */
async function getTrackedProducts() {
  try {
    const { data, error } = await supabase
      .from('tracked_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tracked products:', error.message);
    return [];
  }
}

/**
 * Get a single product by ID
 */
async function getProductById(productId) {
  try {
    const { data, error } = await supabase
      .from('tracked_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching product:', error.message);
    return null;
  }
}

/**
 * Add a new tracked product
 */
async function addTrackedProduct(productName, productUrl, productImage = null) {
  try {
    const { data, error } = await supabase
      .from('tracked_products')
      .insert([{ product_name: productName, product_url: productUrl, product_image: productImage }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding tracked product:', error.message);
    return null;
  }
}

/**
 * Delete a tracked product
 */
async function deleteTrackedProduct(productId) {
  try {
    const { error } = await supabase
      .from('tracked_products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting tracked product:', error.message);
    return false;
  }
}

/**
 * Record a scrape attempt (success or failure)
 */
async function logScrapeAttempt(productId, status, price = null, stock = null, errorMessage = null, attemptNumber = 1) {
  try {
    const { data, error } = await supabase
      .from('scrape_log')
      .insert([{
        product_id: productId,
        status,
        price,
        stock,
        error_message: errorMessage,
        attempt_number: attemptNumber
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging scrape attempt:', error.message);
    return null;
  }
}

/**
 * Record successful price in history (only store valid data)
 */
async function recordPriceHistory(productId, price, stock, status = 'success', errorMessage = null) {
  try {
    // Only insert if we have valid price and stock data
    if (price === null || stock === null) {
      console.warn(`[Data Validation] Skipping insert: price=${price}, stock=${stock}`);
      return null;
    }

    const { data, error } = await supabase
      .from('price_history')
      .insert([{
        product_id: productId,
        price,
        stock,
        status,
        error_message: errorMessage
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording price history:', error.message);
    return null;
  }
}

/**
 * Get price history for a product (last 100 records)
 */
async function getPriceHistory(productId, limit = 100) {
  try {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('scraped_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching price history:', error.message);
    return [];
  }
}

/**
 * Get scrape log for a product (last 100 attempts)
 */
async function getScrapeLog(productId, limit = 100) {
  try {
    const { data, error } = await supabase
      .from('scrape_log')
      .select('*')
      .eq('product_id', productId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching scrape log:', error.message);
    return [];
  }
}

/**
 * Perform a complete scrape: log attempt, store data, handle errors
 */
async function performAndLogScrape(productId, scrapeResult) {
  const { success, price, stock, error } = scrapeResult;

  if (success) {
    // Log success to scrape_log
    await logScrapeAttempt(productId, 'success', price, stock, null);
    // Record in price_history
    await recordPriceHistory(productId, price, stock, 'success');
    console.log(`[Logged] Product ${productId}: Price=$${price}, Stock=${stock}`);
    return true;
  } else {
    // Log failure to both tables
    await logScrapeAttempt(productId, 'failed', null, null, error);
    console.error(`[Failed] Product ${productId}: ${error}`);
    return false;
  }
}

module.exports = {
  getTrackedProducts,
  getProductById,
  addTrackedProduct,
  deleteTrackedProduct,
  logScrapeAttempt,
  recordPriceHistory,
  getPriceHistory,
  getScrapeLog,
  performAndLogScrape
};
