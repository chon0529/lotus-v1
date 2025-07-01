// crawler/fetch_exmoo_ws.js
import fs from 'fs';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

console.log('[爬蟲] fetch_exmoo_ws 啟動');

const URL = 'https://r.jina.ai/https://www.exmoo.com/hot';

async function fetchExmooNews() {
  try {
    const response = await fetch(URL);
    const text = await response.text();

    const lines = text.split('\n').map(line => line.trim());
    const news = [];

    for (let i = 0; i < lines.length - 2; i++) {
      const imgLine = lines[i];
      const titleLine = lines[i + 2];
      const dateLine = lines[i + 4] || '';

      // 確保三行結構
      if (
        imgLine.startsWith('[![') &&
        (titleLine.startsWith('[###') || titleLine.startsWith('[####')) &&
        /^\d{2}\/\d{2}\/\d{4}$/.test(dateLine)
      ) {
        // 抓標題與連結
        const titleMatch = titleLine.match(/\[(#+\s?)(.+?)\]\((https:\/\/www\.exmoo\.com\/article\/\d+\.html)\)/);
        if (titleMatch) {
          const title = titleMatch[2].trim();
          const url = titleMatch[3].trim();
          const date = dayjs(dateLine, 'DD/MM/YYYY').format('YYYY-MM-DD');

          news.push({ title, url, date });
        }
      }
    }

    fs.writeFileSync('./data/fetch_exmoo_ws.json', JSON.stringify(news, null, 2), 'utf8');
    console.log(`[爬蟲] fetch_exmoo_ws 抓取完成，共 ${news.length} 則`);
  } catch (error) {
    console.error('[爬蟲] fetch_exmoo_ws 錯誤:', error);
  }
}

fetchExmooNews();