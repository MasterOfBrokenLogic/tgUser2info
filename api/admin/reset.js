// api/admin/reset.js
// POST /api/admin/reset?adminkey=X&key=Y  → force delete a key from Redis
// POST /api/admin/reset?adminkey=X&action=clearall → wipe ALL keys from Redis (nuclear option)

const db    = require("../../lib/redis");
const store = require("../../lib/store");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function parseBody(req) {
  return new Promise(resolve => {
    let d = "";
    req.on("data", c => d += c);
    req.on("end", () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
  });
}

module.exports = async function handler(req, res) {
  cors(res);
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const adminKey = req.query.adminkey || req.headers["x-admin-key"];
  if (adminKey !== (process.env.ADMIN_SECRET || "4nsil-admin")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { action, key } = req.query;

  // Wipe ALL keys from Redis hash
  if (action === "clearall") {
    await db.redisPOST(["DEL", "tgosint:keys"]);
    return res.status(200).json({ ok: true, message: "All keys wiped from Redis. Re-add them via admin panel." });
  }

  // Force delete a single key from Redis
  if (key) {
    await db.hdel("tgosint:keys", key);
    return res.status(200).json({ ok: true, deleted: key });
  }

  return res.status(400).json({ error: "Provide ?key=X to delete one key, or ?action=clearall to wipe all" });
};