// api/admin/nuke.js
// GET /api/admin/nuke?adminkey=X  → completely destroys and recreates the keys hash in Redis

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

  // 1. See what's currently in Redis
  const before = await raw("HGETALL", "tgosint:keys");

  // 2. Nuke the entire hash
  await raw("DEL", "tgosint:keys");

  // 3. Verify it's gone
  const after = await raw("HGETALL", "tgosint:keys");

  return res.status(200).json({
    ok: true,
    message: "Redis keys hash deleted. You can now add keys fresh from admin panel.",
    before: before.result,
    after: after.result,
  });
};