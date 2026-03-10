// api/admin/keys.js
// GET    /api/admin/keys?adminkey=X       → list all keys
// POST   /api/admin/keys?adminkey=X       → create { key, label }
// PATCH  /api/admin/keys?adminkey=X       → toggle { key, active }
// DELETE /api/admin/keys?adminkey=X&key=Y → delete key

const store = require("../../lib/store");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function auth(req, res) {
  const k = req.query.adminkey || req.headers["x-admin-key"];
  if (k !== (process.env.ADMIN_SECRET || "4nsil-admin")) {
    res.status(401).json({ error: "Unauthorized" }); return false;
  }
  return true;
}

function body(req) {
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
  if (!auth(req, res)) return;

  if (req.method === "GET") {
    return res.status(200).json({ keys: store.allKeys() });
  }

  if (req.method === "POST") {
    const { key, label } = await body(req);
    if (!key) return res.status(400).json({ error: "key required" });
    if (store.getKey(key)) return res.status(409).json({ error: "Key already exists" });
    store.setKey(key, {
      label: label || key, active: true,
      createdAt: new Date().toISOString(),
      totalRequests: 0, lastUsed: null, dailyUsage: {}
    });
    return res.status(201).json({ ok: true, key });
  }

  if (req.method === "PATCH") {
    const { key, active } = await body(req);
    const k = store.getKey(key);
    if (!k) return res.status(404).json({ error: "Key not found" });
    k.active = active;
    store.setKey(key, k);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { key } = req.query;
    if (!key || !store.getKey(key)) return res.status(404).json({ error: "Key not found" });
    store.deleteKey(key);
    return res.status(200).json({ ok: true, deleted: key });
  }

  res.status(405).json({ error: "Method not allowed" });
};
