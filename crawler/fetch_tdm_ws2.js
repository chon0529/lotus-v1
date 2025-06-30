// fetch_tdm_ws2.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = './data/fetch_tdm_ws2.json';
const URL = 'https://www.tdm.com.mo/zh-hant/news-list?type=image&category=all&page=1';

async function fetchTDMNews() {
  console.log('[爬蟲] fetch_tdm_ws2 啟動');

  try {
    const { data: html } = await axios.get(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'zh-Hant',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(html);
    const items = [];

    $('.news-item').each((_, el) => {
      if (items.length >= 10) return;

      const title = $(el).find('.news-title').text().trim();
      const linkPath = $(el).find('a').attr('href') || '';
      const link = linkPath.startsWith('http') ? linkPath : `https://www.tdm.com.mo${linkPath}`;
      const pubDate = $(el).find('.news-time').text().trim();

      if (title && link && pubDate) {
        items.push({ title, link, pubDate });
      }
    });

    fs.writeFileSync(path.resolve(OUTPUT_FILE), JSON.stringify(items, null, 2), 'utf8');
    console.log(`[爬蟲] fetch_tdm_ws2 抓取完成，共 ${items.length} 則`);
  } catch (err) {
    console.error('[爬蟲] fetch_tdm_ws2 錯誤:', err.message);
  }
}

fetchTDMNews();
