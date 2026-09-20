# 📑 Master Index - Price Tracker Project

**All files are production-ready and located in `/outputs/`**

---

## 🎯 START HERE

**New to this project?** Read in this order:

1. **QUICK_START.md** ← Read this first (5-minute overview)
2. **README.md** ← Full setup guide (backend, frontend, database)
3. **DESIGN_NOTE.md** ← Understand why we made each decision
4. **SUBMISSION_CHECKLIST.md** ← Before sending to INE

---

## 📂 File Organization

### 📄 Documentation (Read First)
```
QUICK_START.md              ← 5-minute quick reference
README.md                   ← Full setup & troubleshooting guide
DESIGN_NOTE.md              ← Architecture & technical decisions
SUBMISSION_CHECKLIST.md     ← Pre-flight checklist (10 sections)
DELIVERABLES.md             ← Complete file inventory
INDEX.md                    ← This file
```

### 🔧 Backend Application
```
backend/
├── server.js               ← Express server (8 endpoints)
├── scraper.js              ← Scraping logic (retries, backoff)
├── database.js             ← Supabase queries & logging
├── package.json            ← Dependencies
└── .env.example            ← Environment variables template
```

### 🎨 Frontend Application
```
frontend/
├── src/
│   ├── App.jsx             ← All React components (4 pages)
│   ├── App.css             ← Responsive styling
│   ├── index.js            ← React entry point
│   └── public/index.html   ← HTML template
├── package.json            ← Dependencies
└── .env.example            ← Environment variables template
```

### 🗄️ Database
```
database_schema.sql         ← PostgreSQL schema (3 tables)
```

### ⚙️ Deployment & CI/CD
```
.gitignore                  ← Git ignore patterns
vercel.json                 ← Vercel deployment config
github_workflow.yml         ← GitHub Actions CI/CD
.env.example                ← Backend env template
```

### 🧪 Testing & Scripts
```
scripts/
└── testScraper.js          ← Local scraper test utility
```

---

## 🚀 How to Use This Project

### Step 1: Understand the Project
```
Read → QUICK_START.md (5 min)
```

### Step 2: Set Up Locally
```
Follow → README.md "Quick Start" section
Commands:
  cd backend && npm install && npm run dev
  cd frontend && npm install && npm start
```

### Step 3: Deploy to Production
```
Follow → README.md "Deployment" sections + SUBMISSION_CHECKLIST.md
Deploy to: Vercel (frontend) + Render (backend) + Supabase (database)
```

### Step 4: Configure Cron Scheduling
```
Follow → README.md "Scheduled Scraping Setup"
Go to: cron-job.org and create 2 jobs
```

### Step 5: Submit to INE
```
Follow → SUBMISSION_CHECKLIST.md "Final Submission"
Email to: sstephen@ine.com (CC: ssingh@ine.com)
Include: Live links + GitHub repo + screen recording + resume
```

---

## 📋 Key Sections by Purpose

### "How do I get started quickly?"
→ **QUICK_START.md** (2 min read)

### "How do I deploy this?"
→ **README.md** - "Backend Setup", "Frontend Setup", "Deployment"

### "Why did you make this decision?"
→ **DESIGN_NOTE.md** (4 pages)

### "How do I know what to submit?"
→ **SUBMISSION_CHECKLIST.md** (3 pages, 10 sections)

### "What files are included?"
→ **DELIVERABLES.md** (2 pages, complete inventory)

### "How do I test locally?"
→ **README.md** - "Testing" section

### "How do I fix this error?"
→ **README.md** - "Troubleshooting" section

### "What are the API endpoints?"
→ **README.md** - "API Endpoints" section

---

## 🔑 Core Files Explained

