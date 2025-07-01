// fetch_allin_ws.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

const TARGET_URL = 'https://r.jina.ai/https://www.allinmedia.com.hk/category/%e5%8d%9a%e5%bd%a9%e6%96%b0%e8%81%9e/';
const OUTPUT_PATH = './data/fetch_allin_ws.json';

console.log('[爬蟲] fetch_allin_ws 啟動');

async function fetchAllinNews() {
  try {
    const res = await fetch(TARGET_URL);
    const text = await res.text();
    const $ = cheerio.load(text);

    const lines = text.split('\n').map(line => line.trim());

    const news = [];
    let currentDate = '';
    let allowNext = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 日期：例如「30 6 月, 2025」=> 2025-06-30
      const dateMatch = line.match(/(\d{1,2})\s(\d{1,2})\s\u6708,\s(\d{4})/);
      if (dateMatch) {
        const [_, day, month, year] = dateMatch;
        currentDate = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
        continue;
      }

      // 有效新聞段起始條件：[博彩新聞]
      if (line.includes('[博彩新聞]')) {
        allowNext = true;
        continue;
      }

      // 標題行處理 ### [標題](連結)
      if (allowNext && line.startsWith('### [')) {
        const titleMatch = line.match(/^### \[(.+?)\]\((.+?)\s*\"?.*\"?\)/);
        if (titleMatch) {
          const [, title, link] = titleMatch;
          news.push({ title, link, date: currentDate });
          allowNext = false;
        }
      }
    }

    // 儲存結果
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(news, null, 2), 'utf-8');
    console.log(`[完成] 共儲存 ${news.length} 則新聞`);
    if (news.length > 0) console.log('[預覽] 第 1 則：', news[0]);
  } catch (err) {
    console.error('[錯誤]', err.message);
  }
}

fetchAllinNews();
