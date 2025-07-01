// crawler/fetch_macaubusiness_ws.js
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import dayjs from 'dayjs';

console.log('[爬蟲] fetch_macaubusiness_ws 啟動');

const url = 'https://www.macaubusiness.com/category/mna/mna-macau/';

try {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

  const html = await page.content();
  const $ = cheerio.load(html);
  const articles = [];

  $('div.td_module_10, div.td_module_16, div.td_module_1, div.td-block-span6').each((i, el) => {
    const link = $(el).find('.td-module-thumb a').attr('href');
    const rawDate = $(el).find('time').attr('datetime') || $(el).find('time').text();

    if (!link) return;

    // 從網址推斷標題
    const slug = link.split('/').filter(s => s).pop(); // 最後一段
    const title = slug
      .split('-')
      .map(word => {
        if (['of', 'the', 'and', 'to', 'in', 'a', 'for'].includes(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');

    const date = rawDate
      ? dayjs(rawDate).isValid()
        ? dayjs(rawDate).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');

    articles.push({ title, link, date });
  });

  await browser.close();

  const outputPath = './data/fetch_macaubusiness_ws.json';
  fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8');

  console.log(`[完成] 共儲存 ${articles.length} 則新聞`);
  if (articles.length) {
    console.log(`[預覽] 第 1 則： ${articles[0].title}`);
  }
} catch (err) {
  console.error('[錯誤]', err.message);
}
