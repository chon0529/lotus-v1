// fetch_hengqingov_ws_cb.js  - Lotus v1.0.0
import fs from 'fs';
import axios from 'axios';
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

const SCRIPT = 'fetch_hengqingov_ws_cb.js';
const OUTPUT = './data/fetch_hengqingov_ws_cb.json';
const HISTORY = './data/his_fetch_hengqingov.json';
const HIS_ALL = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS = 22;

const url = 'https://r.jina.ai/http://hengqin.gd.gov.cn/zwgk/tzgg/';

logInfo(SCRIPT, '啟動 橫琴官網新聞抓取');

(async () => {
  try {
    const res = await axios.get(url);
    const text = res.data;

    // 標準 Markdown 解析
    const lines = text
      .split('\n')
      .filter(line => line.includes('http') && line.includes(')') && line.includes(']'));

    let items = lines.map(line => {
      const match = line.match(/\*\s*\[(.*?)\]\((.*?)\s*"(.*?)"\)\s*([\d\-]{4}-[\d\-]{2}-[\d\-]{2})/);
      if (!match) return null;
      const [, title, link, , date] = match;
      return {
        title: title.trim(),
        link: link.trim(),
        pubDate: dayjs(date.trim()).format('YYYY-MM-DD')
      };
    }).filter(Boolean);

    items = items.slice(0, MAX_NEWS);

    // 寫入主檔
    fs.writeFileSync(OUTPUT, JSON.stringify(items, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${items.length} 則新聞已存至 ${OUTPUT}`);

    // 歷史/last_updated 處理
    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      items, 'hengqingov', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) await saveToHisAll(newItems, 'hengqingov', HIS_ALL);
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);


    // 預覽
    logPreview(SCRIPT, items[0] || '無法顯示新聞');
  } catch (err) {
    logError(SCRIPT, `抓取失敗：${err.message}`);
  }
})();