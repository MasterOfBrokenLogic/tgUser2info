// lib/store.js
const fs   = require("fs");
const path = require("path");

let _store = null;

// In-memory request log (last 200 entries, resets on cold start)
const _log = [];
const MAX_LOG = 200;

// Global daily usage across all keys (in-memory, merges with keys.json data on load)
const _globalUsage = {};

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

function getKey(key)        { return load().keys[key] || null; }
function setKey(key, data)  { load().keys[key] = data; }
function deleteKey(key)     { delete load().keys[key]; }
function allKeys()          { return load().keys; }
function getLog()           { return _log; }

function recordRequest(key, query, ip) {
  const k = getKey(key);
  if (!k) return;

  // Update key stats
  k.totalRequests = (k.totalRequests || 0) + 1;
  k.lastUsed = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  if (!k.dailyUsage) k.dailyUsage = {};
  k.dailyUsage[today] = (k.dailyUsage[today] || 0) + 1;
  const days = Object.keys(k.dailyUsage).sort();
  if (days.length > 30) days.slice(0, days.length - 30).forEach(d => delete k.dailyUsage[d]);

  // Add to request log
  _log.unshift({
    time:  new Date().toISOString(),
    key,
    label: k.label || key,
    query: query || "—",
    ip:    ip || "—",
  });

  // Keep only last 200
  if (_log.length > MAX_LOG) _log.pop();

  // Track global daily usage
  _globalUsage[today] = (_globalUsage[today] || 0) + 1;
}

function getGlobalUsage() {
  // Merge in-memory global usage with per-key dailyUsage from store
  const merged = { ..._globalUsage };
  const keys = Object.values(load().keys || {});
  keys.forEach(k => {
    Object.entries(k.dailyUsage || {}).forEach(([day, count]) => {
      merged[day] = (merged[day] || 0);
      // Only add if not already counted in memory (avoid double counting)
    });
  });
  // Build last 30 days from per-key data as fallback
  const fromKeys = {};
  keys.forEach(k => {
    Object.entries(k.dailyUsage || {}).forEach(([day, count]) => {
      fromKeys[day] = (fromKeys[day] || 0) + count;
    });
  });
  // Prefer in-memory global, fall back to summed per-key data
  const final = { ...fromKeys };
  Object.entries(_globalUsage).forEach(([day, count]) => {
    final[day] = count; // in-memory is most accurate for current session
  });
  return final;
}

module.exports = { getKey, setKey, deleteKey, allKeys, recordRequest, getLog, getGlobalUsage };