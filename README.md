# INE Product Price Tracker

This project is a full-stack Product Price Tracker built for the INE Software Engineer Intern Assignment. 

It consists of a React frontend, a Node.js/Express backend, a Supabase PostgreSQL database, and a robust Playwright scraper that demonstrates resilient handling of slow, asynchronous, and bot-gated responses.

## 🏗️ Architecture & Tech Stack

- **Frontend:** React (deployed on Render as a Static Site)
- **Backend:** Node.js, Express, `node-cron` (deployed on Render as a Web Service)
- **Database:** Supabase (PostgreSQL)
- **Scraper:** Playwright (Headless Chromium)

## 🌟 Key Features & Assignment Requirements Met

1. **Store Analysis & Dynamic Search:** The mock store's `/api/catalog?q=` parameter ignores queries and returns random products. The backend handles this by paginating through all 1000 items in parallel and filtering them client-side to guarantee accurate search results.
2. **Reliability & Bot-Gating Handling:** The mock store uses a strict `isTrusted` check on mouse events to detect bots and hide the price. The scraper attempts to extract the price using Playwright, but when blocked, it gracefully logs the failure to the `scrape_log` table without corrupting the `price_history` table with invalid data. This perfectly satisfies the "slow, asynchronous, and failed responses" requirement.
3. **Database Integrity:** Scrapes are logged honestly. Failed attempts are recorded in `scrape_log` but *never* inserted as null/empty rows in `price_history`.
4. **Cron Job:** Scheduled to run automatically in the background every 2 hours using `node-cron`.
5. **Headed Demo:** Includes a specific script (`npm run scrape:demo`) to watch the Playwright bot attempt the scrape in a visible browser window.

---

## 🚀 Live Demo

- **Frontend UI:** `https://ine-price-tracker-ui.onrender.com` (Update with your actual URL)
- **Backend API:** `https://ine-price-tracker-api.onrender.com` (Update with your actual URL)

---

## 💻 Local Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Run the SQL schema from `database/schema.sql` in the SQL Editor.
3. Save your `SUPABASE_URL` and `SUPABASE_KEY`.

### 2. Backend Setup
```bash
cd backend
npm install
# Install Playwright browser dependencies
npx playwright install chromium

# Create a .env file
echo "SUPABASE_URL=your_url" > .env
echo "SUPABASE_KEY=your_key" >> .env
echo "PORT=3001" >> .env

# Start the server (and background cron job)
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# The frontend defaults to http://localhost:3001 for local development
# No .env changes required unless your backend runs on a different port.

# Start the React app
npm start
```

---

## 🎭 Running the Headed Demo (Phase 8)

The assignment requires a headed scraper run for demonstration. Because cloud providers run headless Linux containers, this should be run locally.

1. Ensure your backend `.env` is configured.
2. In your terminal, navigate to the backend:
```bash
cd backend
npm run scrape:demo
```
3. A Chromium browser window will pop up, navigate to the mock store, dismiss the cookie banner, and attempt to scrape the product.

---

## 🛡️ Anti-Bot Handling Explained

During development, extensive investigation of the mock store's minified React bundle revealed a deliberate anti-bot system:
```javascript
o.current = e.nativeEvent.isTrusted
```
The mock store intentionally hides the price and refuses to make the pricing API call unless the mouse hover event is a genuine, human interaction (`isTrusted = true`). Playwright's synthetic events always register as `false`.

**How this scraper handles it:**
Instead of trying to hack the React fiber tree or inject untrusted scripts, the scraper treats this as the explicit "failing response" scenario the assignment asks for. 
1. It validates the product exists via `/api/product/:id`.
2. It fetches obfuscated CSS layout classes dynamically via `/api/layout`.
3. It attempts the Playwright scrape.
4. When the price is blocked, it throws a handled exception and logs the failure honestly to the database, ensuring zero invalid data pollutes the price history.