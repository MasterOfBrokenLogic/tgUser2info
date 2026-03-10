// lib/store.js
const fs   = require("fs");
const path = require("path");

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

function getKey(key)        { return load().keys[key] || null; }
function setKey(key, data)  { load().keys[key] = data; }
function deleteKey(key)     { delete load().keys[key]; }
function allKeys()          { return load().keys; }

function recordRequest(key) {
  const k = getKey(key);
  if (!k) return;
  k.totalRequests = (k.totalRequests || 0) + 1;
  k.lastUsed = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  if (!k.dailyUsage) k.dailyUsage = {};
  k.dailyUsage[today] = (k.dailyUsage[today] || 0) + 1;
  // Keep only last 30 days
  const days = Object.keys(k.dailyUsage).sort();
  if (days.length > 30) days.slice(0, days.length - 30).forEach(d => delete k.dailyUsage[d]);
}

module.exports = { getKey, setKey, deleteKey, allKeys, recordRequest };