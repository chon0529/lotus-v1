import fs from 'fs';
import path from 'path';

// ✅ 儲存歷史資料到 *_his.json
function saveHistory(currentList, fileBase) {
  const hisPath = `./data/${fileBase}_his.json`;
  let history = [];

  if (fs.existsSync(hisPath)) {
    try {
      const raw = fs.readFileSync(hisPath, 'utf-8');
      history = JSON.parse(raw);
    } catch (e) {
      console.warn(`[警告] 無法讀取 ${fileBase}_his.json，將重新建立`);
    }
  }

  const existingLinks = new Set(history.map(item => item.link));
  const newItems = currentList.filter(item => !existingLinks.has(item.link));
  const updatedHistory = [...newItems, ...history].slice(0, 1000); // 最多保留 1000 筆

  fs.writeFileSync(hisPath, JSON.stringify(updatedHistory, null, 2), 'utf-8');

  return {
    newCount: newItems.length,
    newItems
  };
}

// ✅ 更新 last_updated.json
function saveLastUpdated(fileBase) {
  const lastPath = './data/last_updated.json';
  let lastMap = {};

  if (fs.existsSync(lastPath)) {
    try {
      const raw = fs.readFileSync(lastPath, 'utf-8');
      lastMap = JSON.parse(raw);
    } catch (e) {
      console.warn(`[警告] 無法讀取 last_updated.json，將重新建立`);
    }
  }

  const now = new Date().toISOString();
  lastMap[fileBase] = {
    lastRun: now,
    lastSuccess: now
  };

  fs.writeFileSync(lastPath, JSON.stringify(lastMap, null, 2), 'utf-8');
}

// ✅ 整合：同時儲存歷史與更新時間
function saveHistoryAndUpdateLast(currentList, fileBase) {
  const result = saveHistory(currentList, fileBase);
  saveLastUpdated(fileBase);
  return result; // 回傳新增筆數與項目
}

export {
  saveHistory,
  saveLastUpdated,
  saveHistoryAndUpdateLast
};
