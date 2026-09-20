# Price Tracker - Web Scraping Application

A full-stack web application that tracks product prices from the INE mock store over time with reliable scraping, retries, and comprehensive logging.

## 📋 Project Overview

- **Frontend**: React + Vercel
- **Backend**: Express.js + Render
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Axios + Cheerio (lightweight HTTP + HTML parsing)
- **Scheduling**: External cron service (cron-job.org)

## 🎯 Core Features

✅ Search products from the INE mock store
✅ Track products with automatic 2-hour scraping schedule
✅ Price and stock history with timestamps
✅ Detailed scrape log (success/retry/failed)
✅ Retry logic with exponential backoff (3 attempts: 1s, 3s, 9s)
✅ Honest logging - all failures recorded, no silent data loss
✅ Manual scrape trigger for testing (headed mode)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account (free tier)
- Vercel account (free tier)
- Render account (free tier)

---

## 📦 Backend Setup (Express.js)

### 1. Local Development

```bash
# Clone repo and navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Fill in your Supabase credentials in .env:
# SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# SUPABASE_KEY=YOUR_ANON_KEY
# PORT=3001
# CRON_TOKEN=your_secure_token

# Start dev server (requires nodemon)
npm run dev

# Test the scraper
npm run scrape:test
```

### 2. Database Setup (Supabase)

1. Go to https://supabase.com and create a new project
2. Run the SQL schema from `database_schema.sql` in the SQL editor:
   ```sql
   -- Copy and paste entire database_schema.sql
   ```
3. Get your credentials:
   - Project URL → `SUPABASE_URL`
   - Anon Key → `SUPABASE_KEY`

### 3. Deploy to Render

1. Push code to GitHub
2. Go to https://render.com
3. Create new "Web Service"
   - Connect your GitHub repo
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables from `.env`
   - Deploy

**Backend URL Example**: `https://price-tracker-backend.onrender.com`

---

## 🎨 Frontend Setup (React)

### 1. Local Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:3001" > .env

# Start dev server
npm start
# Opens at http://localhost:3000
```

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Import your GitHub repo (frontend folder)
3. Environment Variables:
   - `REACT_APP_API_URL` = your backend Render URL
4. Deploy

**Frontend URL Example**: `https://price-tracker.vercel.app`

---

## ⏰ Scheduled Scraping Setup (Cron-Job.org)

The scraper runs automatically every 2 hours via external cron service.

### 1. Configure Cron Service

1. Go to https://cron-job.org/
2. Sign up (free account)
3. Create new cronjob:
   - **URL**: `https://your-backend-domain.onrender.com/api/scrape-all`
   - **Method**: POST
   - **Execution time**: Every 2 hours (e.g., at minute 0 of every even hour)
   - **Headers** (optional): Add `X-Cron-Token: your_secure_token`

### 2. Keep Backend Warm

Free Render tier sleeps after 15 min inactivity. Add a separate warmup cronjob:

- **URL**: `https://your-backend-domain.onrender.com/api/health`
- **Method**: GET
- **Execution time**: Every 10 minutes

---

## 📊 API Endpoints

### Search
```
GET /api/search?q=product_name
Response: { success: true, results: [...] }
```

### Track Product
```
POST /api/track
Body: { productName, productUrl, productImage }
Response: { success: true, product: {...} }
```

### Get Tracked Products
```
GET /api/products
Response: { success: true, products: [...] }
```

### Get Price History
```
GET /api/history/:productId
Response: { success: true, history: [...] }
```

### Get Scrape Log
```
GET /api/scrape-log/:productId
Response: { success: true, log: [...] }
```

### Manual Scrape (Headed Mode)
```
POST /api/scrape-now/:productId
Response: { success: true, result: {...}, product: {...} }
```

### Scheduled Scrape (Cron)
```
POST /api/scrape-all?token=CRON_TOKEN
Response: { success: true, scrapedCount: N, results: [...] }
```

### Health Check
```
GET /api/health
Response: { status: 'ok', timestamp: '...' }
```

---

## 🔧 Scraper Configuration

Edit `backend/scraper.js` to adjust:

```javascript
const SCRAPE_CONFIG = {
  timeout: 15000,           // 15 second timeout per request
  maxRetries: 3,            // 3 total attempts
  retryDelays: [1000, 3000, 9000],  // Backoff: 1s, 3s, 9s
  userAgent: 'Mozilla/5.0 ...'
};
```

### Retry Logic
- **Attempt 1**: Immediate
- **Attempt 2**: Wait 1 second, then retry
- **Attempt 3**: Wait 3 seconds, then retry
- **Attempt 4**: Wait 9 seconds, then retry
- **After 4 failures**: Log error and skip that scrape cycle

