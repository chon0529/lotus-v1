// fetch_gcseng_ws.js
// 爬取新聞局「工程房屋」類新聞
// 資料來源：https://www.gcs.gov.mo/list/zh-hant/news/%E5%B7%A5%E7%A8%8B%E6%88%BF%E5%B1%8B?1

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio'; // ✅ 使用 * as cheerio
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import { logInfo, logSuccess, logError } from './logger.js'; // 引用提示訊息模組

// 模組名稱（供提示使用）
const MODULE_NAME = 'fetch_gcseng_ws';

// 設定儲存路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'fetch_gcseng_ws.json');

// 啟動提示
logInfo(`[爬蟲] ${MODULE_NAME} 啟動`);

async function fetchGCSNews() {
  const url = 'https://www.gcs.gov.mo/list/zh-hant/news/%E5%B7%A5%E7%A8%8B%E6%88%BF%E5%B1%8B?1';

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const newsItems = [];

    $('table.infiniteDataView tr.infiniteItem').each((_, el) => {
      const title = $(el).find('.captionSize .txt').text().trim();
      const author = $(el).find('.dept').text().trim();
      const abstract = $(el).find('.baseSize').text().trim();
      const dateRaw = $(el).find('time').attr('datetime'); // e.g. 2025-06-27T10:30:00+0800
      const date = dateRaw ? dayjs(dateRaw).format('YYYY-MM-DD') : '';
      const href = $(el).find('a.baseInfo').attr('href') || '';
      const address = href ? 'https://www.gcs.gov.mo' + href.replace('..', '') : '';

      if (title && address) {
        newsItems.push({
          title,
          author,
          abstract,
          date,
          address,
        });
      }
    });

    // 寫入 JSON 檔案
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newsItems, null, 2), 'utf8');
    logSuccess(`[爬蟲] ${MODULE_NAME} 成功儲存 ${newsItems.length} 則新聞至 ${OUTPUT_PATH}`);
  } catch (err) {
    logError(`[爬蟲] ${MODULE_NAME} 發生錯誤：${err.message}`);
  }
}

// 主程式執行
fetchGCSNews();