// fetch_allin_ws.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dayjs from 'dayjs';

const url = 'https://r.jina.ai/https://www.allinmedia.com.hk/category/%E5%8D%9A%E5%BD%A9%E6%96%B0%E8%81%9E/';
const OUTPUT_PATH = path.resolve('data/fetch_allin_ws.json');
const TODAY = dayjs().format('YYYY-MM-DD');

async function fetchAllinNews() {
  console.log('[爬蟲] fetch_allin_ws 啟動');

  try {
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.split('\n');

    const items = [];
    let lastDate = TODAY;

    for (let i = 0; i < lines.length - 2; i++) {
      const line = lines[i].trim();

      // 檢查是否是日期格式，如 "19 6 月, 2025"
      const dateMatch = line.match(/^(\d{1,2})\s+(\d{1,2})\s+月,\s+(\d{4})$/);
      if (dateMatch) {
        const [_, day, month, year] = dateMatch;
        lastDate = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
        continue;
      }

      // 檢查是否是 [博彩新聞] 的標題段
      if (line === '[博彩新聞]' && lines[i + 1]?.startsWith('### [')) {
        const nextLine = lines[i + 1].trim();
        const titleMatch = nextLine.match(/^### \[(.+?)\]\((https:\/\/www\.allinmedia\.com\.hk\/.+?)\)/);

        if (titleMatch) {
          const title = titleMatch[1].trim();
          const link = titleMatch[2].trim();

          items.push({
            title,
            link,
            pubDate: lastDate,
          });

          if (items.length >= 10) break;
        }
      }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(items, null, 2), 'utf8');
    console.log(`[爬蟲] fetch_allin_ws 抓取完成，共 ${items.length} 則`);
  } catch (err) {
    console.error('[爬蟲] fetch_allin_ws 錯誤:', err.message);
  }
}

fetchAllinNews();
