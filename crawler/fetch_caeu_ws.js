// fetch_caeu_ws.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { logStart, logSuccess, logError } from './logger.js';

// 🧩 啟動提示
logStart('fetch_caeu_ws');

const TARGET_URL = 'https://www.caeu.gov.mo/news/';
const BASE_URL = 'https://www.caeu.gov.mo/news/';
const OUTPUT_PATH = './data/fetch_caeu_ws.json';

try {
  const res = await fetch(TARGET_URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  const newsItems = [];

  // 找到新聞列表區塊
  $('div.news_list > ul > li').each((i, li) => {
    const innerList = $(li).find('ul');

    if (innerList.length > 0) {
      const dateText = innerList.find('.news_date1').text().trim();
      const titleAnchor = innerList.find('.title a');
      const title = titleAnchor.text().trim();
      const href = titleAnchor.attr('href')?.trim();

      if (title && href && dateText) {
        const fullUrl = new URL(href, BASE_URL).href;
        const dateFormatted = dateText.replace(/\//g, '-'); // YYYY-MM-DD

        newsItems.push({
          title,
          address: fullUrl,
          date: dateFormatted
        });
      }
    }
  });

  // 寫入 JSON 檔案
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(newsItems, null, 2),
    'utf-8'
  );

  logSuccess(`成功擷取 ${newsItems.length} 則新聞並儲存至 ${OUTPUT_PATH}`);
} catch (err) {
  logError(`抓取或解析失敗：${err.message}`);
}