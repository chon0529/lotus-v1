// fetch_tdm_ws.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = './data/fetch_tdm_ws.json';
const URL = 'https://www.tdm.com.mo/zh-hant/news-list?type=image&category=all&page=1';

async function fetchTDMNews() {
  console.log('[爬蟲] fetch_tdm_ws 啟動');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });

    // 等待第一則 .news-item 出現
    await page.waitForSelector('.news-item', { timeout: 30000 });

    const items = await page.evaluate(() => {
      const data = [];
      const list = document.querySelectorAll('.news-item');
      for (let i = 0; i < list.length && data.length < 10; i++) {
        const el = list[i];
        const titleEl = el.querySelector('.news-title');
        const linkEl = el.querySelector('a');
        const timeEl = el.querySelector('.news-time');

        if (titleEl && linkEl && timeEl) {
          data.push({
            title: titleEl.innerText.trim(),
            link: 'https://www.tdm.com.mo' + linkEl.getAttribute('href'),
            pubDate: timeEl.innerText.trim()
          });
        }
      }
      return data;
    });

    fs.writeFileSync(path.resolve(OUTPUT_FILE), JSON.stringify(items, null, 2), 'utf8');
    console.log(`[爬蟲] fetch_tdm_ws 抓取完成，共 ${items.length} 則`);
  } catch (err) {
    console.error('[爬蟲] fetch_tdm_ws 錯誤:', err.message);
  } finally {
    await browser.close();
  }
}

fetchTDMNews();
