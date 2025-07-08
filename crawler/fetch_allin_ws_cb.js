// crawler/fetch_allin_ws_cb.js -GPT-1.0.0-0709
import fs from 'fs';
import fetch from 'node-fetch';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { logInfo, logSuccess, logError, logPreview } from './modules/logger.js';
import { saveHistoryAndUpdateLast, saveToHisAll, updateLastAddedAll } from './modules/historyManager.js';


dayjs.extend(utc); dayjs.extend(timezone); dayjs.tz.setDefault('Asia/Macau');
const SCRIPT      = 'fetch_allin_ws_cb.js';
const URL         = 'https://r.jina.ai/https://www.allinmedia.com.hk/category/%e5%8d%9a%e5%bd%a9%e6%96%b0%e8%81%9e/';
const OUTPUT      = './data/fetch_allin.json';
const HISTORY     = './data/his_fetch_allin.json';
const HIS_ALL     = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS    = 15;

(async () => {
  logInfo(SCRIPT, '啟動');
  try {
    logInfo(SCRIPT, `載入：${URL}`);
    const res = await fetch(URL);
    const text = await res.text();
    const lines = text.split('\n').map(line => line.trim());

    const news = [];
    let currentDate = '';
    let allowNext = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 日期：「30 6 月, 2025」=> 2025-06-30
      const dateMatch = line.match(/(\d{1,2})\s(\d{1,2})\s\u6708,\s(\d{4})/);
      if (dateMatch) {
        const [_, day, month, year] = dateMatch;
        currentDate = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
        continue;
      }
      if (line.includes('[博彩新聞]')) {
        allowNext = true;
        continue;
      }
      if (allowNext && line.startsWith('### [')) {
        const titleMatch = line.match(/^### \[(.+?)\]\((.+?)\s*\"?.*\"?\)/);
        if (titleMatch) {
          const [, title, link] = titleMatch;
          news.push({ title, link, pubDate: currentDate });
          allowNext = false;
        }
      }
      if (news.length >= MAX_NEWS) break;
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(news, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${news.length} 則新聞已存至 ${OUTPUT}`);

    const { newCount } =  saveHistoryAndUpdateLast(
      news, 'allin', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) await saveToHisAll(newItems, 'allin', HIS_ALL);

    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);
    logPreview(SCRIPT, news[0] || '無法顯示新聞');
  } catch (err) {
    logError(SCRIPT, err.message);
  }
})();
// ///// the end of fetch_allin_ws_cb.js -GPT-1.0.0-0709