// crawler/fetch_macaodaily_ws_cb.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import dayjs from 'dayjs';
import { logInfo, logSuccess, logPreview } from './modules/logger.js';
import { saveHistoryAndUpdateLast } from './modules/historyManager.js';

const OUTPUT_FILE = './data/fetch_macaodaily_ws_cb.json';
const HISTORY_KEY = 'macaodaily';
const URL = 'https://www.modaily.cn/amucsite/web/index.html';
const MAX_NEWS = 19;

logInfo('fetch_macaodaily_ws_cb 啟動');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.setViewport({ width: 1280, height: 800 });
await page.waitForSelector('#mainContents div.conWidth.mianConLeft > div:nth-child(1)');

const news = await page.evaluate((MAX_NEWS) => {
  const items = [];
  const blocks = document.querySelectorAll('#mainContents div.conWidth.mianConLeft > div');
  for (let i = 0; i < blocks.length && items.length < MAX_NEWS; i++) {
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
}, MAX_NEWS);

await browser.close();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(news, null, 2), 'utf8');
logSuccess(`共 ${news.length} 則新聞已存至於 ${OUTPUT_FILE}`);

// 此處回傳的是物件 { newCount, newItems }
const result = saveHistoryAndUpdateLast(news, HISTORY_KEY);

// log 新增數量
if (result && typeof result === 'object' && 'newCount' in result) {
  logSuccess(`共新增 ${result.newCount} 條，已寫入 ./data/fetch_macaodaily_ws_cb_his.json`);
} else if (typeof result === 'number') {
  logSuccess(`共新增 ${result} 條，已寫入 ./data/fetch_macaodaily_ws_cb_his.json`);
}

// 預覽第一則新聞
if (news.length > 0) logPreview(news[0]);