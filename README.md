# 🏒 Carolina Hurricanes Shot Heatmap

An interactive shot heatmap for the Carolina Hurricanes. Pulls live data from the **free NHL Stats API** via a Vercel serverless proxy — no API key required, no CORS issues.

![Carolina Hurricanes](https://img.shields.io/badge/Team-Carolina%20Hurricanes-CC0000?style=flat-square) ![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square) ![NHL API](https://img.shields.io/badge/Data-NHL%20Stats%20API-blue?style=flat-square)

---

## Why a Vercel Proxy?

The NHL Stats API blocks direct browser requests with strict CORS headers. To solve this, this project includes a tiny **Vercel serverless function** (`api/nhl.js`) that:

1. Receives requests from the frontend at `/api/nhl?path=...`
2. Fetches the NHL API server-side (no CORS restrictions)
3. Returns the data back to the browser with open CORS headers

No API keys. No costs. Vercel's free tier is more than enough.

---

## Project Structure

```
canes-shot-heatmap/
├── index.html        ← The entire frontend (single file)
├── api/
│   └── nhl.js        ← Vercel serverless proxy for NHL API
├── vercel.json       ← Vercel routing config
├── package.json      ← Node version config
└── README.md
```

---

## Deploy to Vercel (5 minutes)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Canes shot heatmap"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/canes-shot-heatmap.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `canes-shot-heatmap` repository
4. Leave all settings as defaults — Vercel auto-detects everything
5. Click **"Deploy"**

Your app will be live at:
```
https://canes-shot-heatmap.vercel.app
```

### Step 3 — Done!

No environment variables needed. No build step. It just works.

---

## Running Locally

You need the [Vercel CLI](https://vercel.com/docs/cli) to run the serverless function locally:

```bash
npm install -g vercel
vercel dev
```

Then open `http://localhost:3000` in your browser.

> Without `vercel dev`, the `/api/nhl` proxy won't run and the app will fail to fetch data. The Vercel CLI handles this automatically.

---

## How It Works

```
Browser
  │
  │  GET /api/nhl?path=/v1/club-schedule-season/CAR/20242025
  ▼
Vercel Serverless Function (api/nhl.js)
  │
  │  Fetches NHL API server-side (no CORS restrictions)
  ▼
NHL Stats API (api-web.nhle.com)
  │
  │  Returns JSON
  ▼
Vercel caches response for 5 minutes
  │
  ▼
Browser renders heatmap
```

### NHL Coordinate System

- `x` ranges from `-100` to `100` (feet from center, end-to-end)
- `y` ranges from `-42.5` to `42.5` (feet from center, side-to-side)
- Odd periods (1, 3): away team attacks positive x
- Even periods (2): sides flip

All Canes shots are normalized to always appear on the right half.

---

## Features

- **Live NHL data** — real play-by-play shot coordinates
- **KDE heatmap** — Gaussian kernel density shows shot concentration
- **4 shot filters** — All Shots, Shots on Goal, Goals, Missed/Blocked (Corsi)
- **Season selector** — 2021–22 through 2024–25
- **Zone breakdown** — Slot, Left/Right Circle, High Slot, Perimeter %
- **Caching** — completed game data cached 5 min on Vercel edge

---

## Ideas for Extending

- Add **player filter** — heatmap per shooter (e.g. Aho, Necas, Svechnikov)
- Add **game situation** — 5v5, Power Play, Penalty Kill
- Add **opponent shots** — show what teams do against Carolina
- Expand to **all 32 teams** with a team picker
- Add **expected goals (xG)** weighting to heatmap intensity
- Add **game-by-game scrubber** — animate through the season

---

## Data Source

All data from the **NHL Stats API** (free, no auth required):
- `https://api-web.nhle.com/v1/club-schedule-season/CAR/{season}`
- `https://api-web.nhle.com/v1/gamecenter/{gameId}/play-by-play`

---

## License

MIT — free to use, modify, and share.
