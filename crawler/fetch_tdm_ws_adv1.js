// fetch_tdm_ws_adv1.js
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';

const OUTPUT_PATH = path.resolve('data/fetch_tdm_ws_adv1.json');

// 計算抓取日期（昨天）
const targetDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
const url = `https://www.tdm.com.mo/zh-hant/news-list?type=image&category=all&page=1&date=${targetDate}`;

async function fetchTdmNews() {
  console.log('[爬蟲] fetch_tdm_ws_adv1 啟動');

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html',
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);
    const newsItems = [];

    $('.news-item').each((_, el) => {
      if (newsItems.length >= 10) return;

      const title = $(el).find('.news-title').text().trim();
      const link = 'https://www.tdm.com.mo' + $(el).find('a').attr('href');
      const pubDate = targetDate;

      if (title && link.includes('/news-detail')) {
        newsItems.push({ title, link, pubDate });
      }
    });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newsItems, null, 2), 'utf8');
    console.log(`[爬蟲] fetch_tdm_ws_adv1 抓取完成，共 ${newsItems.length} 則`);
  } catch (err) {
    console.error('[爬蟲] fetch_tdm_ws_adv1 錯誤:', err.message);
  }
}

fetchTdmNews();
