// fetch_macaudailytimes_ws.js
import fetch from 'node-fetch';
import fs from 'fs';
import dayjs from 'dayjs';

console.log("[爬蟲] fetch_macaudailytimes_ws 啟動");

const url = 'https://r.jina.ai/https://macaudailytimes.com.mo/category/macau';
const output = './data/fetch_macaudailytimes_ws.json';

// 小品詞（不大寫）
const smallWords = ['of', 'the', 'a', 'an', 'in', 'on', 'at', 'by', 'to', 'for', 'with', 'and', 'but', 'or', 'nor'];

function formatTitle(slug) {
  return slug
    .split('-')
    .map(word => smallWords.includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

(async () => {
  try {
    const res = await fetch(url);
    const text = await res.text();

    const regex = /\[\]\((https:\/\/macaudailytimes\.com\.mo\/[^\)]+)\)\n!\[.*?\]\((.*?)\)/g;
    const matches = [...text.matchAll(regex)];

    const today = dayjs().format('YYYY-MM-DD');
    const results = [];

    for (const match of matches) {
      const link = match[1];
      const slug = link.split('/').pop().replace(/\.html$/, '');
      const title = formatTitle(slug);
      results.push({ title, date: today, link });
    }

    fs.writeFileSync(output, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`[爬蟲] fetch_macaudailytimes_ws 抓取完成，共 ${results.length} 則`);
  } catch (err) {
    console.error('[爬蟲] fetch_macaudailytimes_ws 錯誤:', err);
  }
})();