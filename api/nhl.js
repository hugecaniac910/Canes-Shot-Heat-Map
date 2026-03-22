// api/nhl.js — Vercel Serverless Function
const ALLOWED_PATHS = [
  /^\/v1\/club-schedule-season\/[A-Z]+\/\d{8}$/,
  /^\/v1\/gamecenter\/\d+\/play-by-play$/,
];

const NHL_BASE = 'https://api-web.nhle.com';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const raw = req.query.path;
  if (!raw) return res.status(400).json({ error: 'Missing path parameter' });

  const decodedPath = decodeURIComponent(Array.isArray(raw) ? raw[0] : raw);
  const isAllowed = ALLOWED_PATHS.some(p => p.test(decodedPath));
  if (!isAllowed) return res.status(403).json({ error: 'Path not allowed: ' + decodedPath });

  const nhlUrl = `${NHL_BASE}${decodedPath}`;

  try {
    const nhlRes = await fetch(nhlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CanesShotHeatmap/1.0)',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!nhlRes.ok) {
      return res.status(nhlRes.status).json({ error: `NHL API returned ${nhlRes.status}` });
    }

    const data = await nhlRes.json();
    // Tell browser not to cache — always fetch fresh from our proxy
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
