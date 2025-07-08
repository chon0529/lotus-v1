// crawler/fetch_macaodaily_ws_cb.js - Lotus v1.5.4-0706
// 標準版：puppeteer 方案，logger+history 全相容

import puppeteer from 'puppeteer';
import fs from 'fs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  logInfo, logSuccess, logError, logPreview, logSavedMain, logSavedHis
} from './modules/logger.js';
import { saveHistoryAndUpdateLast } from './modules/historyManager.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ                = 'Asia/Macau';
const SCRIPT            = 'fetch_macaodaily_ws_cb.js';
const URL               = 'https://www.modaily.cn/amucsite/web/index.html';
const OUTPUT_FILE       = './data/fetch_macaodaily.json';
const HISTORY_FILE      = './data/his_fetch_macaodaily.json';
const LAST_UPDATED_FILE = './data/last_updated.json';
const MAX_NEWS          = 19;
const INTERVAL_MIN      = 5;  // 自動排程間隔
const RETRY_DELAY_SEC   = 5 * 60; // 5 分鐘重試

async function fetchNews() {
  logInfo(SCRIPT, '啟動');

  let news = [];

  try {
    logInfo(SCRIPT, `載入頁面：${URL}`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.setViewport({ width: 1280, height: 800 });
    await page.waitForSelector('#mainContents div.conWidth.mianConLeft > div:nth-child(1)', { timeout: 10000 });

    // --- 核心抓取邏輯 ---
    news = await page.evaluate((limit) => {
      const out = [];
      document.querySelectorAll('#mainContents div.conWidth.mianConLeft > div').forEach((b, i) => {
        if (out.length >= limit) return;
        const t = b.querySelector('h3');
        const d = b.querySelector('ul>li:nth-child(2)');
        const img = b.querySelector('img');
        if (!t || !d || !img) return;
        const title = t.innerText.trim();
        const pubDate = d.innerText.trim();
        const src = img.getAttribute('src') || '';
        const m = src.match(/\/(\d{7,})_/);
        const id = m ? m[1] : '';
        const link = id ? `https://www.modaily.cn/amucsite/web/index.html#/detail/${id}` : '#';
        out.push({ title, pubDate, link });
      });
      return out;
    }, MAX_NEWS);

    await browser.close();

    // --- 寫入主檔 ---
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(news, null, 2), 'utf8');
    logSavedMain(SCRIPT, news.length, OUTPUT_FILE);

    // --- 更新歷史 + last_updated ---
    const { newCount } = saveHistoryAndUpdateLast(
      news,
      'macaodaily',
      HISTORY_FILE,
      LAST_UPDATED_FILE
    );
    logSavedHis(SCRIPT, HISTORY_FILE, newCount);

    // --- 預覽 ---
    if (news.length > 0) logPreview(SCRIPT, news[0]);
    else                 logPreview(SCRIPT, '無可用新聞');

  } catch (err) {
    // DNS 失敗時
    if (/ERR_NAME_NOT_RESOLVED/.test(err.message)) {
      const mm = String(Math.floor(RETRY_DELAY_SEC / 60)).padStart(2, '0');
      const ss = String(RETRY_DELAY_SEC % 60).padStart(2, '0');
      logError(
        SCRIPT,
        `DNS 解析失敗，使用舊 JSON；於 ${mm}:${ss} 後重試，原排程延至 ${INTERVAL_MIN + 5} 分鐘後`
      );
      return;
    }
    logError(SCRIPT, `抓取/寫入失敗：${err.message}`);
    console.error(err);
  }
}

fetchNews();

// ///// the end of fetch_macaodaily_ws_cb.js - Lotus v1.5.4-0706