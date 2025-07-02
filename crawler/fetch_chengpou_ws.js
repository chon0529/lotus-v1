// fetch_chengpou_ws.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';

console.log('[爬蟲] fetch_chengpou_ws 啟動');

const BASE_URL = 'https://chengpou.com.mo';
const URL = `${BASE_URL}/newstag/Macao.html`;

try {
  const res = await fetch(URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  const news = [];

  $('#news-list-container .news-list-detail').each((_, el) => {
    const link = $(el).find('a').attr('href');
    const fullLink = link ? `${BASE_URL}${link}` : null;

    // 擷取所有標題段落（可能為一段或兩段）
    const titleParts = [];
    $(el).find('p.news-list-tilte').each((_, p) => {
      const part = $(p).text().trim();
      if (part) titleParts.push(part);
    });
    const title = titleParts.join(' ');

    const abstract = $(el).find('.news-list-description').text().trim();
    const date = $(el).find('.news-list-date').text().trim();

    if (title && date && fullLink) {
      news.push({ title, date, abstract, link: fullLink });
    }
  });

  console.log(`✅ 共擷取 ${news.length} 則新聞`);
  fs.writeFileSync('./data/fetch_chengpou_ws.json', JSON.stringify(news, null, 2), 'utf-8');
  console.log('💾 已儲存至 ./data/fetch_chengpou_ws.json');
} catch (err) {
  console.error('❌ 發生錯誤：', err);
}