// crawler/fetch_macaodaily_ws_cb.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { logInfo, logSuccess, logPreview } from './modules/logger.js';
import { saveHistoryAndUpdateLast } from './modules/historyManager.js';

const OUTPUT_FILE = './data/fetch_macaodaily_ws_cb.json';
const HISTORY_FILE = './data/fetch_macaodaily_ws_cb_his.json';
const LAST_UPDATED_FILE = './data/last_updated.json';
const URL = 'https://www.modaily.cn/amucsite/web/index.html';
const MAX_NEWS = 19;

logInfo('fetch_macaodaily_ws_cb 啟動');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.setViewport({ width: 1280, height: 800 });
await page.waitForSelector('#mainContents div.conWidth.mianConLeft > div:nth-child(1)');

const news = await page.evaluate(() => {
  const items = [];
  const blocks = document.querySelectorAll('#mainContents div.conWidth.mianConLeft > div');
  for (let i = 0; i < blocks.length && items.length < 19; i++) {
    const block = blocks[i];
    const titleEl = block.querySelector('h3');
    const timeEl = block.querySelector('ul > li:nth-child(2)');
    const imgEl = block.querySelector('img');
    if (!titleEl || !timeEl || !imgEl) continue;
    const title = titleEl.innerText.trim();
    const pubDate = timeEl.innerText.trim();
    const imgSrc = imgEl.getAttribute('src');
    const fileIdMatch = imgSrc.match(/\/(\d{7,})_/);
    const fileId = fileIdMatch ? fileIdMatch[1] : null;
    const link = fileId ? `https://www.modaily.cn/amucsite/web/index.html#/detail/${fileId}` : '#';
    items.push({ title, pubDate, link });
  }
  return items;
});

await browser.close();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(news, null, 2));
logSuccess(`共 ${news.length} 則新聞已存至於 ${OUTPUT_FILE}`);

const newCount = saveHistoryAndUpdateLast({
  key: 'macaodaily',
  latestData: news,
  outputFile: OUTPUT_FILE,
  historyFile: HISTORY_FILE,
  lastUpdatedFile: LAST_UPDATED_FILE
});

logSuccess(`共新增 ${newCount} 條，已寫入 ${HISTORY_FILE}`);
if (news.length > 0) logPreview(news[0]);
