// api/index.js  →  handles  GET /?key=YOURKEY&q=@username

const https = require("https");
const http  = require("http");
const store = require("../lib/store");

// ── Cache ─────────────────────────────────────────────────────────────────────
const _cache    = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 min

function cacheGet(q) {
  const e = _cache.get(q);
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL) { _cache.delete(q); return null; }
  return e.data;
}
function cacheSet(q, data) {
  if (_cache.size > 300) {
    const cut = Date.now() - CACHE_TTL;
    for (const [k, v] of _cache) if (v.ts < cut) _cache.delete(k);
  }
  _cache.set(q, { data, ts: Date.now() });
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
function fetchJSON(url, ms = 12000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const timer  = setTimeout(() => reject(new Error("TIMEOUT")), ms);
    const req = client.get(url, res => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        clearTimeout(timer);
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: { raw } }); }
      });
    });
    req.on("error", e => { clearTimeout(timer); reject(e); });
  });
}

// ── CORS ──────────────────────────────────────────────────────────────────────
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  cors(res);
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "GET")     { res.status(405).json({ error: "Method not allowed" }); return; }

  const { key, q } = req.query;

  // ── 1. Key auth ─────────────────────────────────────────────────────────────
  if (!key) {
    return res.status(401).json({
      error:   "Missing API key",
      message: "Usage: /?key=YOUR_KEY&q=@username"
    });
  }

  const keyData = store.getKey(key);
  if (!keyData) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  if (!keyData.active) {
    return res.status(403).json({ error: "API key disabled. Contact @4nsil" });
  }

  // ── 2. Query check ──────────────────────────────────────────────────────────
  if (!q || q.trim() === "") {
    return res.status(400).json({
      error:   "Missing query",
      message: "Usage: /?key=YOUR_KEY&q=@username"
    });
  }

  const cleanQ = q.trim();

  // ── 3. Record usage ─────────────────────────────────────────────────────────
  store.recordRequest(key);

  // ── 4. Cache ─────────────────────────────────────────────────────────────────
  const cached = cacheGet(cleanQ);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cached);
  }

  // ── 5. Upstream call (HIDDEN — never exposed to caller) ──────────────────────
  const UPSTREAM_KEY = process.env.UPSTREAM_KEY;
  const UPSTREAM_URL = process.env.UPSTREAM_URL || "https://tg-to-num-six.vercel.app/";

  if (!UPSTREAM_KEY) {
    return res.status(500).json({ error: "Service not configured. Contact @4nsil" });
  }

  // Build upstream URL — stays 100% server-side
  const upstreamURL = `${UPSTREAM_URL}?key=${UPSTREAM_KEY}&q=${encodeURIComponent(cleanQ)}`;

  try {
    const { status, body } = await fetchJSON(upstreamURL, 12000);

    if (status !== 200) {
      return res.status(502).json({ error: `Lookup failed (${status})` });
    }

    // Remove upstream branding, add ours
    const { credit, owner, admin, help_group, your_usage, note, ...clean } = body;
    const final = {
      ...clean,
      credit: "@drazeforce",
      owner:  "@drazeforce",
      admin:  "@drazeforce",
    };

    cacheSet(cleanQ, final);
    res.setHeader("X-Cache", "MISS");
    return res.status(200).json(final);

  } catch (err) {
    if (err.message === "TIMEOUT") {
      return res.status(504).json({ error: "Request timed out — try again" });
    }
    console.error("[4NSIL]", err.message);
    return res.status(500).json({ error: "Lookup failed — try again" });
  }
};