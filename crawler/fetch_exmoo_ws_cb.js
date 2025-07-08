// crawler/fetch_exmoo_ws_cb.js -GPT-1.0.2-0709
import fs from 'fs';
import fetch from 'node-fetch';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { logInfo, logSuccess, logError, logPreview } from './modules/logger.js';
import { saveHistoryAndUpdateLast, saveToHisAll, updateLastAddedAll } from './modules/historyManager.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Macau');

const SCRIPT      = 'fetch_exmoo_ws_cb.js';
const URL         = 'https://r.jina.ai/https://www.exmoo.com/hot';
const OUTPUT      = './data/fetch_exmoo.json';
const HISTORY     = './data/his_fetch_exmoo.json';
const HIS_ALL     = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS    = 24;

(async () => {
  logInfo(SCRIPT, '啟動');
  try {
    logInfo(SCRIPT, `載入：${URL}`);
    const res = await fetch(URL);
    const text = await res.text();
    const lines = text.split('\n').map(line => line.trim());

    const news = [];
    for (let i = 0; i < lines.length - 2; i++) {
      const imgLine   = lines[i];
      const titleLine = lines[i + 2];
      const dateLine  = lines[i + 4] || '';

      if (
        imgLine.startsWith('[![') &&
        (titleLine.startsWith('[###') || titleLine.startsWith('[####')) &&
        /^\d{2}\/\d{2}\/\d{4}$/.test(dateLine)
      ) {
        const m = titleLine.match(/\[(#+\s?)(.+?)\]\((https:\/\/www\.exmoo\.com\/article\/\d+\.html)\)/);
        if (m) {
          // 擷取原始 title，然後把所有 # 及前後多餘空白用一個空格取代
          let title = m[2]
            .replace(/#+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          const link    = m[3].trim();
          const pubDate = dayjs(dateLine, 'DD/MM/YYYY').format('YYYY-MM-DD');
          news.push({ title, link, pubDate });
        }
      }

      if (news.length >= MAX_NEWS) break;
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(news, null, 2), 'utf8');
    logSuccess(SCRIPT, `共 ${news.length} 則新聞已存至 ${OUTPUT}`);

    // 這裡要把 newItems 一起拿出來
    const { newCount, newItems } = saveHistoryAndUpdateLast(
      news, 'exmoo', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) await saveToHisAll(newItems, 'exmoo', HIS_ALL);

    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);
    logPreview(SCRIPT, news[0] || '無法顯示新聞');

  } catch (err) {
    logError(SCRIPT, err.message);
  }
})();