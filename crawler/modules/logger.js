// modules/logger.js – Lotus v1.5.3 (Big5 註解)
// 注意：務必使用 ESM（.js + package.json 中 "type":"module"）

import fs from 'fs';

//
// ======= nowStr =======
// 返回當前時間字串：預設不含秒，full=true 時含秒
//
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

//
// ======= logOverall =======
// 記錄到 data/overalllog.json，保留最新 2000 條，**以字串格式存儲（舊版樣式）**
//
function logOverall(entry) {
  try {
    const path = './data/overalllog.json';
    let arr = [];
    if (fs.existsSync(path)) {
      try {
        arr = JSON.parse(fs.readFileSync(path, 'utf8').trim());
        if (!Array.isArray(arr)) arr = [];
      } catch {
        arr = [];
      }
    }
    arr.unshift(entry);
    fs.writeFileSync(path, JSON.stringify(arr.slice(0, 2000), null, 2), 'utf8');
  } catch {
    // 即便寫入失敗，也不影響主流程
  }
}

//
// ======= logInfo =======
// [INFO] ℹ️
//
function logInfo(script, msg) {
  const out = `[${nowStr()}] [INFO] ℹ️ ${script} ${msg}`;
  console.log(out);
  logOverall(out);
}

//
// ======= logSuccess =======
// [成功] ✅
//
function logSuccess(script, msg) {
  const out = `[${nowStr()}] [成功] ✅ ${script} ${msg}`;
  console.log(out);
  logOverall(out);
}

//
// ======= logError =======
// [錯誤] ❌
//
function logError(script, msg) {
  const out = `[${nowStr()}] [錯誤] ❌ ${script} ${msg}`;
  console.error(out);
  logOverall(out);
}

//
// ======= logPreview =======
// [預覽] 👀 只保留前 220 字
//
function logPreview(script, data) {
  const preview = typeof data === 'string'
    ? data
    : JSON.stringify(data, null, 2);
  const message = preview.length > 220
    ? preview.slice(0, 220) + '…'
    : preview;
  const out = `[${nowStr()}] [預覽] 👀 ${script} ${message}`;
  console.log(out);
  logOverall(out);
}

//
// ======= logSavedMain =======
// 主檔寫入成功（會產生一條 SUCCESS）
//
function logSavedMain(script, count, file) {
  const msg = `主檔已寫入，共 ${count} 條 → ${file}`;
  logSuccess(script, msg);
}

//
// ======= logSavedHis =======
// 歷史檔寫入成功（會產生一條 SUCCESS）
//
function logSavedHis(script, file, count) {
  const msg = `歷史已寫入：${file}，本次新增 ${count} 條`;
  logSuccess(script, msg);
}

// ======= 統一 export，**每個都 export** =======
export {
  nowStr,
  logOverall,
  logInfo,
  logSuccess,
  logError,
  logPreview,
  logSavedMain,
  logSavedHis
};