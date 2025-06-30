// fetch_exmoo_ws.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const url = 'https://r.jina.ai/https://www.exmoo.com/hot';
const OUTPUT_PATH = path.resolve('data/fetch_exmoo_ws.json');

async function fetchExmooNews() {
  console.log('[爬蟲] fetch_exmoo_ws 啟動');

  try {
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.split('\n');

    const items = [];

    for (let i = 0; i < lines.length - 2; i++) {
      const line = lines[i].trim();

      if (line.startsWith('[####') && line.includes('](https://www.exmoo.com/article/')) {
        const titleMatch = line.match(/\[####(.+?)\]\((https:\/\/www\.exmoo\.com\/article\/\d+\.html)\)/);
        if (titleMatch) {
          const title = titleMatch[1];
          const link = titleMatch[2];

          // 跳過空行找日期
          let j = i + 1;
          while (j < lines.length && lines[j].trim() === '') {
            j++;
          }
          const pubDate = lines[j] ? lines[j].trim() : '';

          items.push({ title, link, pubDate });
        }
      }

      if (items.length >= 10) break;
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(items, null, 2), 'utf8');
    console.log(`[爬蟲] fetch_exmoo_ws 抓取完成，共 ${items.length} 則`);
  } catch (err) {
    console.error('[爬蟲] fetch_exmoo_ws 錯誤:', err.message);
  }
}

fetchExmooNews();
