// fetch_cru_ws.js - Lotus v1.0.1-0710
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

// 取得 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPT      = 'fetch_cru_ws.js';
const URL         = 'https://www.cru.gov.mo/news/';
const OUTPUT_PATH = path.join(__dirname, '../data/fetch_cru.json');
const HISTORY     = path.join(__dirname, '../data/his_fetch_cru.json');
const HIS_ALL     = path.join(__dirname, '../data/HIS_ALL.json');
const LASTUPDATED = path.join(__dirname, '../data/last_updated.json');

(async () => {
  logInfo(SCRIPT, '啟動');
  try {
    const res = await fetch(URL);
    const body = await res.text();
    const $ = cheerio.load(body);

    const newsList = [];
    const baseURL = 'https://www.cru.gov.mo/news/';

    $('div.container.news_list > ul > li').each((_, li) => {
      const titleEl = $(li).find('li.title a');
      const title = titleEl.text().trim();
      const relativeLink = titleEl.attr('href')?.trim().replace(/\s/g, '');
      const address = relativeLink
        ? baseURL + (relativeLink.startsWith('/') ? relativeLink.slice(1) : relativeLink)
        : null;
      const rawDate = $(li).find('span.news_date1').text().trim(); // 例：2025/07/02
      const date = rawDate.replace(/\//g, '-'); // → 2025-07-02

      if (title && address && date) {
        newsList.push({ title, address, date });
      }
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newsList, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共擷取 ${newsList.length} 則新聞，儲存至 ${OUTPUT_PATH}`);

    // 歷史存檔、last_updated 更新
    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      newsList, 'cru', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) await saveToHisAll(newItems, 'cru', HIS_ALL);

    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);
    if (newsList.length) logPreview(SCRIPT, newsList[0]);
    else logPreview(SCRIPT, '無法顯示新聞');
  } catch (err) {
    logError(SCRIPT, `抓取或解析失敗：${err.message}`);
  }
})();