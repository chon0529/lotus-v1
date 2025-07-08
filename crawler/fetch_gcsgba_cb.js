// fetch_gcsgba_cb.js - Lotus v1.0.0-0710（大灣區＋橫琴新聞合併）
import fs from 'fs';
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

const SCRIPT = 'fetch_gcsgba_cb.js';
const OUTPUT = './data/fetch_gcsgba.json';
const HISTORY = './data/his_fetch_gcsgba.json';
const HIS_ALL = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS = 30;

// 來源設定
const SOURCES = [
  { key: '大灣區', file: './data/fetch_gcsgba_ws_2.0.json', order: 1 },
  { key: '橫琴', file: './data/fetch_gcshq_ws_2.0.json', order: 2 }
];

function safeReadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8').trim()); }
  catch { return []; }
}

// 主程式
(async () => {
  logInfo(SCRIPT, '啟動 GCS 大灣區/橫琴新聞合併');

  // 1. 讀取來源資料
  let all = [];
  for (const src of SOURCES) {
    const list = safeReadJSON(src.file).map(i => ({
      title: i.title,
      author: i.author || '',
      abstract: i.abstract || '',
      pubDate: i.date || i.pubDate || '',
      link: i.address || i.link,
      source: src.key,
      _order: src.order
    }));
    all = all.concat(list);
  }

  // 2. 排序、去重（同來源+同標題+同日期才去重）
  all.sort((a, b) => {
    if (b.pubDate !== a.pubDate) return b.pubDate.localeCompare(a.pubDate);
    if (a._order !== b._order)   return a._order - b._order;
    return a.title.localeCompare(b.title);
  });

  const seen = new Set();
  const merged = [];
  for (const item of all) {
    const uniq = item.title + '|' + item.pubDate + '|' + item.source;
    if (!seen.has(uniq)) {
      merged.push(item);
      seen.add(uniq);
    }
  }

  // 3. 格式化（前方加來源 tag）
  const news = merged.slice(0, MAX_NEWS).map(i => ({
    title: `(${i.source}) ${i.title}`,
    link: i.link,
    pubDate: i.pubDate,
    source: i.source,
    author: i.author || '',
    abstract: i.abstract || ''
  }));

  // 4. 寫入主檔
  fs.writeFileSync(OUTPUT, JSON.stringify(news, null, 2), 'utf-8');
  logSuccess(SCRIPT, `共 ${news.length} 則新聞已存至 ${OUTPUT}`);

  // 5. 歷史/last_updated 處理
  const { newCount, newItems } = await saveHistoryAndUpdateLast(
    news, 'gcsgba', HISTORY, LASTUPDATED, 'scheduled'
  );
  if (newCount > 0) await saveToHisAll(newItems, 'gcsgba', HIS_ALL);
  logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);

  // 6. 補全 last_updated.json 結構
  try {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let data = {};
    if (fs.existsSync(LASTUPDATED)) {
      data = JSON.parse(fs.readFileSync(LASTUPDATED, 'utf-8'));
    }
    data['gcsgba'] = {
      fetch: 'gcsgba',
      lastRun: now,
      lastSuccess: now,
      lastAdded: now,
      lastOperation: 'scheduled',
      lastManual: null
    };
    fs.writeFileSync(LASTUPDATED, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    logError(SCRIPT, `更新 last_updated.json 失敗: ${err.message}`);
  }

  // 7. 更新 HIS_ALL lastAddedAll
  await updateLastAddedAll('gcsgba', LASTUPDATED);

  // 8. 預覽
  logPreview(SCRIPT, news[0] || '無法顯示新聞');
})();