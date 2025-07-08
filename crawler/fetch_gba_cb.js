// fetch_gba_cb.js - Lotus v1.0.1-0710（修正版）
import fs from 'fs/promises';
import dayjs from 'dayjs';
import {
  logInfo,
  logSuccess,
  logError,
  logPreview
} from './modules/logger.js';
import {
  saveHistoryAndUpdateLast,
  saveToHisAll,
  updateLastAddedAll
} from './modules/historyManager.js';

const SCRIPT = 'fetch_gba_cb.js';
const OUTPUT = './data/fetch_gba.json';
const HISTORY = './data/his_fetch_gba.json';
const HIS_ALL = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS = 30;

// 合併來源設定與路徑
const SOURCES = [
  { key: '湾区行动', path: './data/fetch_cbaaction_ws.json', order: 1 },
  { key: '高層關注', path: './data/fetch_cbaoverall_ws_mix.json', order: 2 },
  { key: '最新動態', path: './data/fetch_cbaoverall_ws_mix.json', order: 2 },
  { key: '最新政策', path: './data/fetch_cbaoverall_ws_mix.json', order: 2 }
];

// 更新 last_updated.json 的完整物件格式
async function updateLastUpdatedFull(key, data) {
  try {
    let json = {};
    try {
      const content = await fs.readFile(LASTUPDATED, 'utf-8');
      json = JSON.parse(content);
      if (typeof json !== 'object' || Array.isArray(json)) {
        json = {};
      }
    } catch {
      json = {};
    }
    json[key] = { ...json[key], ...data };
    await fs.writeFile(LASTUPDATED, JSON.stringify(json, null, 2), 'utf-8');
  } catch (e) {
    console.error(`更新 last_updated.json 失敗: ${e.message}`);
  }
}

(async () => {
  logInfo(SCRIPT, '啟動大灣區新聞合併');

  let all = [];

  try {
    // 讀取 cbaaction（湾区行动）
    let cbaaction = [];
    try {
      const txt = await fs.readFile('./data/fetch_cbaaction_ws.json', 'utf-8');
      cbaaction = JSON.parse(txt);
      cbaaction.forEach(i => {
        i.source = '湾区行动';
        i._order = 1;
        i.link = i.url; // 兼容欄位名
      });
    } catch (e) {
      logError(SCRIPT, `讀取 fetch_cbaaction_ws.json 失敗: ${e.message}`);
    }

    // 讀取 cbaoverall 混合（含高層關注、最新動態、最新政策）
    let cbaoverall = [];
    try {
      const txt = await fs.readFile('./data/fetch_cbaoverall_ws_mix.json', 'utf-8');
      cbaoverall = JSON.parse(txt);
      cbaoverall.forEach(i => {
        i._order = 2;
        i.source = i.title.match(/^\((.+?)\)/)?.[1] || '未知';
        i.link = i.link || i.url; // 兼容欄位名
      });
    } catch (e) {
      logError(SCRIPT, `讀取 fetch_cbaoverall_ws_mix.json 失敗: ${e.message}`);
    }

    all = cbaaction.concat(cbaoverall);
  } catch (e) {
    logError(SCRIPT, `讀取來源 JSON 失敗: ${e.message}`);
  }

  // 去重邏輯（同標題+同日期+同來源才去重）
  all.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    if (a.source !== b.source) return a.source.localeCompare(b.source);
    return a._order - b._order;
  });

  const seen = new Set();
  const merged = [];
  for (const item of all) {
    const unique = `${item.title}|${item.date}|${item.source}`;
    if (!seen.has(unique)) {
      merged.push(item);
      seen.add(unique);
    }
  }

  // 只保留最多 MAX_NEWS
  const news = merged.slice(0, MAX_NEWS).map(i => ({
    title: i.title,  // cbaoverall 自帶小標題，不重複加
    link: i.link,
    pubDate: i.date,
    source: i.source
  }));

  // 輸出主檔
  try {
    await fs.writeFile(OUTPUT, JSON.stringify(news, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${news.length} 則新聞已存至 ${OUTPUT}`);
  } catch (e) {
    logError(SCRIPT, `寫入主檔失敗：${e.message}`);
  }

  // 歷史和 last_updated
  const { newCount, newItems } = await saveHistoryAndUpdateLast(
    news,
    'gba',
    HISTORY,
    LASTUPDATED,
    'scheduled'
  );

  if (newCount > 0) {
    await saveToHisAll(newItems, 'gba', HIS_ALL);
  }
  logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);

  // 更新 last_updated.json 完整結構
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
  await updateLastUpdatedFull('gba', {
    fetch: 'gba',
    lastRun: now,
    lastSuccess: now,
    lastAdded: now,
    lastOperation: 'scheduled',
    lastManual: null
  });

  // 同步 lastAddedAll
  await updateLastAddedAll('gba', LASTUPDATED);

  // 預覽
  logPreview(SCRIPT, news[0] || '無法顯示新聞');
})();