### Data Validation
- Only stores price + stock if BOTH are extracted successfully
- Failed scrapes logged honestly with error message
- Empty/null values never silently stored

---

## 🧪 Testing

### Test Scraper Locally
```bash
cd backend
npm run scrape:test
```

### Manual Scrape via API
```bash
curl -X POST http://localhost:3001/api/scrape-now/:productId
```

### Trigger Scheduled Scrape
```bash
curl -X POST "http://localhost:3001/api/scrape-all?token=your_token"
```

---

## 📝 Database Schema

### `tracked_products`
- `id` (UUID): Primary key
- `product_name` (TEXT): Product name
- `product_url` (TEXT): URL on mock store
- `product_image` (TEXT): Image URL
- `created_at` (TIMESTAMP): When tracked
- `updated_at` (TIMESTAMP): Last update

### `price_history`
- `id` (UUID): Primary key
- `product_id` (UUID): Foreign key to tracked_products
- `price` (DECIMAL): Extracted price
- `stock` (INT): Extracted stock count
- `scraped_at` (TIMESTAMP): When scraped
- `status` (TEXT): 'success', 'retry', or 'failed'
- `error_message` (TEXT): Failure reason (if failed)

### `scrape_log`
- `id` (UUID): Primary key
- `product_id` (UUID): Foreign key to tracked_products
- `attempt_number` (INT): Which retry attempt
- `status` (TEXT): 'success', 'retry', or 'failed'
- `timestamp` (TIMESTAMP): When attempted
- `error_message` (TEXT): Error details
- `price` (DECIMAL): Extracted price (if success)
- `stock` (INT): Extracted stock (if success)

---

## 🎥 Headed Mode (Screen Recording)

To record scraper behavior:

1. Open frontend at https://your-site.vercel.app
2. Track a product
3. Click "Scrape Now" on the product detail page
4. Watch console logs and UI update with results
5. Check the scrape log tab to see retry/failure attempts

---

## 🚨 Error Handling & Logging

### Logged Errors
- Network timeouts → Retried up to 3 times
- HTTP errors (500, 503) → Retried
- Failed HTML parsing → Retried
- Invalid/missing data → Logged as "failed" with reason

### Viewing Logs
- **Frontend**: Check scrape log table on each product
- **Backend Console**: `npm run dev` shows real-time logs
- **Database**: Query `scrape_log` table for historical data

---

## 📊 Example Scrape Log Entry

```json
{
  "id": "12345-uuid",
  "product_id": "67890-uuid",
  "attempt_number": 2,
  "status": "success",
  "timestamp": "2024-09-20T14:30:00Z",
  "error_message": null,
  "price": 19.99,
  "stock": 45
}
```

---

## 🔒 Security

- Cron token optional but recommended (`CRON_TOKEN` env var)
- Supabase API keys are public (anon key) - use RLS policies for production
- CORS configured to allow frontend domain only
- No sensitive data in frontend; credentials stored server-side

---

## 🐛 Troubleshooting

### Scraper not finding price/stock
1. Check mock store HTML structure changed
2. Inspect product URL in browser DevTools
3. Add more CSS selectors to `scraper.js` extraction logic

### Cron job not triggering
1. Check cron-job.org dashboard - logs show if request succeeded
2. Verify backend URL is correct
3. Check `CRON_TOKEN` matches if enabled

### Render backend sleeping
1. Ensure warmup cron job configured
2. Check health endpoint: `GET /api/health`

### Supabase connection errors
1. Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
2. Check database schema created successfully
3. Test connection: `npm run scrape:test`

---

## 📈 Performance Notes

- **Lightweight**: Cheerio only, no headless browser
- **Reliable**: 3 retries with exponential backoff
- **Honest**: All failures logged, never silently skip
- **Fast**: Single HTTP request per product (15s timeout)
- **Scalable**: Database indexed for fast history queries

---

## 🎯 Design Decisions

1. **Cheerio over Playwright**: Mock store returns complete HTML without JavaScript, so lightweight parsing works fine
2. **External Cron**: Free-tier backends sleep, so external service required
3. **Simple UI**: Focus on scraper reliability, minimal design
4. **Honest Logging**: All attempts logged to history + scrape_log, no hidden failures
5. **Exponential Backoff**: Respects server load, graceful retry strategy

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Cheerio API](https://cheerio.js.org/)
- [Render Deployment](https://render.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Cron-Job.org Help](https://cron-job.org/en/faq/)

---

## 📄 License

Project for INE Software Engineer Intern Assignment - September 2026
