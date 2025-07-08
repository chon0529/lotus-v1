// crawler/fetch_jtm_ws_cb.js - Lotus v1.0.0-0710
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

const SCRIPT      = 'fetch_jtm_ws_cb.js';
const OUTPUT      = './data/fetch_jtm.json';
const HISTORY     = './data/his_fetch_jtm.json';
const HIS_ALL     = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS    = 13;
const MARKDOWN    = 'https://r.jina.ai/https://jtm.com.mo/';

function parseMarkdown(md) {
  const out = [];
  // 第一段大圖
  const reBig = /\[(.+?)\s+-+\s+(\d{1,2}\s\w{3},\s\d{4})\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = reBig.exec(md)) && out.length < MAX_NEWS) {
    out.push({
      title: m[1].trim(),
      link: m[3],
      pubDate: dayjs(m[2], 'D MMM, YYYY').format('YYYY-MM-DD')
    });
  }
  // 再抓一般項
  const reNorm = /###\s*\[(.+?)\]\((https?:\/\/[^\s)]+)\)[\s\S]*?(\d{1,2}\s\w{3},\s\d{4})/g;
  while ((m = reNorm.exec(md)) && out.length < MAX_NEWS) {
    const title = m[1].trim();
    if (!out.find(n => n.link === m[2])) {
      out.push({
        title,
        link: m[2],
        pubDate: dayjs(m[3], 'D MMM, YYYY').format('YYYY-MM-DD')
      });
    }
  }
  return out.slice(0, MAX_NEWS);
}

(async () => {
  logInfo(SCRIPT, '啟動抓取 JTM');
  try {
    logInfo(SCRIPT, `下載 Markdown：${MARKDOWN}`);
    const res = await fetch(MARKDOWN);
    const md  = await res.text();
    const news = parseMarkdown(md);
    fs.writeFileSync(OUTPUT, JSON.stringify(news, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${news.length} 則新聞已存至 ${OUTPUT}`);

    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      news, 'jtm', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) {
      await saveToHisAll(newItems, 'jtm', HIS_ALL);
      await updateLastAddedAll('jtm', LASTUPDATED);
    }
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);
    logPreview(SCRIPT, news[0] || '無法顯示新聞');

  } catch (err) {
    logError(SCRIPT, err.message);
  }
})();