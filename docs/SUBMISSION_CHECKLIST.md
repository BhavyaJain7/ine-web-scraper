# Submission Checklist - INE Price Tracker Assignment

**Deadline**: September 20, 2026 (Sunday) - 11:59 PM IST

## 📋 Pre-Submission Tasks

### 1. Code Repository Setup
- [ ] Create GitHub repository (public)
- [ ] Push all files:
  ```
  /backend (server.js, scraper.js, database.js, package.json, database_schema.sql)
  /frontend (App.jsx, App.css, index.js, public/index.html, package.json)
  ```
- [ ] Ensure .gitignore excludes .env files
- [ ] Add comprehensive README.md
- [ ] Add DESIGN_NOTE.md

### 2. Backend Deployment (Render)
- [ ] Create Render account (free tier)
- [ ] Deploy backend service:
  - [ ] Connect GitHub repo
  - [ ] Environment variables set:
    - `SUPABASE_URL`
    - `SUPABASE_KEY`
    - `PORT=3001`
    - `CRON_TOKEN` (optional)
  - [ ] Build command: `npm install`
  - [ ] Start command: `npm start`
  - [ ] Note backend URL: `https://your-name-backend.onrender.com`

### 3. Frontend Deployment (Vercel)
- [ ] Create Vercel account (free tier)
- [ ] Deploy frontend:
  - [ ] Connect GitHub repo (frontend folder)
  - [ ] Environment variable: `REACT_APP_API_URL=https://your-backend-url`
  - [ ] Deploy
  - [ ] Note frontend URL: `https://your-name-frontend.vercel.app`

### 4. Database Setup (Supabase)
- [ ] Create Supabase account (free tier)
- [ ] Create new project
- [ ] Run SQL schema (from database_schema.sql):
  ```sql
  CREATE TABLE tracked_products (...)
  CREATE TABLE price_history (...)
  CREATE TABLE scrape_log (...)
  CREATE INDEX idx_price_history_product_id ON price_history(product_id);
  ...
  ```
- [ ] Verify all tables created
- [ ] Get credentials:
  - [ ] Project URL → backend SUPABASE_URL
  - [ ] Anon Key → backend SUPABASE_KEY

### 5. Scheduled Scraping Setup (Cron-Job.org)
- [ ] Create cron-job.org account (free tier)
- [ ] Create cronjob #1 (Main Scraper):
  - [ ] Title: "Price Tracker - Scheduled Scrape"
  - [ ] URL: `https://your-backend-url/api/scrape-all`
  - [ ] Method: POST
  - [ ] Execution: Every 2 hours (e.g., at 00:00, 02:00, 04:00, etc.)
  - [ ] Optional header: `X-Cron-Token: your_token`
  - [ ] Save & verify scheduled

- [ ] Create cronjob #2 (Backend Warmup):
  - [ ] Title: "Price Tracker - Health Check"
  - [ ] URL: `https://your-backend-url/api/health`
  - [ ] Method: GET
  - [ ] Execution: Every 10 minutes
  - [ ] Save & verify scheduled

### 6. Functionality Testing
- [ ] Test search: Search for a product at frontend
- [ ] Test tracking: Track a product
- [ ] Test manual scrape: Click "Scrape Now", observe logs
- [ ] Test history: Verify price history populated
- [ ] Test scrape log: View all scrape attempts
- [ ] Test failures: Verify failed attempts logged honestly
- [ ] Wait 2+ hours: Verify cron triggered scrape succeeded
- [ ] Check database: Query `scrape_log` for complete audit trail

### 7. Screen Recording (Headed Mode)
- [ ] Record 2-4 minute video showing:
  - [ ] Navigation to product detail page
  - [ ] Click "Scrape Now" button
  - [ ] Show scrape log populating in real-time
  - [ ] Display a failed/retry scenario (or simulate)
  - [ ] Show price history table with multiple entries
  - [ ] Demonstrate honest logging (failures not hidden)
- [ ] Save as `.mp4` or `.webm`
- [ ] Upload to GitHub releases or include in email

### 8. Documentation
- [ ] README.md complete with:
  - [ ] Project overview
  - [ ] Tech stack
  - [ ] Quick start instructions
  - [ ] Backend setup (local + Render)
  - [ ] Frontend setup (local + Vercel)
  - [ ] Database schema
  - [ ] API endpoints documented
  - [ ] Cron setup instructions
  - [ ] Scraper configuration
  - [ ] Testing instructions
  - [ ] Troubleshooting

- [ ] DESIGN_NOTE.md complete with:
  - [ ] Architecture decisions (HTTP vs. Playwright)
  - [ ] Scraper reliability approach
  - [ ] Error handling strategy
  - [ ] Trade-offs made
  - [ ] What AI tools got wrong & how fixed
  - [ ] Reliability testing performed
  - [ ] Files & structure explained
  - [ ] Deployment checklist

