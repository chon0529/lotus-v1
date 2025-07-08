// fetch_gcseng_ws.js---202507061900
// 爬取新聞局「工程房屋」類新聞

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import { logInfo, logSuccess, logError } from './modules/logger.js';

const MODULE_NAME = 'fetch_gcseng_ws';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'fetch_gcseng_ws.json');
const HIS_PATH = path.join(__dirname, '..', 'data', 'his_fetch_gcseng.json');

logInfo(`[爬蟲] ${MODULE_NAME} 啟動`);

async function fetchGCSNews() {
  const url = 'https://www.gcs.gov.mo/list/zh-hant/news/%E5%B7%A5%E7%A8%8B%E6%88%BF%E5%B1%8B';

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const newsItems = [];
    $('table.infiniteDataView tr.infiniteItem').each((_, el) => {
      const title = $(el).find('.captionSize .txt').text().trim();
      const author = $(el).find('.dept').text().trim();
      const abstract = $(el).find('.baseSize').text().trim();
      const dateRaw = $(el).find('time').attr('datetime');
      const date = dateRaw ? dayjs(dateRaw).format('YYYY-MM-DD') : '';
      const href = $(el).find('a.baseInfo').attr('href') || '';
      const address = href ? 'https://www.gcs.gov.mo' + href.replace('..', '') : '';

      if (title && address) {
        newsItems.push({ title, author, abstract, date, address });
      }
    });

    // === 寫入主檔 ===
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newsItems, null, 2), 'utf8');
    logSuccess(`[爬蟲] ${MODULE_NAME} 成功儲存 ${newsItems.length} 則新聞至 ${OUTPUT_PATH}`);

    // === 歷史去重/新增 ===
    let his = [];
    try {
      his = JSON.parse(fs.readFileSync(HIS_PATH, 'utf-8').trim());
      if (!Array.isArray(his)) his = [];
    } catch { his = []; }
    const oldKeys = new Set(his.map(n => `${n.title}|${n.date}`));
    const toAdd = newsItems.filter(n => !oldKeys.has(`${n.title}|${n.date}`));
    if (toAdd.length) {
      his = toAdd.concat(his).slice(0, 1000); // 最新1000則
      fs.writeFileSync(HIS_PATH, JSON.stringify(his, null, 2), 'utf8');
      logSuccess(`[爬蟲] ${MODULE_NAME} 新增 ${toAdd.length} 條歷史新聞至 ${HIS_PATH}`);
    } else {
      logInfo(`[爬蟲] ${MODULE_NAME} 沒有新增歷史新聞`);
    }

  } catch (err) {
    logError(`[爬蟲] ${MODULE_NAME} 發生錯誤：${err.message}`);
  }
}

fetchGCSNews();