### Backend Server (`server.js`)
- **Lines 1-50**: Dependencies & middleware
- **Lines 51-100**: `/api/search` endpoint
- **Lines 101-150**: `/api/track` endpoint
- **Lines 151-200**: `/api/products`, `/api/history`, `/api/scrape-log`
- **Lines 201-250**: `/api/scrape-now` (manual scrape)
- **Lines 251-300**: `/api/scrape-all` (scheduled scrape)
- **Lines 301+**: Server startup

### Scraper Logic (`scraper.js`)
- **Lines 1-30**: Configuration (timeout, retries, delays)
- **Lines 31-80**: Main `scrapeProduct()` function with retry loop
- **Lines 81-120**: `extractPrice()` with multiple selectors
- **Lines 121-160**: `extractStock()` with multiple selectors
- **Lines 161+**: Helper functions

### Database Layer (`database.js`)
- **Lines 1-50**: Supabase client initialization
- **Lines 51-150**: Query functions (get, add, delete)
- **Lines 151-250**: Logging functions (scrape attempts, price history)
- **Lines 251+**: Combined operation (`performAndLogScrape`)

### React Components (`App.jsx`)
- **Lines 1-100**: Main App component + routing
- **Lines 101-200**: DashboardPage (product grid)
- **Lines 201-300**: SearchPage (search & track)
- **Lines 301-500**: DetailPage (history + logs)

### Styling (`App.css`)
- **Lines 1-50**: Global styles & header
- **Lines 51-150**: Navigation & buttons
- **Lines 151-250**: Product cards & grids
- **Lines 251-350**: Forms & search results
- **Lines 351-450**: Tables & status badges
- **Lines 451+**: Responsive media queries

---

## 🌐 API Quick Reference

| Endpoint | Method | Purpose | Example |
|----------|--------|---------|---------|
| `/api/search` | GET | Search products | `?q=laptop` |
| `/api/track` | POST | Track product | `{productName, productUrl}` |
| `/api/products` | GET | List tracked | Returns array |
| `/api/history/:id` | GET | Price history | Returns last 100 records |
| `/api/scrape-log/:id` | GET | Scrape log | Returns all attempts |
| `/api/scrape-now/:id` | POST | Manual scrape | For testing (headed mode) |
| `/api/scrape-all` | POST | Scheduled scrape | Called by cron every 2h |
| `/api/health` | GET | Health check | For warmup cron |

---

## 🗄️ Database Schema Quick Reference

### `tracked_products`
- `id` (UUID): Primary key
- `product_name` (TEXT): What to track
- `product_url` (TEXT): URL to scrape
- `product_image` (TEXT): Display image
- `created_at`, `updated_at`: Timestamps

### `price_history`
- `id` (UUID): Primary key
- `product_id` (UUID): Foreign key
- `price` (DECIMAL): Successfully scraped price
- `stock` (INT): Successfully scraped stock
- `scraped_at` (TIMESTAMP): When scraped
- `status` (TEXT): 'success', 'retry', or 'failed'
- `error_message` (TEXT): If failed, why

### `scrape_log`
- `id` (UUID): Primary key
- `product_id` (UUID): Which product
- `attempt_number` (INT): 1st, 2nd, 3rd, or 4th try
- `status` (TEXT): 'success', 'retry', or 'failed'
- `timestamp` (TIMESTAMP): When tried
- `error_message` (TEXT): Error details
- `price`, `stock`: Values extracted (if success)

---

## ⚙️ Environment Variables

### Backend `.env`
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
PORT=3001
CRON_TOKEN=your-secure-token (optional)
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:3001 (local)
                  https://your-backend.onrender.com (production)
```

---

## 🧪 Testing Commands

### Local Backend
```bash
cd backend
npm install
npm run dev                    # Start server
npm run scrape:test            # Test scraper
```

### Local Frontend
```bash
cd frontend
npm install
npm start                      # Start on :3000
```

### Test Scraper Manually
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Test scraper
npm run scrape:test

# Terminal 3: Test API
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/scrape-now/PRODUCT_ID
```

---

## 🎯 Deployment Checklist (Quick)

