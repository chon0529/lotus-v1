// fetch_caeu_ws.js - Lotus v1.0.1-0710
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
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

const SCRIPT      = 'fetch_caeu_ws.js';
const URL         = 'https://www.caeu.gov.mo/news/';
const BASE_URL    = 'https://www.caeu.gov.mo';
const OUTPUT_PATH = './data/fetch_caeu.json';
const HISTORY     = './data/his_fetch_caeu.json';
const HIS_ALL     = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';

(async () => {
  logInfo(SCRIPT, '啟動');
  try {
    const res = await fetch(URL);
    const html = await res.text();
    const $ = cheerio.load(html);
    const newsList = [];

    $('div.news_list > ul > li').each((i, li) => {
      const innerList = $(li).find('ul');
      if (innerList.length > 0) {
        const dateText = innerList.find('.news_date1').text().trim();
        const titleAnchor = innerList.find('.title a');
        const title = titleAnchor.text().trim();
        const href = titleAnchor.attr('href')?.trim();
        if (title && href && dateText) {
          // 用字串拼接，不用 new URL（避免拋錯）
          const fullUrl = href.startsWith('http')
            ? href
            : BASE_URL + (href.startsWith('/') ? href : '/' + href);
          const dateFormatted = dateText.replace(/\//g, '-'); // YYYY-MM-DD
          newsList.push({
            title,
            address: fullUrl,
            date: dateFormatted
          });
        }
      }
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newsList, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${newsList.length} 則新聞已存至 ${OUTPUT_PATH}`);

    // 歷史存檔、last_updated 處理
    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      newsList, 'caeu', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) await saveToHisAll(newItems, 'caeu', HIS_ALL);
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);
    if (newsList.length) logPreview(SCRIPT, newsList[0]);
    else logPreview(SCRIPT, '無法顯示新聞');
  } catch (err) {
    logError(SCRIPT, `抓取或解析失敗：${err.message}`);
  }
})();