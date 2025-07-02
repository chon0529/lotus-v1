// fetch_chengpou_ws.js
// Cheerio 無需，直接處理 Markdown 文字結構

import fetch from 'node-fetch';
import fs from 'fs';
import dayjs from 'dayjs';

console.log("[爬蟲] fetch_chengpou_ws 啟動");

const url = 'https://r.jina.ai/https://chengpou.com.mo/newstag/Macao.html';

try {
  const res = await fetch(url);
  const text = await res.text();

  // 每則新聞 markdown 形式：[![Image](picURL) title abstract date](link)
  const newsRegex = /\[\!\[.*?\]\((.*?)\)\s+(.*?)【(.*?)】(.*?)\s+(\d{4}-\d{2}-\d{2})\]\((.*?)\)/g;

  const results = [];
  let match;

  while ((match = newsRegex.exec(text)) !== null && results.length < 15) {
    const [_, img, title, abstractPrefix, abstractSuffix, date, link] = match;
    results.push({
      title: title.trim(),
      abstract: `【${abstractPrefix.trim()}】${abstractSuffix.trim()}`,
      date: date.trim(),
      url: link.startsWith('http') ? link : `https://chengpou.com.mo${link}`,
      image: img.startsWith('http') ? img : `https://chengpou.com.mo${img}`
    });
  }

  console.log(`✅ 共擷取 ${results.length} 則新聞`);

  const outputPath = './data/fetch_chengpou_ws.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`💾 已儲存至 ${outputPath}`);
} catch (err) {
  console.error('❌ 錯誤:', err.message);
}