- [ ] Push all files to GitHub (public repo)
- [ ] Supabase: Create project + run `database_schema.sql`
- [ ] Render: Deploy backend (add env vars)
- [ ] Vercel: Deploy frontend (add env vars)
- [ ] Cron-Job.org: Create 2 jobs (scrape every 2h, warmup every 10m)
- [ ] Test: Manual scrape via `/api/scrape-now/:id`
- [ ] Wait: 2+ hours for first cron run
- [ ] Record: 2-4 min screen recording
- [ ] Submit: Email with links + resume

**See SUBMISSION_CHECKLIST.md for detailed steps**

---

## 📧 Submission Details

**To**: `sstephen@ine.com`
**CC**: `ssingh@ine.com`
**Subject**: `First Round: Software Engineer Intern Assignment - [Your Name]`
**Deadline**: September 20, 2026 - 11:59 PM IST

**Include in email**:
1. Live frontend URL (Vercel)
2. GitHub repository URL (public)
3. Screen recording link (2-4 min)
4. Resume (PDF attachment)

---

## 🏆 What Makes This Solution Great

✅ **Scraper Reliability**: 3 retries with exponential backoff
✅ **Honest Logging**: All attempts recorded, no hidden failures
✅ **Data Validation**: Never stores bad/empty data
✅ **Production Ready**: Error handling, modular code, documented
✅ **Easy to Deploy**: Follow README, deploy in 30 minutes
✅ **Well Documented**: 14 pages of guides + inline comments
✅ **Tested**: Local testing utilities included
✅ **Simple**: KISS principle, no over-engineering

---

## 🆘 Need Help?

1. **Quick question?** → Check QUICK_START.md
2. **Setup issue?** → Check README.md "Troubleshooting"
3. **Deployment issue?** → Check README.md "Deployment" sections
4. **Why this design?** → Check DESIGN_NOTE.md
5. **Ready to submit?** → Check SUBMISSION_CHECKLIST.md

---

## 📞 Quick Navigation

| Need | File | Section |
|------|------|---------|
| 5-min overview | QUICK_START.md | Start of file |
| Full setup | README.md | "Quick Start" |
| Backend deploy | README.md | "Backend Setup" > "Deploy to Render" |
| Frontend deploy | README.md | "Frontend Setup" > "Deploy to Vercel" |
| Database setup | README.md | "Database Setup" |
| Cron setup | README.md | "Scheduled Scraping Setup" |
| API docs | README.md | "API Endpoints" |
| Architecture | DESIGN_NOTE.md | Start of file |
| Testing | README.md | "Testing" |
| Errors | README.md | "Troubleshooting" |
| Submission | SUBMISSION_CHECKLIST.md | "Final Submission" |

---

## 🎓 Project Statistics

| Metric | Value |
|--------|-------|
| Total files | 18 |
| Lines of code (backend) | 300+ |
| Lines of code (frontend) | 400+ |
| Documentation pages | 14 |
| API endpoints | 8 |
| Database tables | 3 |
| React components | 4 |
| Test utilities | 1 |
| Deployment targets | 4 |

---

## ✅ Final Verification

Before submitting, verify:

- [ ] All 18 files present
- [ ] README.md is comprehensive
- [ ] DESIGN_NOTE.md explains decisions
- [ ] Code has no hardcoded credentials
- [ ] .env.example has all required vars
- [ ] Database schema saved separately
- [ ] GitHub repo is public
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Cron jobs scheduled
- [ ] Screen recording captured
- [ ] Resume prepared (PDF)

---

## 🚀 You're Ready!

This project includes everything needed to:
1. Run locally for development
2. Deploy to production
3. Schedule automatic scraping
4. Submit to INE

**Next step**: Read QUICK_START.md (5 minutes) → then README.md (full setup guide)

---

**Version**: 1.0 Final
**Created**: September 2026
**Status**: ✅ Production Ready
