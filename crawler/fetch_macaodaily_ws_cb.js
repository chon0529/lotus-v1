import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { saveHistoryAndUpdateLast } from './modules/historyManager.js';
import { logInfo, logSuccess, logError, logPreview } from './modules/logger.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Macau');

const OUTPUT_FILE = './data/fetch_macaodaily_ws_cb.json';
const HISTORY_FILE = './data/fetch_macaodaily_ws_cb_his.json';
const LAST_UPDATED_FILE = './data/last_updated.json';
const URL = 'https://www.modaily.cn/amucsite/web/index.html';
const MAX_NEWS = 19;

async function fetchMacaoDaily() {
  logInfo('fetch_macaodaily_ws_cb 啟動');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.setViewport({ width: 1280, height: 800 });
    await page.waitForSelector('#mainContents div.conWidth.mianConLeft > div:nth-child(1)', { timeout: 30000 });

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

    fs.writeFileSync(path.resolve(OUTPUT_FILE), JSON.stringify(news, null, 2));
    logSuccess(`共 ${news.length} 則新聞已存至於 ${OUTPUT_FILE}`);

    const { newCount } = saveHistoryAndUpdateLast(news, 'macaodaily', false);
    logSuccess(`共新增 ${newCount} 條，已寫入 ${HISTORY_FILE}`);
    if (news.length > 0) logPreview(news[0]);

    return news;
  } catch (error) {
    await browser.close();
    logError(`抓取錯誤：${error.message}`);
    return [];
  }
}

// 只用於手動強制刷新時呼叫
export async function runFetchManual() {
  logInfo('手動更新開始');
  const news = await fetchMacaoDaily();
  saveHistoryAndUpdateLast(news, 'macaodaily', true);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // 直接執行此檔案時跑這
  fetchMacaoDaily();
}

///// the end of fetch_macaodaily_ws_cb.js
