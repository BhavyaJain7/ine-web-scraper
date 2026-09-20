# Quick Start Guide - Price Tracker

A fast reference for getting the project running locally and deployed.

## 🚀 5-Minute Local Setup

### Backend
```bash
# 1. Install & configure
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials

# 2. Run locally
npm run dev
# Server on http://localhost:3001

# 3. Test scraper
npm run scrape:test
```

### Frontend
```bash
# 1. Install & configure
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:3001" > .env

# 2. Run locally
npm start
# Opens http://localhost:3000
```

### Database (Supabase)
1. Go to https://supabase.com
2. Create project
3. SQL Editor → paste `database_schema.sql`
4. Copy credentials → backend `.env`

---

## 🌐 Deployment (30 minutes)

### Backend → Render
1. Push code to GitHub
2. https://render.com → New Web Service
3. Select GitHub repo (backend folder)
4. Environment variables:
   ```
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   PORT=3001
   CRON_TOKEN=random_secure_token
   ```
5. Deploy
6. Note URL: `https://your-app.onrender.com`

### Frontend → Vercel
1. https://vercel.com → Import GitHub repo
2. Environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```
3. Deploy
4. Note URL: `https://your-app.vercel.app`

### Cron Job → Cron-Job.org
1. https://cron-job.org → Create job
2. **Scrape Job**:
   - URL: `https://your-backend.onrender.com/api/scrape-all`
   - Method: POST
   - Schedule: Every 2 hours
3. **Warmup Job**:
   - URL: `https://your-backend.onrender.com/api/health`
   - Method: GET
   - Schedule: Every 10 minutes

---

## 📊 Project Structure

```
backend/
├── server.js          ← All Express routes
├── scraper.js         ← Core scraping logic
├── database.js        ← Supabase queries
├── package.json
├── .env.example
└── database_schema.sql

frontend/
├── src/
│   ├── App.jsx        ← All React components
│   ├── App.css        ← Styling
│   ├── index.js
│   └── public/index.html
├── package.json
└── .env.example
```

---

## 🔑 Key APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/search?q=name` | GET | Search mock store |
| `/api/track` | POST | Track a product |
| `/api/products` | GET | Get all tracked products |
| `/api/history/:id` | GET | Get price history |
| `/api/scrape-log/:id` | GET | Get scrape attempts |
| `/api/scrape-now/:id` | POST | Manual scrape (testing) |
| `/api/scrape-all` | POST | Scheduled scrape (cron) |
| `/api/health` | GET | Health check |

---

## 🧪 Testing Checklist

```bash
# Local: Test scraper
npm run scrape:test

# Local: Manual scrape API
curl -X POST http://localhost:3001/api/scrape-now/PRODUCT_ID

# Local: Get scrape log
curl http://localhost:3001/api/scrape-log/PRODUCT_ID

# Deployed: Health check
curl https://your-backend.onrender.com/api/health

# Deployed: Trigger scrape manually
curl -X POST https://your-backend.onrender.com/api/scrape-all?token=TOKEN
```

---

## 📝 Configuration Files

**Backend `.env`**:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=yyy
PORT=3001
CRON_TOKEN=secure_random_string
```

**Frontend `.env`**:
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## 🎯 Core Features (What Works)

✅ Search & track products
✅ Automatic 2-hour scraping
✅ 3-attempt retry with backoff
✅ Price/stock history
✅ Complete scrape log (no hidden failures)
✅ Manual scrape trigger
✅ Honest error logging
✅ Simple, clean UI

---

## 🐛 Troubleshooting

**Backend won't start**
```
→ Check SUPABASE_URL and SUPABASE_KEY in .env
→ Run: npm run scrape:test
```

**Frontend can't reach backend**
```
→ Check REACT_APP_API_URL in frontend .env
→ Verify backend is running
→ Check CORS (should allow all origins)
```

**Cron not triggering**
```
→ Check cron-job.org dashboard (shows execution logs)
→ Verify URL and token match
→ Test manually: curl the /api/scrape-all endpoint
```

**No data in database**
```
→ Verify database_schema.sql was run
→ Check Supabase SQL editor for tables
→ Test: npm run scrape:test locally
```

---

## 📊 Performance Targets

- Scrape 50 products: ~5 seconds
- Retry on failure: 1s + 3s + 9s = 13s max
- Frontend response: <100ms
- Database query: <500ms

---

## 🎬 Screen Recording (for submission)

Record 2-4 minutes showing:
1. Open frontend → search product
2. Track product
3. Click "Scrape Now"
4. Show scrape log updating
5. Click "Price History" tab
6. Show data logged (success + any failures)
7. Demo timeout/retry scenario if possible

---

## 📮 Submission Email

**To**: `sstephen@ine.com`
**CC**: `ssingh@ine.com`
**Subject**: `First Round: Software Engineer Intern Assignment - Your Name`

**Include**:
- Live frontend URL
- GitHub repo URL
- Screen recording link
- Resume (PDF)

---

## 🎓 Key Decisions (Why We Did This)

| Decision | Why |
|----------|-----|
| Cheerio not Playwright | Mock store HTML complete, Cheerio 10x faster |
| External cron not backend loop | Free tier sleeps, need external trigger |
| Separate log tables | Atomic separation (history vs. all attempts) |
| Retry backoff (1s/3s/9s) | Respects server load gracefully |
| Honest logging | Users see exactly what happened |
| Simple UI | Focus on scraper reliability |

---

## ✅ Ready to Submit?

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Database set up on Supabase
- [ ] Cron jobs scheduled
- [ ] Manual scrape tested
- [ ] Screen recording captured
- [ ] README + DESIGN_NOTE complete
- [ ] GitHub repo public
- [ ] Email ready to send

**Good to go!** 🚀

---

**Need help?** Check full README.md for detailed troubleshooting.
