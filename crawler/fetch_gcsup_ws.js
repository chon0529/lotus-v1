// fetch_gcsup_ws.js - 增加歷史存檔---202507061900
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import dayjs from 'dayjs';
import { logInfo, logSuccess, logError } from './modules/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '../data/fetch_gcsup_ws.json');
const HIS_PATH = path.join(__dirname, '../data/his_fetch_gcsup.json');
const url = 'https://www.gcs.gov.mo/list/zh-hant/news/%E5%9F%8E%E8%A6%8F%E5%9F%BA%E5%BB%BA';

async function fetchGCSNews() {
  logInfo('[爬蟲] fetch_gcsup_ws 啟動', url);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
    logInfo('fetch_gcsup_ws', '網頁加載完成，開始擷取資料');

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

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newsData, null, 2), 'utf-8');
    logSuccess('fetch_gcsup_ws', `主檔已成功儲存 ${newsData.length} 則至 ${OUTPUT_PATH}`);

    // ========== 歷史去重寫入 ==========
    let his = [];
    try {
      his = JSON.parse(fs.readFileSync(HIS_PATH, 'utf-8').trim());
      if (!Array.isArray(his)) his = [];
    } catch { his = []; }

    const oldKeys = new Set(his.map(n => `${n.title}|${n.date}`));
    const toAdd = newsData.filter(n => !oldKeys.has(`${n.title}|${n.date}`));
    if (toAdd.length) {
      his = toAdd.concat(his).slice(0, 1000);
      fs.writeFileSync(HIS_PATH, JSON.stringify(his, null, 2), 'utf-8');
      logSuccess('fetch_gcsup_ws', `新增 ${toAdd.length} 條至歷史檔 ${HIS_PATH}`);
    } else {
      logInfo('fetch_gcsup_ws', '沒有新增歷史新聞');
    }

  } catch (err) {
    logError('fetch_gcsup_ws', `錯誤：${err.message}`);
    await browser.close();
  }
}

fetchGCSNews();