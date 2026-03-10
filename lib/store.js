// lib/store.js
const fs  = require("fs");
const path = require("path");
const db  = require("./redis");

let _store = null;

function load() {
  if (_store) return _store;
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "keys.json"), "utf8");
    _store = JSON.parse(raw);
  } catch {
    _store = { keys: {} };
  }
  return _store;
}

function getKey(key)       { return load().keys[key] || null; }
function setKey(key, data) { load().keys[key] = data; }
function deleteKey(key)    { delete load().keys[key]; }
function allKeys()         { return load().keys; }

async function recordRequest(key, query, ip) {
  const k = getKey(key);
  if (!k) return;

  // Update in-memory key stats
  k.totalRequests = (k.totalRequests || 0) + 1;
  k.lastUsed = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  if (!k.dailyUsage) k.dailyUsage = {};
  k.dailyUsage[today] = (k.dailyUsage[today] || 0) + 1;
  const days = Object.keys(k.dailyUsage).sort();
  if (days.length > 30) days.slice(0, days.length - 30).forEach(d => delete k.dailyUsage[d]);

  // Persist to Redis
  const entry = {
    type:  "success",
    time:  new Date().toISOString(),
    key,
    label: k.label || key,
    query: query || "—",
    ip:    ip || "—",
  };
  await db.lpush("tgosint:log", entry);
  await db.ltrim("tgosint:log", 0, 499);          // keep last 500
  await db.hincrby("tgosint:daily", today, 1);    // global daily counter
  await db.hincrby("tgosint:bykey", key, 1);      // per-key total counter
}

async function recordRejected(key, query, ip, reason) {
  const entry = {
    type:   "rejected",
    time:   new Date().toISOString(),
    key:    key || "—",
    label:  "—",
    query:  query || "—",
    ip:     ip || "—",
    reason: reason || "Invalid key",
  };
  await db.lpush("tgosint:log", entry);
  await db.ltrim("tgosint:log", 0, 499);
  const today = new Date().toISOString().slice(0, 10);
  await db.hincrby("tgosint:rejected", today, 1);
}

async function getLog(limit = 100) {
  return db.lrange("tgosint:log", 0, limit - 1);
}

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

module.exports = { getKey, setKey, deleteKey, allKeys, recordRequest, recordRejected, getLog, getGlobalUsage, getRejectedUsage };