### 9. Final Code Review
- [ ] Scraper has retry logic (3 attempts, exponential backoff)
- [ ] Data validation before insert (no null values stored)
- [ ] All errors logged to `scrape_log` table
- [ ] Frontend displays scrape log honestly
- [ ] No hardcoded credentials in code
- [ ] .env.example includes all required vars
- [ ] Code is clean, readable, well-commented

### 10. Prepare Submission Materials
- [ ] **Live site link** (frontend Vercel URL)
- [ ] **GitHub repo URL** (public, all source files)
- [ ] **Screen recording** (2-4 min MP4/WebM)
- [ ] **README.md** (in repo root)
- [ ] **DESIGN_NOTE.md** (in repo root)
- [ ] **PDF Resume**

---

## 📧 Final Submission

### Email Details
- **To**: `sstephen@ine.com`
- **CC**: `ssingh@ine.com`
- **Subject**: `First Round: Software Engineer Intern Assignment - <Your Full Name>`
- **Deadline**: September 20, 2026 - 11:59 PM IST

### Email Body Template
```
Dear INE Team,

Please find my submission for the Software Engineer Intern Assignment below:

Live Site: https://your-frontend.vercel.app
GitHub Repo: https://github.com/your-username/price-tracker
Screen Recording: [Attached or YouTube link]

The application successfully:
✅ Searches products from the INE mock store
✅ Tracks products with automatic 2-hour scraping
✅ Records price and stock history
✅ Logs all scrape attempts (success/retry/failed)
✅ Implements retry logic with exponential backoff
✅ Never stores bad data, logs all failures honestly
✅ Deployed on Vercel (frontend) + Render (backend) + Supabase (database)

Key Features:
- Lightweight Cheerio scraper (no headless browser overhead)
- 3-attempt retry strategy with 1s/3s/9s backoff delays
- Complete audit trail of all scrape attempts
- Manual scrape trigger for testing
- Honest failure logging (no silent data loss)

The README and DESIGN_NOTE are included in the repository with complete setup instructions and architectural decisions explained.

Thank you,
[Your Name]
```

### Attachments
- [ ] PDF Resume

---

## 🚀 Live Deployment URLs (to include in email)

**Frontend**: https://your-name-frontend.vercel.app
**Backend**: https://your-name-backend.onrender.com
**GitHub**: https://github.com/your-username/price-tracker

---

## ⚠️ Critical Reminders

1. ✅ **No plagiarism**: All code must be your own
2. ✅ **Core features only**: Don't over-engineer (KISS principle)
3. ✅ **Scraper reliability**: This is THE core requirement
4. ✅ **Honest logging**: All attempts visible, failures not hidden
5. ✅ **Live deployment**: Everything must be reachable from live link
6. ✅ **Screen recording**: Shows scraper behavior with retries/failures
7. ✅ **Design note**: Explains why each decision was made
8. ✅ **Resume**: Submit only if code is at least partially working
9. ✅ **Deadline**: September 20, 2026 11:59 PM IST (no extensions)

---

## 🎯 Success Criteria (From Assignment)

- [ ] **Scraping Reliability**: Scraper works across many unattended runs ✅
- [ ] **Correctness Under Difficulty**: Extracts right data even when slow/late ✅
- [ ] **Honest History & Logging**: All attempts logged, failures recorded ✅
- [ ] **Good Judgment**: Lightweight HTTP vs. headless browser decision justified ✅
- [ ] **Deployment**: Frontend on Vercel, Backend on Render, DB on Supabase ✅

---

## 📝 Notes

- **Local Testing**: Always test locally (`npm run dev` backend, `npm start` frontend) before deployment
- **Cron Verification**: Check cron-job.org dashboard to confirm scrapes trigger
- **Database Queries**: Use Supabase SQL editor to verify data stored correctly
- **Error Handling**: Test with mock store down or very slow response
- **Screen Recording**: OBS Studio or similar - show browser console logs + UI
- **Time Zone**: Deadline is IST (Indian Standard Time), verify your local time

---

## ✅ Final Checklist Before Sending Email

- [ ] All code pushed to GitHub (public)
- [ ] Backend running on Render
- [ ] Frontend running on Vercel
- [ ] Database on Supabase with all tables created
- [ ] Cron jobs configured and running
- [ ] Manual scrape tested and working
- [ ] Screen recording captured (2-4 min)
- [ ] README.md complete and accurate
- [ ] DESIGN_NOTE.md complete and detailed
- [ ] .env.example has all required variables
- [ ] Resume prepared (PDF)
- [ ] Email draft ready (use template above)
- [ ] All attachments ready
- [ ] Time: Sending BEFORE 11:59 PM IST on Sept 20, 2026

---

**Status**: Ready to Submit ✅
