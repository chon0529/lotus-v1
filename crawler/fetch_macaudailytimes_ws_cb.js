// crawler/fetch_macaudailytimes_ws_cb.js - Lotus v1.0.0-0710
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

const SCRIPT      = 'fetch_macaudailytimes_ws_cb.js';
const OUTPUT      = './data/fetch_macaudailytimes.json';
const HISTORY     = './data/his_fetch_macaudailytimes.json';
const HIS_ALL     = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS    = 30;
const MARKDOWN    = 'https://r.jina.ai/https://macaudailytimes.com.mo/category/macau';

const smallWords = ['of','the','a','an','in','on','at','by','to','for','with','and','but','or','nor'];
function formatTitle(slug) {
  return slug.split('-').map(w=> smallWords.includes(w)?w: w[0].toUpperCase()+w.slice(1)).join(' ');
}

(async () => {
  logInfo(SCRIPT, '啟動抓取 MacauDailyTimes');
  try {
    logInfo(SCRIPT, `下載 Markdown：${MARKDOWN}`);
    const res = await fetch(MARKDOWN);
    const md  = await res.text();
    const regex = /\[\]\((https:\/\/macaudailytimes\.com\.mo\/[^\)]+)\)\n!\[.*?\]\((.*?)\)/g;
    const items = [];
    let m;
    while ((m = regex.exec(md)) && items.length < MAX_NEWS) {
      const link = m[1], img = m[2];
      const slug = link.split('/').pop().replace(/\.html$/,'');
      const title = formatTitle(slug);
      const pubDate = dayjs().format('YYYY-MM-DD');
      items.push({ title, abstract:'', link, image:img, pubDate });
    }
    fs.writeFileSync(OUTPUT, JSON.stringify(items, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${items.length} 則新聞已存至 ${OUTPUT}`);

    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      items, 'macaudailytimes', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) {
      await saveToHisAll(newItems, 'macaudailytimes', HIS_ALL);
      await updateLastAddedAll('macaudailytimes', LASTUPDATED);
    }
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);
    logPreview(SCRIPT, items[0]||'無法顯示新聞');

  } catch (err) {
    logError(SCRIPT, err.message);
  }
})();