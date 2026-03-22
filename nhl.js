// api/nhl.js — Vercel Serverless Function
// Proxies requests to the NHL Stats API, bypassing browser CORS restrictions.
// Deploy to Vercel: https://vercel.com

const ALLOWED_PATHS = [
  /^\/v1\/club-schedule-season\/[A-Z]+\/\d{8}$/,
  /^\/v1\/gamecenter\/\d+\/play-by-play$/,
];

const NHL_BASE = 'https://api-web.nhle.com';

export default async function handler(req, res) {
  // CORS headers — allow your GitHub Pages domain (or * for development)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Security: only allow specific NHL API paths
  const decodedPath = decodeURIComponent(path);
  const isAllowed = ALLOWED_PATHS.some(pattern => pattern.test(decodedPath));

  if (!isAllowed) {
    return res.status(403).json({ error: 'Path not allowed' });
  }

  const nhlUrl = `${NHL_BASE}${decodedPath}`;

  try {
    const nhlRes = await fetch(nhlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CanesShotHeatmap/1.0)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!nhlRes.ok) {
      return res.status(nhlRes.status).json({ error: `NHL API returned ${nhlRes.status}` });
    }

    const data = await nhlRes.json();

    // Cache for 5 minutes (completed games don't change)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (err) {
    console.error('NHL proxy error:', err);
    return res.status(500).json({ error: 'Failed to fetch from NHL API', detail: err.message });
  }
}
