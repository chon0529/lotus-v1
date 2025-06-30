// fetch_macaucabletv_ws.js
import fs from 'fs';
import fetch from 'node-fetch';
import * as dayjs from 'dayjs';

const URL = 'https://r.jina.ai/https://www.macaucabletv.com/video/category/ALL';
const OUTPUT = './data/fetch_macaucabletv_ws.json';

console.log('[爬蟲] fetch_macaucabletv_ws 啟動');

async function fetchNews() {
  try {
    const res = await fetch(URL);
    const html = await res.text();

    // 擷取 Markdown Content 段落（從 "Markdown Content:" 開始）
    const markdownStart = html.indexOf('Markdown Content:');
    if (markdownStart === -1) throw new Error('找不到 Markdown Content');
    const markdown = html.slice(markdownStart + 17).trim();

    // 正則：找出所有符合 [![Image](圖片)](連結) 格式
    const regex = /\[!\[.*?\]\((.*?)\)\s+(.*?)\s+(\d{4}\/\d{2}\/\d{2})\]\((https:\/\/www\.macaucabletv\.com\/[^\s]+)\)/g;

    const results = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      const [, imageUrl, title, dateStr, url] = match;
      const date = dayjs(dateStr, 'YYYY/MM/DD').format('YYYY-MM-DD');
      results.push({
        title: title.trim(),
        link: url,
        date: date,
      });
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`[爬蟲] fetch_macaucabletv_ws 抓取完成，共 ${results.length} 則`);
  } catch (err) {
    console.error('[爬蟲] fetch_macaucabletv_ws 錯誤:', err.message);
  }
}

fetchNews();
