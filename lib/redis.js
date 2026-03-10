// lib/redis.js
// Upstash Redis REST client — no npm needed, pure fetch

const BASE  = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(...args) {
  if (!BASE || !TOKEN) return null;
  try {
    const res = await fetch(`${BASE}/${args.map(a => encodeURIComponent(a)).join("/")}`, {
      method:  "GET",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const data = await res.json();
    return data.result;
  } catch { return null; }
}

async function redisPOST(body) {
  if (!BASE || !TOKEN) return null;
  try {
    const res = await fetch(BASE, {
      method:  "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    return data.result;
  } catch { return null; }
}

// Push to a Redis list (logs)
async function lpush(key, value) {
  return redisPOST(["LPUSH", key, typeof value === "string" ? value : JSON.stringify(value)]);
}

// Trim list to max N items
async function ltrim(key, start, stop) {
  return redisPOST(["LTRIM", key, start, stop]);
}

// Get range from list
async function lrange(key, start, stop) {
  const result = await redisPOST(["LRANGE", key, start, stop]);
  if (!Array.isArray(result)) return [];
  return result.map(r => { try { return JSON.parse(r); } catch { return r; } });
}

// Increment a counter
async function incr(key) { return redisPOST(["INCR", key]); }

// Get a value
async function get(key) { return redis("GET", key); }

// Set a value
async function set(key, value) { return redisPOST(["SET", key, value]); }

// Increment hash field
async function hincrby(key, field, by = 1) {
  return redisPOST(["HINCRBY", key, field, by]);
}

// Get all hash fields
async function hgetall(key) {
  return redisPOST(["HGETALL", key]);
}

module.exports = { lpush, ltrim, lrange, incr, get, set, hincrby, hgetall };