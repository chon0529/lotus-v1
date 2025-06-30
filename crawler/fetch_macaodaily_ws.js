// fetch_macaodaily_ws.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = './data/fetch_macaodaily_ws.json';

async function fetchMacaoDailyNews() {
  console.log('[爬蟲] fetch_macaodaily_ws 啟動');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.modaily.cn/amucsite/web/index.html', {
    waitUntil: 'networkidle2',
    timeout: 0
  });

  await page.setViewport({ width: 1280, height: 800 });

  // 等待主內容加載完成
  await page.waitForSelector('#mainContents');

  // 抓取新聞資料
  const newsItems = await page.evaluate(() => {
    const results = [];
    const container = document.querySelector('#mainContents');
    if (!container) return results;

    const items = container.querySelectorAll('div.conWidth.mianConLeft > div');
    for (const item of items) {
      const linkElem = item.querySelector('a');
      const titleElem = item.querySelector('h3');
      const timeElem = item.querySelector('span');

      const link = linkElem ? linkElem.href : '';
      const title = titleElem ? titleElem.innerText.trim() : '';
      const pubDate = timeElem ? timeElem.innerText.trim() : '';

      if (title && link && pubDate) {
        results.push({ title, link, pubDate });
      }

      if (results.length >= 10) break;
    }
    return results;
  });

  await browser.close();

  if (newsItems.length === 0) {
    console.log('[爬蟲] fetch_macaodaily_ws 抓取完成，共 0 則');
  } else {
    fs.writeFileSync(path.resolve(OUTPUT_FILE), JSON.stringify(newsItems, null, 2), 'utf8');
    console.log(`[爬蟲] fetch_macaodaily_ws 抓取完成，共 ${newsItems.length} 則`);
  }
}

fetchMacaoDailyNews().catch(err => {
  console.error('[爬蟲] fetch_macaodaily_ws 錯誤:', err);
});
