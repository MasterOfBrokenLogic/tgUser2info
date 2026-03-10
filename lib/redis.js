// lib/redis.js — Upstash Redis REST client
const BASE  = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisPOST(body) {
  if (!BASE || !TOKEN) return null;
  try {
    const res = await fetch(BASE, {
      method:  "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    return data.result ?? null;
  } catch { return null; }
}

// Hash operations
async function hget(hash, field)          { return redisPOST(["HGET", hash, field]); }
async function hset(hash, field, value)   { return redisPOST(["HSET", hash, field, value]); }
async function hdel(hash, field)          { return redisPOST(["HDEL", hash, field]); }
async function hgetall(hash)              { return redisPOST(["HGETALL", hash]); }
async function hincrby(hash, field, by=1) { return redisPOST(["HINCRBY", hash, field, by]); }

// List operations
async function lpush(key, value) { return redisPOST(["LPUSH", key, typeof value === "string" ? value : JSON.stringify(value)]); }
async function ltrim(key, s, e)  { return redisPOST(["LTRIM", key, s, e]); }
async function lrange(key, s, e) {
  const result = await redisPOST(["LRANGE", key, s, e]);
  if (!Array.isArray(result)) return [];
  return result.map(r => { try { return JSON.parse(r); } catch { return r; } });
}

module.exports = { hget, hset, hdel, hgetall, hincrby, lpush, ltrim, lrange };