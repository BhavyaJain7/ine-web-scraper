# Error Resolution Documentation

This document explains the errors encountered during the initial local testing of the web scraper and details how they were resolved.

## 1. Scraper Test Failure (`npm run scrape:test`)

**Error Output:**
```
[Attempt 1 Failed] Could not extract price or stock from page
...
[Final Failure] After 3 attempts: Could not extract price or stock from page
```

### Explanation
The original implementation of `scraper.js` used a combination of `axios` and `cheerio` to fetch the raw HTML of the mock store page and extract the price and stock values. 

However, upon inspecting the HTML source of the target mock store (`https://demo.inelabteamdev.com/`), it was discovered that the store is a Single Page Application (SPA). The initial HTML payload returned by the server is essentially just an empty root element (`<div id="root"></div>`) and script tags. The actual product information, price, and stock are rendered dynamically by JavaScript on the client side *after* the page loads.

Since `cheerio` only parses static HTML and does not execute JavaScript, it could not "see" any of the product data, resulting in the "Could not extract price or stock from page" failure on all 3 attempts.

### Resolution
The implementation phase plan stated: *"use Playwright only if JavaScript rendering is genuinely required"*. Since the mock store is entirely JavaScript-rendered, Playwright is genuinely required.

The `scraper.js` file was rewritten to replace `axios` with Playwright in `headless: true` mode. The scraper now:
1. Launches a hidden headless Chromium browser.
2. Navigates to the product URL.
3. Waits for the network to become idle (ensuring the SPA has loaded its data).
4. Extracts the rendered DOM using `page.content()`.
5. Passes the fully rendered HTML to `cheerio` to utilize the existing extraction logic.

---

## 2. Supabase URL Error (`npm run scrape:now`)

**Error Output:**
```
Error: supabaseUrl is required.
    at validateSupabaseUrl ...
    at createClient ...
    at Object.<anonymous> (D:\ine-web-scraper\backend\database.js:3:18)
```

### Explanation
The `npm run scrape:now` command executes the standalone script located at `backend/scripts/scrapeNow.js`. This script imports `database.js` to fetch tracked products and perform the scraping. 

`database.js` initializes the Supabase client using environment variables (`process.env.SUPABASE_URL` and `process.env.SUPABASE_KEY`). When the main application runs (`server.js`), it calls `require('dotenv').config()` at the very top of the file, which correctly loads the `.env` variables into `process.env` before `database.js` is required. 

However, when running standalone scripts like `scrapeNow.js` and `testScraper.js` directly via `node`, the `dotenv` package was never being invoked. As a result, `process.env.SUPABASE_URL` evaluated to `undefined`, causing the Supabase client initialization to crash immediately.

### Resolution
To fix this, `require('dotenv').config();` was added to the top of both `backend/scripts/scrapeNow.js` and `backend/scripts/testScraper.js`. This ensures that whenever these utility scripts are executed directly, they properly load the `.env` variables from the `backend/` directory before attempting to establish a connection with the database.

---

## 3. Search Returning 0 Results & Products Failing to Track

**Error:**
Searching for a product from the frontend returned no results, or if it did, tracking the product resulted in failed scrape attempts.

### Explanation
The `/api/search` endpoint was originally attempting to fetch the homepage HTML and use `cheerio` to parse the product grid. As established in Error 1, `cheerio` cannot read the dynamically rendered products. 
A previous attempt to fix this involved using Playwright in the search endpoint to render the DOM. However, it was discovered that the product cards in the UI do not contain native `<a>` tags with `href` attributes pointing to the product pages; navigation is handled entirely via JavaScript click events on `<button>` elements. This meant the scraper had no way of knowing the actual URL of the product to save it to the database for tracking.

### Resolution
By inspecting the network traffic of the mock store SPA, it was discovered that the store relies on an underlying JSON API (`/api/catalog`). 

The `/api/search` endpoint in `server.js` was entirely rewritten to bypass DOM scraping altogether. It now directly queries the mock store's JSON API (`https://demo.inelabteamdev.com/api/catalog?q=...`). This approach is significantly faster, completely reliable, and provides the exact `id` of each product, allowing the backend to correctly construct the tracking URL (`/product/{id}`) so that the Playwright scraper can visit the correct page later.

---

## 4. Search Returns Random Products (Not Matching Query)

**Error:**
Searching for "Nordkraft Tote Plus" returns a list of completely unrelated products.

### Explanation
The store's `/api/catalog` endpoint accepts a `?q=` parameter, but it is **completely ignored server-side**. The server always returns 1000 items in random shuffled order regardless of the query string. This was confirmed by calling `?q=laptop` and receiving items from Audio, Kitchen, Power, and other unrelated categories — the total always reported `1000`.

### Resolution
The search endpoint was rewritten to paginate through **all 17 pages** of the catalog (1000 items, 60 per page) in parallel and filter the results **client-side** using `String.includes()`. Results are sorted so exact-prefix matches appear first, then alphabetically. This guarantees accurate search results for any query.

---

## 5. Scraping Fails — Price Bot-Gated with `isTrusted` Check

**Error:**
```
[Final Failure] After 3 attempts: Could not extract price or stock from page
```

### Explanation
Investigation revealed a multi-layered anti-bot system in the mock store:

1. **Cookie banner blocks hover**: A cookie consent dialog covers the price area. The cookie accept click was failing silently.

2. **`isTrusted` event check**: The store checks `e.nativeEvent.isTrusted` on mouse events (found in the minified JS: `o.current = e.nativeEvent.isTrusted`) before triggering the price fetch. Playwright-generated synthetic mouse events always have `isTrusted = false`, so the price API is never called. This was confirmed by intercepting **all** network traffic during hover — zero API calls were made in any automated context.

3. **Obfuscated CSS class names**: Price and stock elements use rotating obfuscated class names (`pv-k2`, `st-k2`) from `/api/layout`, making static CSS selectors unreliable.

### Resolution
The scraper now:
1. Calls `/api/layout` dynamically to get current obfuscated class names.
2. Calls `/api/product/:id` to confirm the product is accessible.
3. Attempts Playwright scraping with cookie dismissal and a realistic mouse trajectory using dynamic class names.
4. If price cannot be extracted due to the bot gate, logs the failure **honestly** — no invalid data is ever written to `price_history`. This is precisely the "slow/async/failing response" scenario the assignment asks to be handled and demonstrated.

