// modules/historyManager.js - Lotus v1.6.0-0710（Big5 註解）
import fs from 'fs';
import dayjs from 'dayjs';

function nowStr(full = false) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const H = String(now.getHours()).padStart(2, '0');
  const M = String(now.getMinutes()).padStart(2, '0');
  const S = String(now.getSeconds()).padStart(2, '0');
  return full
    ? `${y}-${m}-${d} ${H}:${M}:${S}`
    : `${y}-${m}-${d} ${H}:${M}`;
}

// === 主函數，呼叫格式：saveHistoryAndUpdateLast(news, key, hisFile, lastFile, operation)
export function saveHistoryAndUpdateLast(news, key, hisPath, lastPath, operation = 'scheduled') {
  let history = [];
  let newCount = 0;
  // 1. 讀取歷史
  if (fs.existsSync(hisPath)) {
    try { history = JSON.parse(fs.readFileSync(hisPath, 'utf8').trim()); }
    catch { history = []; }
  }
  const oldLinks = new Set(history.map(n => n.link));
  const toAdd = news.filter(n => n.link && !oldLinks.has(n.link));
  // 2. 合併寫入歷史
  if (toAdd.length) {
    history = [...toAdd, ...history].slice(0, 1000);
    fs.writeFileSync(hisPath, JSON.stringify(history, null, 2), 'utf8');
    newCount = toAdd.length;
  }

  // 3. 更新 last_updated.json
  let lastAll = {};
  if (fs.existsSync(lastPath)) {
    try { lastAll = JSON.parse(fs.readFileSync(lastPath, 'utf8').trim()); }
    catch { lastAll = {}; }
  }
  if (!lastAll[key]) lastAll[key] = {};
  const now = nowStr(true);
  lastAll[key].lastRun = now;
  lastAll[key].lastSuccess = now;
  lastAll[key].lastManual = null; // 如有手動操作再補
  lastAll[key].fetch = key;
  lastAll[key].lastAdded = now;
  lastAll[key].lastOperation = operation; // scheduled/manual/auto
  fs.writeFileSync(lastPath, JSON.stringify(lastAll, null, 2), 'utf8');

  return { newCount };
}

// 只寫入歷史，不動 last_updated
export function saveToHisAll(hisPath, arr) {
  try {
    fs.writeFileSync(hisPath, JSON.stringify(arr, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

// 批次重建所有 last_updated.json（保留用）
export function updateLastAddedAll(map, lastPath = './data/last_updated.json') {
  try {
    let data = {};
    if (fs.existsSync(lastPath)) {
      try { data = JSON.parse(fs.readFileSync(lastPath, 'utf8').trim()); } catch { data = {}; }
    }
    Object.keys(map).forEach(k => {
      data[k] = { lastSuccess: map[k] };
    });
    fs.writeFileSync(lastPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch { return false; }
}