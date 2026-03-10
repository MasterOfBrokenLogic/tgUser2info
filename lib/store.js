// lib/store.js — fully Redis-backed store
const db = require("./redis");

const KEYS_HASH = "tgosint:keys";

// ── Key management ────────────────────────────────────────────────────────────
async function getKey(key) {
  const raw = await db.hget(KEYS_HASH, key);
  if (!raw) return null;
  try { return typeof raw === "object" ? raw : JSON.parse(raw); }
  catch { return null; }
}

async function setKey(key, data) {
  await db.hset(KEYS_HASH, key, JSON.stringify(data));
}

async function deleteKey(key) {
  await db.hdel(KEYS_HASH, key);
}

async function allKeys() {
  const raw = await db.hgetall(KEYS_HASH);
  if (!raw || !Array.isArray(raw)) return {};
  const result = {};
  for (let i = 0; i < raw.length; i += 2) {
    try { result[raw[i]] = typeof raw[i+1] === "object" ? raw[i+1] : JSON.parse(raw[i+1]); }
    catch { result[raw[i]] = raw[i+1]; }
  }
  return result;
}

// ── Record a successful request ───────────────────────────────────────────────
async function recordRequest(key, query, ip) {
  const k = await getKey(key);
  if (!k) return;

  const today = new Date().toISOString().slice(0, 10);
  k.totalRequests = (k.totalRequests || 0) + 1;
  k.lastUsed = new Date().toISOString();
  if (!k.dailyUsage) k.dailyUsage = {};
  k.dailyUsage[today] = (k.dailyUsage[today] || 0) + 1;
  // Keep only last 30 days
  const days = Object.keys(k.dailyUsage).sort();
  if (days.length > 30) days.slice(0, days.length - 30).forEach(d => delete k.dailyUsage[d]);
  await setKey(key, k);

  // Push to log
  const entry = { type: "success", time: new Date().toISOString(), key, label: k.label || key, query: query || "—", ip: ip || "—" };
  await db.lpush("tgosint:log", entry);
  await db.ltrim("tgosint:log", 0, 499);
  await db.hincrby("tgosint:daily", today, 1);
}

// ── Record a rejected request ─────────────────────────────────────────────────
async function recordRejected(key, query, ip, reason) {
  const entry = { type: "rejected", time: new Date().toISOString(), key: key || "—", label: "—", query: query || "—", ip: ip || "—", reason: reason || "Invalid key" };
  await db.lpush("tgosint:log", entry);
  await db.ltrim("tgosint:log", 0, 499);
  const today = new Date().toISOString().slice(0, 10);
  await db.hincrby("tgosint:rejected", today, 1);
}

// ── Get log ───────────────────────────────────────────────────────────────────
async function getLog(limit = 100) {
  return db.lrange("tgosint:log", 0, limit - 1);
}

// ── Get global usage ──────────────────────────────────────────────────────────
async function getGlobalUsage() {
  const raw = await db.hgetall("tgosint:daily");
  if (!raw || !Array.isArray(raw)) return {};
  const result = {};
  for (let i = 0; i < raw.length; i += 2) result[raw[i]] = parseInt(raw[i+1]) || 0;
  return result;
}

async function getRejectedUsage() {
  const raw = await db.hgetall("tgosint:rejected");
  if (!raw || !Array.isArray(raw)) return {};
  const result = {};
  for (let i = 0; i < raw.length; i += 2) result[raw[i]] = parseInt(raw[i+1]) || 0;
  return result;
}

// Keys are managed entirely via the admin panel and stored in Redis.

module.exports = { getKey, setKey, deleteKey, allKeys, recordRequest, recordRejected, getLog, getGlobalUsage, getRejectedUsage };