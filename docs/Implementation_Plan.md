# INE Product Price Tracker - Implementation Plan
**Priority: Core Features Only | Timeline: Compact | Risk: Scraper Reliability is Critical**

---

## Executive Summary
Build a **minimal, reliable scraper-first** application. The assignment emphasizes scraping robustness over UI polish. All effort goes toward reliable data extraction and honest logging.

---

## Phase 1: Reconnaissance & Setup (Day 1)
### Scrape the Mock Store First
1. **Inspect** https://demo.inelabteamdev.com/ manually
   - Identify product listing structure
   - Check if price/stock load asynchronously (JavaScript required?)
   - Test network delays and error scenarios
   - Document actual HTML/CSS selectors
2. **Decide: HTTP + Cheerio vs. Playwright**
   - If price/stock load in initial HTML → use lightweight **axios + cheerio**
   - If content loads after JS execution → use **Playwright** (headless browser)
3. **Set up infrastructure**
   - Vercel + React (barebones, forms only)
   - Render + Express (API layer)
   - Supabase (PostgreSQL): two tables: `tracked_products` and `price_history`
   - External cron: cron-job.org configured to call backend endpoint every 2 hours

---

## Phase 2: Backend Scraper (Days 2–3) — CORE PRIORITY
### Scraper Service (scraper.js)
```
- retry logic: 3 attempts with exponential backoff (1s, 3s, 9s)
- timeout: 15s per request
- never store empty/null data on failure
- catch and log all errors with timestamps
```

### Database Schema
```sql
CREATE TABLE tracked_products (
  id UUID PRIMARY KEY,
  user_id TEXT,
  product_name TEXT NOT NULL,
  product_url TEXT,
  created_at TIMESTAMP
);

CREATE TABLE price_history (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES tracked_products,
  price DECIMAL,
  stock INT,
  scraped_at TIMESTAMP,
  status ENUM('success', 'retry', 'failed'),
  error_message TEXT,
  raw_html TEXT (optional, for debugging)
);
```

### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /api/search` | Search mock store by product name |
| `POST /api/track` | Add product to tracked list |
| `GET /api/products` | List tracked products |
| `GET /api/history/:productId` | Get price/stock history |
| `GET /api/scrape-log/:productId` | Get scrape attempt log |
| `POST /api/scrape-now/:productId` | Manual scrape (for headed mode) |
| `POST /api/scrape-all` | Cron endpoint (called by cron-job.org) |

### Error Handling Strategy
- Log every attempt (success, retry, failure) to `price_history` with `status` field
- Never silently fail or skip logging
- Record `error_message` for debugging
- Display failures honestly in UI

---

## Phase 3: Frontend (Day 4) — Minimal UI
### Pages
1. **Search & Track**
   - Input field → calls `POST /api/search`
   - Display results, "Track" button → `POST /api/track`

2. **Dashboard**
   - Table of tracked products
   - Link to history for each product

3. **Product Detail Page**
   - Chart (price over time) OR simple table
   - Scrape log showing all attempts + timestamps + status
   - "Manual Scrape Now" button (for headed recording)

### Tech
- React + Axios
- Chart library: **Chart.js** (lightweight) or **Recharts**
- No complex state management (useState/useContext only)

---

## Phase 4: Deployment & Testing (Day 5)
### Pre-Launch Checklist
- [ ] Backend running on Render
- [ ] Cron job configured and firing every 2 hours
- [ ] Manual scrape endpoint works (headed mode)
- [ ] Database populated with test product and price history
- [ ] Scrape log shows honest results (no hidden failures)
- [ ] Live link accessible end-to-end

### Screen Recording (Headed Mode)
- Call `POST /api/scrape-now/:productId` with logs visible
- Show: success case, retry on slow response, graceful error handling
- Duration: 2–4 minutes

---

## Critical Success Factors (Must-Have)
✅ **Scraper never silently fails** — every attempt logged with status  
✅ **Retries work** — exponential backoff, 3 attempts minimum  
✅ **No bad data stored** — validate price/stock before insert  
✅ **Cron integration works** — external scheduler triggers backend reliably  
✅ **History is honest** — failed scrapes recorded, not hidden  
✅ **Live deployment** — Vercel + Render + Supabase accessible  

---

## Deliverables Checklist
- [ ] Live site link (hosted on Vercel/Render)
- [ ] GitHub repo (public, all source files)
- [ ] Screen recording (2–4 min, headed scrape + error handling)
- [ ] README (setup, cron schedule, env vars)
- [ ] **Design note** (why scraping is reliable, AI mistakes + fixes)
- [ ] Resume (PDF)

---

## Timeline & Effort Allocation
| Phase | Days | Focus |
|-------|------|-------|
| Reconnaissance | 1 | Scraper viability + tech choice |
| Backend Scraper | 2 | Retries, error handling, logging |
| Frontend | 1 | Minimal, forms-based |
| Deployment | 1 | Live, tested, recorded |
| **Total** | **5** | **Core features only** |

---

## Key Judgment Calls
1. **Lightweight HTTP + Cheerio first** — Playwright only if JS-rendered
2. **External cron (cron-job.org)** — not backend loop (free tier sleeps)
3. **Simple chart** — bar/line only, no fancy interactivity
4. **Honest logging** — failures visible, not filtered
5. **Minimal UI** — focus on scraper reliability, not design

---

## Risk Mitigation
| Risk | Mitigation |
|------|-----------|
| Mock store structure changes | Change detection (bonus) + monitor HTML in logs |
| Network timeouts | 15s timeout + 3 retries with backoff |
| Bad data insertion | Validate before INSERT; log rejection reason |
| Cron not firing | Set up monitoring; log each cron call |
| Free-tier sleep | Use external scheduler, not backend loop |

---

## Design Note Tips (for Submission)
Highlight:
- Why you chose HTTP vs. Playwright (and what you tested)
- Retry strategy and backoff logic
- How you ensure no bad data gets stored
- What AI tool suggested wrong (e.g., "ChatGPT suggested Puppeteer; I switched to Playwright for speed")
- How you validated scraper reliability (e.g., "ran 50+ unattended scrapes, 100% success rate")

