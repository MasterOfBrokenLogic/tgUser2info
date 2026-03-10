// api/index.js  →  GET /?key=YOURKEY&q=@username

const https    = require("https");
const http     = require("http");
const store    = require("../lib/store");
const { sendTelegram } = require("../lib/telegram");

// ── Cache ─────────────────────────────────────────────────────────────────────
const _cache    = new Map();
const CACHE_TTL = 15 * 60 * 1000;

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
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket?.remoteAddress || "—";

  // ── 1. Key check ─────────────────────────────────────────────────────────────
  if (!key) {
    // Fire and forget — don't await alerts
    store.recordRejected("—", q || "—", ip, "No key provided");
    sendTelegram(
      `🚨 <b>TGOSINT — No Key</b>\n` +
      `📍 IP: <code>${ip}</code>\n` +
      `🔍 Query: <code>${q || "—"}</code>\n` +
      `❌ Reason: No API key provided`
    );
    return res.status(401).json({ error: "Missing API key.", hint: "Usage: /?key=YOUR_KEY&q=@username" });
  }

  const keyData = store.getKey(key);

  if (!keyData) {
    store.recordRejected(key, q || "—", ip, "Invalid key");
    sendTelegram(
      `🚨 <b>TGOSINT — Invalid Key Attempt</b>\n` +
      `🔑 Key tried: <code>${key}</code>\n` +
      `📍 IP: <code>${ip}</code>\n` +
      `🔍 Query: <code>${q || "—"}</code>\n` +
      `❌ Reason: Key not found`
    );
    return res.status(401).json({ error: "Invalid API key." });
  }

  if (!keyData.active) {
    store.recordRejected(key, q || "—", ip, "Key blocked");
    sendTelegram(
      `🚨 <b>TGOSINT — Blocked Key Used</b>\n` +
      `🔑 Key: <code>${key}</code> (${keyData.label || key})\n` +
      `📍 IP: <code>${ip}</code>\n` +
      `🔍 Query: <code>${q || "—"}</code>\n` +
      `❌ Reason: Key is blocked`
    );
    return res.status(403).json({ error: "API key disabled. Contact @drazeforce" });
  }

  // ── 2. Query check ────────────────────────────────────────────────────────────
  if (!q || q.trim() === "") {
    return res.status(400).json({ error: "Missing query.", hint: "Usage: /?key=YOUR_KEY&q=@username" });
  }

  const cleanQ = q.trim();

  // ── 3. Record + alert ─────────────────────────────────────────────────────────
  store.recordRequest(key, cleanQ, ip);
  sendTelegram(
    `✅ <b>TGOSINT — New Request</b>\n` +
    `🔑 Key: <code>${key}</code> (${keyData.label || key})\n` +
    `🔍 Query: <code>${cleanQ}</code>\n` +
    `📍 IP: <code>${ip}</code>\n` +
    `🕐 Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`
  );

  // ── 4. Cache ──────────────────────────────────────────────────────────────────
  const cached = cacheGet(cleanQ);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cached);
  }

  // ── 5. Upstream call ──────────────────────────────────────────────────────────
  const UPSTREAM_KEY = process.env.UPSTREAM_KEY;
  const UPSTREAM_URL = process.env.UPSTREAM_URL || "https://tg-to-num-six.vercel.app/";
  if (!UPSTREAM_KEY) return res.status(500).json({ error: "Service not configured. Contact @drazeforce" });

  const upstreamURL = `${UPSTREAM_URL}?key=${UPSTREAM_KEY}&q=${encodeURIComponent(cleanQ)}`;

  try {
    const { status, body } = await fetchJSON(upstreamURL, 12000);
    if (status !== 200) return res.status(502).json({ error: `Lookup failed (${status})` });

    // Strip upstream branding, add ours
    const { credit, owner, admin, help_group, your_usage, note, ...clean } = body;
    const final = { ...clean, credit: "@drazeforce", owner: "@drazeforce", admin: "@drazeforce" };

    cacheSet(cleanQ, final);
    res.setHeader("X-Cache", "MISS");
    return res.status(200).json(final);

  } catch (err) {
    if (err.message === "TIMEOUT") return res.status(504).json({ error: "Request timed out — try again" });
    console.error("[4NSIL]", err.message);
    return res.status(500).json({ error: "Lookup failed — try again" });
  }
};