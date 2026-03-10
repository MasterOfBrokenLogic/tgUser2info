// api/admin/stats.js — GET /api/admin/stats?adminkey=X
const store = require("../../lib/store");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  cors(res);
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const adminKey = req.query.adminkey || req.headers["x-admin-key"];
  if (adminKey !== (process.env.ADMIN_SECRET || "4nsil-admin")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [usage, rejected] = await Promise.all([
    store.getGlobalUsage(),
    store.getRejectedUsage(),
  ]);

  return res.status(200).json({ usage, rejected });
};