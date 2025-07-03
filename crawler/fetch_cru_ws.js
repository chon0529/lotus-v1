// fetch_cru_ws.js
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logStart, logSuccess, logError } from './logger.js';

// ⬇️ 取得 __dirname（ESM 模式下的寫法）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬇️ 目標網址
const url = 'https://www.cru.gov.mo/news/';

// ⬇️ 儲存路徑
const savePath = path.join(__dirname, '../data/fetch_cru_ws.json');

// ⬇️ 啟動提示
logStart('fetch_cru_ws');

// ⬇️ 主函式
async function fetchNews() {
  try {
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const newsList = [];
    const baseURL = 'https://www.cru.gov.mo/news/';

    // ⬇️ 擷取每一則新聞項目
    $('div.container.news_list > ul > li').each((_, li) => {
      const titleEl = $(li).find('li.title a');
      const title = titleEl.text().trim();
      const relativeLink = titleEl.attr('href')?.trim().replace(/\s/g, '');
      const address = relativeLink ? baseURL + relativeLink : null;

      const rawDate = $(li).find('span.news_date1').text().trim(); // 2025/07/02
      const date = rawDate.replace(/\//g, '-'); // → 2025-07-02

      if (title && address && date) {
        newsList.push({ title, address, date });
      }
    });

    // ⬇️ 儲存 JSON
    fs.writeFileSync(savePath, JSON.stringify(newsList, null, 2), 'utf-8');
    logSuccess(`共擷取 ${newsList.length} 則新聞，儲存至 ${savePath}`);
  } catch (err) {
    logError('抓取或解析失敗：' + err.message);
  }
}

// ⬇️ 執行主程式
fetchNews();