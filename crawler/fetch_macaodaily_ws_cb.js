// fetch_macaodaily_ws_cb.js – Lotus v1.5.5 (2025-07-12，雙來源備援)
// 標準版：puppeteer 方案 + 雙 URL 備援 + logger+history 全相容

import puppeteer from 'puppeteer';
import fs     from 'fs';
import dayjs  from 'dayjs';
import utc    from 'dayjs/plugin/utc.js';
import tz     from 'dayjs/plugin/timezone.js';

import {
  logInfo, logSuccess, logError, logPreview,
  logSavedMain, logSavedHis
} from './modules/logger.js';
import { saveHistoryAndUpdateLast } from './modules/historyManager.js';

dayjs.extend(utc);
dayjs.extend(tz);

const TZ                = 'Asia/Macau';
const SCRIPT            = 'fetch_macaodaily_ws_cb.js';
// 主要來源
const PRIMARY_URL       = 'https://www.modaily.cn/amucsite/web/index.html';
// 備援來源（透過 r.jina.ai 代理）
const BACKUP_URL        = 'https://r.jina.ai/https://www.modaily.cn/amucsite/web/index.html';

const OUTPUT_FILE       = './data/fetch_macaodaily.json';
const HISTORY_FILE      = './data/his_fetch_macaodaily.json';
const LAST_UPDATED_FILE = './data/last_updated.json';

const MAX_NEWS          = 19;    // puppeteer evaluate limit
const INTERVAL_MIN      = 5;     // 調度間隔 (分鐘)
const RETRY_DELAY_SEC   = 5*60;  // DNS 失敗時重試延遲

async function fetchFrom(url) {
  logInfo(SCRIPT, `嘗試載入：${url}`);
  const browser = await puppeteer.launch({ headless: true });
  const page    = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // 確保定位到新聞區
  await page.waitForSelector(
    '#mainContents div.conWidth.mianConLeft > div:nth-child(1)',
    { timeout: 10000 }
  );
  // 抓取前 MAX_NEWS 筆
  const news = await page.evaluate(limit => {
    const out = [];
    document.querySelectorAll(
      '#mainContents div.conWidth.mianConLeft > div'
    ).forEach((b, i) => {
      if (out.length >= limit) return;
      const t   = b.querySelector('h3');
      const d   = b.querySelector('ul>li:nth-child(2)');
      const img = b.querySelector('img');
      if (!t || !d || !img) return;
      const title   = t.innerText.trim();
      const pubDate = d.innerText.trim();
      const src     = img.getAttribute('src') || '';
      const m       = src.match(/\/(\d{7,})_/);
      const id      = m ? m[1] : '';
      const link    = id
        ? `https://www.modaily.cn/amucsite/web/index.html#/detail/${id}`
        : '#';
      out.push({ title, pubDate, link });
    });
    return out;
  }, MAX_NEWS);

  await browser.close();
  return news;
}

async function fetchNews() {
  logInfo(SCRIPT, '啟動新聞抓取流程');
  let news = [];
  // 依序嘗試兩個 URL
  for (const url of [PRIMARY_URL, BACKUP_URL]) {
    try {
      news = await fetchFrom(url);
      if (news.length) {
        logInfo(SCRIPT, `成功從 ${url} 抓到 ${news.length} 筆新聞`);
        break;
      } else {
        logError(SCRIPT, `從 ${url} 沒抓到任何新聞`);
      }
    } catch (err) {
      logError(SCRIPT, `從 ${url} 抓取失敗：${err.message}`);
    }
  }

  if (!news.length) {
    logError(SCRIPT, '兩個來源皆無新聞可用，流程中斷');
    return;
  }

  // 寫入主檔
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(news, null, 2), 'utf8');
  logSavedMain(SCRIPT, news.length, OUTPUT_FILE);

  // 更新歷史與 last_updated
  const { newCount } = saveHistoryAndUpdateLast(
    news, 'macaodaily', HISTORY_FILE, LAST_UPDATED_FILE
  );
  logSavedHis(SCRIPT, HISTORY_FILE, newCount);

  // 預覽第一筆
  logPreview(SCRIPT, news[0] || '無可用新聞');
}

fetchNews();
