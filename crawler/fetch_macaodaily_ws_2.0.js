// fetch_macaodaily_ws_2.0.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = './data/fetch_macaodaily_ws_2.0.json';
const URL = 'https://www.modaily.cn/amucsite/web/index.html';

async function fetchMacaoDailyNews() {
  console.log('[爬蟲] fetch_macaodaily_ws_2.0 啟動');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.setViewport({ width: 1280, height: 800 });

  await page.waitForSelector('#mainContents div.conWidth.mianConLeft > div:nth-child(1)');

  const news = await page.evaluate(() => {
    const items = [];
    const newsBlocks = document.querySelectorAll('#mainContents div.conWidth.mianConLeft > div');
    for (let i = 0; i < newsBlocks.length && items.length < 10; i++) {
      try {
        const block = newsBlocks[i];
        const titleEl = block.querySelector('h3');
        const timeEl = block.querySelector('ul > li:nth-child(2)');
        const imgEl = block.querySelector('img');

        if (!titleEl || !timeEl || !imgEl) continue;

        const title = titleEl.innerText.trim();
        const pubDate = timeEl.innerText.trim();
        const imgSrc = imgEl.getAttribute('src');
        const match = imgSrc.match(/\/(\d{7,})_/);
        const fileId = match ? match[1] : null;
        const link = fileId
          ? `https://www.modaily.cn/amucsite/web/index.html#/detail/${fileId}`
          : '#';

        items.push({ title, pubDate, link });
      } catch (_) {
        continue;
      }
    }
    return items;
  });

  await browser.close();

  fs.writeFileSync(path.resolve(OUTPUT_FILE), JSON.stringify(news, null, 2));
  console.log(`[爬蟲] fetch_macaodaily_ws_2.0 抓取完成，共 ${news.length} 則`);
}

fetchMacaoDailyNews().catch(err => {
  console.error('[爬蟲] fetch_macaodaily_ws_2.0 錯誤:', err);
});
