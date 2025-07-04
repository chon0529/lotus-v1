import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Macau");

// 儲存歷史資料到 *_his.json
function saveHistory(currentList, fileBase) {
  const hisPath = path.resolve(`./data/${fileBase}_his.json`);
  let history = [];

  if (fs.existsSync(hisPath)) {
    try {
      const raw = fs.readFileSync(hisPath, 'utf-8');
      history = JSON.parse(raw);
    } catch (e) {
      console.warn(`[警告] 無法讀取 ${fileBase}_his.json，將重新建立`);
    }
  }

  if (!Array.isArray(currentList)) {
    console.warn(`[錯誤] 傳入的 currentList 不是陣列`);
    currentList = [];
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

// 更新 last_updated.json，並區分手動/自動
function saveLastUpdated(fileBase, isManual = false) {
  const lastPath = path.resolve('./data/last_updated.json');
  let lastMap = {};

  if (fs.existsSync(lastPath)) {
    try {
      const raw = fs.readFileSync(lastPath, 'utf-8');
      lastMap = JSON.parse(raw);
    } catch (e) {
      console.warn(`[警告] 無法讀取 last_updated.json，將重新建立`);
    }
  }

  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  if (!lastMap[fileBase]) {
    lastMap[fileBase] = {};
  }

  lastMap[fileBase].lastRun = now;
  if (isManual) {
    lastMap[fileBase].lastManual = now;
  } else {
    lastMap[fileBase].lastAuto = now;
  }
  lastMap[fileBase].lastSuccess = now;

  fs.writeFileSync(lastPath, JSON.stringify(lastMap, null, 2), 'utf-8');
}

// 新增 overalllog 記錄
function appendOverallLog(actionType, fileBase, actionTime, statusTime, message) {
  const overallPath = path.resolve('./data/overalllog.json');
  let logs = [];

  if (fs.existsSync(overallPath)) {
    try {
      const raw = fs.readFileSync(overallPath, 'utf-8');
      logs = JSON.parse(raw);
    } catch (e) {
      console.warn(`[警告] 無法讀取 overalllog.json，將重新建立`);
    }
  }

  const logEntry = {
    action: actionType,           // 如 "手動更新" 或 "自動更新"
    actionTime,                   // 格式 YYYY-MM-DD HH:mm:ss
    script: fileBase,             // 例如 "fetch_macaodaily_ws_cb.js"
    statusTime,                   // 格式 HH:mm:ss
    message                      // 狀態描述
  };

  logs.push(logEntry);

  // 保留最近1000筆
  if (logs.length > 1000) {
    logs = logs.slice(logs.length - 1000);
  }

  fs.writeFileSync(overallPath, JSON.stringify(logs, null, 2), 'utf-8');
}

// 綜合儲存歷史、last_updated 和記錄 overalllog
function saveHistoryAndUpdateLast(currentList, fileBase, isManual = false) {
  const { newCount, newItems } = saveHistory(currentList, fileBase);
  saveLastUpdated(fileBase, isManual);

  const nowFull = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const nowShort = dayjs().format('HH:mm:ss');

  appendOverallLog(
    isManual ? '手動更新' : '自動更新',
    fileBase,
    nowFull,
    nowShort,
    `成功-本次寫入 ${currentList.length} 條，新增 ${newCount} 條`
  );

  return {
    newCount,
    newItems
  };
}

export {
  saveHistory,
  saveLastUpdated,
  appendOverallLog,
  saveHistoryAndUpdateLast
};

///// the end of historyManager.js
