import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import dayjs from 'dayjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, '../data/fetch_gcsup_ws.json');
const url = 'https://www.gcs.gov.mo/list/zh-hant/news/%E5%9F%8E%E8%A6%8F%E5%9F%BA%E5%BB%BA?8';

async function fetchGCSNews() {
  console.log('🟡 [爬蟲] fetch_gcsup_ws 啟動...');
  console.log(`🔗 正在前往網址：${url}`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
    console.log('✅ 網頁加載完成，開始擷取資料...');

    const newsData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr.infiniteItem'));
      return rows.map(row => {
        const titleEl = row.querySelector('span.txt');
        const authorEl = row.querySelector('.dept');
        const dateEl = row.querySelector('time');
        const abstractEl = row.querySelector('.line2Truncate');

        const title = titleEl?.textContent.trim() || '';
        const author = authorEl?.textContent.trim() || '';
        const abstract = abstractEl?.textContent.trim() || '';
        const rawDate = dateEl?.getAttribute('datetime') || '';
        const date = rawDate ? rawDate.slice(0, 10) : '';
        const relativeLink = row.querySelector('a')?.getAttribute('href') || '';
        const address = relativeLink ? 'https://www.gcs.gov.mo' + relativeLink.replace('..', '') : '';

        return { title, author, abstract, date, address };
      }).filter(n => n.title && n.address);
    });

    await browser.close();

    console.log(`📦 共擷取 ${newsData.length} 則新聞，準備寫入檔案...`);
    fs.writeFileSync(outputPath, JSON.stringify(newsData, null, 2), 'utf-8');
    console.log(`💾 已成功儲存至 ${outputPath}`);
    console.log('✅ [完成] fetch_gcsup_ws.js 任務結束');
  } catch (err) {
    console.error('❌ 錯誤：無法擷取 GCS 城規新聞資料');
    console.error(err);
    await browser.close();
  }
}

fetchGCSNews();