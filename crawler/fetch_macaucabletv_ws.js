// crawler/fetch_macaucabletv_ws.js (ESM 版)

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dayjs from 'dayjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

console.log('[爬蟲] fetch_macaucabletv_ws 啟動');

// 解決 __dirname 在 ESM 中不可用問題
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_URL = 'https://r.jina.ai/https://www.macaucabletv.com/video/category/ALL';

try {
  const res = await axios.get(SOURCE_URL);
  const markdown = res.data;

  const regex = /\[!\[.*?\]\((.*?)\)\s+(.*?)\s+(\d{4}年\d{1,2}月\d{1,2}日).*?\]\((https?:\/\/[^\s)]+)\)/g;

  let match;
  const results = [];

  while ((match = regex.exec(markdown)) !== null) {
    const [, imageUrl, rawTitle, rawDate, link] = match;

    const cleanedTitle = rawTitle.trim().replace(/^影片\s*/, '').split(' ')[0];
    const dateMatch = rawDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (!dateMatch) continue;
    const [, year, month, day] = dateMatch;
    const date = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');

    results.push({
      title: cleanedTitle,
      link,
      date
    });
  }

  const outputPath = path.join(__dirname, '../data/fetch_macaucabletv_ws.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`[爬蟲] fetch_macaucabletv_ws 抓取完成，共 ${results.length} 則`);
  if (results.length > 0) {
    console.log('[預覽] 第 1 則：', results[0]);
  }

} catch (error) {
  console.error('[錯誤] 抓取失敗：', error.message);
}