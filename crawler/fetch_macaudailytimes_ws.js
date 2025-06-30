import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = './data/fetch_macaodailytimes_ws.json';
const URL = 'https://r.jina.ai/https://macaudailytimes.com.mo/category/macau';

async function fetchMacaoDailyTimesNews() {
  console.log('[爬蟲] fetch_macaodailytimes_ws 啟動');

  try {
    const res = await fetch(URL);
    const text = await res.text();

    // 使用正則表達式抓取符合條件的標題、日期、連結
    const regex = /\[([^\]]+)\]\((https:\/\/[^\)]+)\)\n-{2,}\n\n([\s\S]+?)\n\n(.+?(\d{1,2}\s\w+\s*,\s*\d{4}))/g;
    const items = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      const title = match[1]; // 文章標題
      const link = match[2]; // 文章連結
      const rawDate = match[5]; // 文章日期

      // 轉換日期格式，從 "Monday, June 30, 2025" 轉為 "2025-06-30"
      const date = new Date(rawDate).toISOString().split('T')[0];

      items.push({ title, date, link });
    }

    fs.writeFileSync(path.resolve(OUTPUT_FILE), JSON.stringify(items, null, 2), 'utf8');
    console.log(`[爬蟲] fetch_macaodailytimes_ws 抓取完成，共 ${items.length} 則`);
  } catch (err) {
    console.error('[爬蟲] fetch_macaodailytimes_ws 錯誤:', err.message);
  }
}

fetchMacaoDailyTimesNews();
