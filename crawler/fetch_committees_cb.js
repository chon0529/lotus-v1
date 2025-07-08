// fetch_committees_cb.js - Lotus v1.0.1-0710
import fs from 'fs';
import dayjs from 'dayjs';
import {
  logInfo, logSuccess, logError, logPreview
} from './modules/logger.js';
import {
  saveHistoryAndUpdateLast, saveToHisAll, updateLastAddedAll
} from './modules/historyManager.js';

const SCRIPT = 'fetch_committees_cb.js';
const OUTPUT = './data/fetch_committees.json';
const HISTORY = './data/his_fetch_committees.json';
const HIS_ALL = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS = 30;         // 合併最多 30 條
const AUTO_REFRESH_MIN = 120; // 預設自動更新 120 分鐘

// 各來源原始檔路徑
const SOURCES = [
  { key: 'CAEU', path: './data/fetch_caeu.json', order: 1 },
  { key: 'CPU',  path: './data/fetch_cpu.json',  order: 2 },
  { key: 'CRU',  path: './data/fetch_cru.json',  order: 3 }
];

(async () => {
  logInfo(SCRIPT, '啟動委員會新聞合併');

  // 1. 讀取來源檔
  let all = [];
  for (const src of SOURCES) {
    let list = [];
    try {
      list = JSON.parse(fs.readFileSync(src.path, 'utf-8').trim());
    } catch {
      list = [];
    }
    // 標註來源與 order
    list.forEach(i => {
      i.source = src.key;
      i._order = src.order;
    });
    all = all.concat(list);
  }

  // 2. 合併、去重邏輯
  // 同一來源同標題+同日期去重（保留較新）
  all.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return a._order - b._order; // 來源優先 CAEU > CPU > CRU
  });

  const seen = new Set();
  const merged = [];
  for (const item of all) {
    const unique = item.title + '|' + item.date + '|' + item.source;
    if (!seen.has(unique)) {
      merged.push(item);
      seen.add(unique);
    }
  }

  // 3. 補來源標籤，保留最大數量
  const news = merged.slice(0, MAX_NEWS).map(i => ({
    title: `(${i.source}) ${i.title}`,
    link: i.address,
    pubDate: i.date,
    source: i.source
  }));

  // 4. 輸出主檔
  fs.writeFileSync(OUTPUT, JSON.stringify(news, null, 2), 'utf-8');
  logSuccess(SCRIPT, `共 ${news.length} 則新聞已存至 ${OUTPUT}`);

  // 5. 歷史/更新檔
  const { newCount, newItems } = await saveHistoryAndUpdateLast(
    news, 'committees', HISTORY, LASTUPDATED, 'scheduled'
  );
  if (newCount > 0) await saveToHisAll(newItems, 'committees', HIS_ALL);
  logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);

  // 6. 手動寫入完整 last_updated 格式，覆寫不完整資料
  try {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let lastUpdatedData = {};
    if (fs.existsSync(LASTUPDATED)) {
      try {
        lastUpdatedData = JSON.parse(fs.readFileSync(LASTUPDATED, 'utf-8'));
      } catch {}
    }
    lastUpdatedData['committees'] = {
      fetch: 'committees',
      lastRun: now,
      lastSuccess: now,
      lastAdded: now,
      lastOperation: 'scheduled',
      lastManual: null
    };
    fs.writeFileSync(LASTUPDATED, JSON.stringify(lastUpdatedData, null, 2), 'utf-8');
  } catch (err) {
    logError(SCRIPT, `更新 last_updated.json 失敗: ${err.message}`);
  }

  // 7. 同步 lastAddedAll（可視需要決定要不要）
  // await updateLastAddedAll('committees', LASTUPDATED);

  // 8. 預覽
  logPreview(SCRIPT, news[0] || '無法顯示新聞');
})();