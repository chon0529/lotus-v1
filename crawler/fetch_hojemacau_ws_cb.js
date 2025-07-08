// crawler/fetch_hojemacau_ws_cb.js - Lotus v1.0.1-0710
import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  logInfo,
  logSuccess,
  logError,
  logPreview
} from './modules/logger.js';
import {
  saveHistoryAndUpdateLast,
  saveToHisAll,
} from './modules/historyManager.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Macau');

const SCRIPT      = 'fetch_hojemacau_ws_cb.js';
const OUTPUT      = './data/fetch_hojemacau.json';
const HISTORY     = './data/his_fetch_hojemacau.json';
const HIS_ALL     = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS    = 48;

// 要爬的分頁
const pages = [
  { url: 'https://hojemacau.com.mo/seccao/sociedade/', label: 'Sociedade' },
  { url: 'https://hojemacau.com.mo/seccao/sociedade/page/2', label: 'Sociedade' },
  { url: 'https://hojemacau.com.mo/seccao/politica/', label: 'Política' },
  { url: 'https://hojemacau.com.mo/seccao/politica/page/2', label: 'Política' },
];

(async () => {
  logInfo(SCRIPT, '啟動抓取 HojeMacau');
  try {
    const news = [];

    for (const { url, label } of pages) {
      if (news.length >= MAX_NEWS) break;
      logInfo(SCRIPT, `載入：${url}`);
      let html;
      try {
        const resp = await axios.get(url, { timeout: 20000 });
        html = resp.data;
      } catch (err) {
        logError(SCRIPT, `載入失敗 ${url}：${err.message}`);
        continue;
      }

      const $ = cheerio.load(html);
      $('article[id^="post-"]').each((_, el) => {
        if (news.length >= MAX_NEWS) return;
        const e = $(el);
        // link
        const linkPath =
          e.find('header h2 a').attr('href') ||
          e.find('a.post-thumbnail').attr('href') ||
          e.find('> a').attr('href');
        if (!linkPath) return;
        const link = linkPath.startsWith('http')
          ? linkPath
          : `https://hojemacau.com.mo${linkPath}`;

        // title
        const rawTitle =
          e.find('header h2 a').text().trim() ||
          e.find('> a').attr('title')?.trim() ||
          '';
        if (!rawTitle) return;
        const title = `(${label}) ${rawTitle}`;

        // date
        let dateText = e.find('footer i').text().trim();
        let pubDate = '';
        if (dayjs(dateText, 'YYYY-MM-DD', true).isValid()) {
          pubDate = dayjs(dateText).format('YYYY-MM-DD');
        } else {
          const m = dayjs(dateText);
          pubDate = m.isValid() ? m.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
        }

        // push
        news.push({
          title,
          abstract: '',
          link,
          image: '',
          pubDate
        });
      });
    }

    // 依日期降冪排序，取前 MAX_NEWS
    news.sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1));
    const sliced = news.slice(0, MAX_NEWS);

    // 寫主檔
    fs.writeFileSync(OUTPUT, JSON.stringify(sliced, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${sliced.length} 則新聞已存至 ${OUTPUT}`);

    // 歷史與 HIS_ALL
    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      sliced,
      'hojemacau',
      HISTORY,
      LASTUPDATED,
      'scheduled'
    );
    if (newCount > 0) {
      await saveToHisAll(newItems, 'hojemacau', HIS_ALL);
    }
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);

    // 預覽
    logPreview(SCRIPT, sliced[0] || '無法顯示新聞');

  } catch (err) {
    logError(SCRIPT, err.message);
  }
})();