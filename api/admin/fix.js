// api/admin/fix.js
// GET /api/admin/fix?adminkey=X&key=Y  → force set a key to active in Redis

const BASE  = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function raw(...args) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  return res.json();
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  const adminKey = req.query.adminkey;
  if (adminKey !== (process.env.ADMIN_SECRET || "4nsil-admin")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const key = req.query.key;
  if (!key) return res.status(400).json({ error: "?key= required" });

  // Get current value
  const current = await raw("HGET", "tgosint:keys", key);
  let data = {};
  try { data = JSON.parse(current.result); } catch {}

  // Force active
  data.active = true;
  if (!data.label) data.label = key;
  if (!data.createdAt) data.createdAt = new Date().toISOString();
  if (!data.totalRequests) data.totalRequests = 0;
  if (!data.dailyUsage) data.dailyUsage = {};

  await raw("HSET", "tgosint:keys", key, JSON.stringify(data));

  return res.status(200).json({ ok: true, key, data });
};