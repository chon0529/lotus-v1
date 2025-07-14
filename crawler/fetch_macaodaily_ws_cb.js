// fetch_macaodaily_ws_cb.js – Lotus v1.5.6 (2025-07-13，雙來源備援＋Jina Markdown 機制)
// 只要主站失敗自動 fallback 到 Jina，全部歷史、log、命名規則完全一致

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
// 主站
const PRIMARY_URL       = 'https://www.modaily.cn/amucsite/web/index.html';
// 備援 Jina
const BACKUP_URL        = 'https://r.jina.ai/https://www.modaily.cn/amucsite/web/index.html';

const OUTPUT_FILE       = './data/fetch_macaodaily.json';
const HISTORY_FILE      = './data/his_fetch_macaodaily.json';
const LAST_UPDATED_FILE = './data/last_updated.json';
const MAX_NEWS          = 19;
const INTERVAL_MIN      = 5;    // 自動排程間隔
const RETRY_DELAY_SEC   = 5*60; // DNS 失敗重試

/**
 * 備援 markdown 解析，支援 ##/### 標題
 */
function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const titleMatch = line.match(/^#{2,3}\s+(.+)/);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      // 下一行找 "*   -8小時前"
      const pubLine = (lines[i + 1] || '').trim();
      const dateMatch = pubLine.match(/^\*\s*-?\s*(.+)$/);
      const pubDate = dateMatch ? dateMatch[1].trim() : '';
      // 下幾行找 image url
      let imageUrl = '';
      for (let j = i + 2; j < i + 6 && j < lines.length; j++) {
        const imgMatch = lines[j].match(/!\[.*?\]\((https?:\/\/\S+)\)/);
        if (imgMatch) { imageUrl = imgMatch[1]; break; }
      }
      // 抽 id 拼出連結
      let id = '';
      const m = imageUrl.match(/\/(\d+)_/);
      if (m) id = m[1];
      const link = id
        ? `https://www.modaily.cn/amucsite/web/index.html#/detail/${id}`
        : '';
      if (title && link) {
        items.push({ title, pubDate, link });
      }
    }
  }
  return items.slice(0, MAX_NEWS);
}

/**
 * 主站 puppeteer 抓取邏輯
 */
async function fetchFromPrimary() {
  logInfo(SCRIPT, `主站載入：${PRIMARY_URL}`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(PRIMARY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.setViewport({ width: 1280, height: 800 });
  await page.waitForSelector('#mainContents div.conWidth.mianConLeft > div:nth-child(1)', { timeout: 10000 });
  // 核心邏輯同你原本
  const news = await page.evaluate((limit) => {
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
  return news;
}

/**
 * 備援 Jina markdown 機制
 */
async function fetchFromBackup() {
  logInfo(SCRIPT, `備援 Jina：${BACKUP_URL}`);
  const res = await fetch(BACKUP_URL, {
    headers: { 'accept': 'text/markdown' }
  });
  if (!res.ok) throw new Error('Jina 來源 HTTP 錯誤');
  const md = await res.text();
  const news = parseMarkdown(md);
  return news;
}

async function fetchNews() {
  logInfo(SCRIPT, '啟動');
  let news = [];
  // 1. 先主站
  try {
    news = await fetchFromPrimary();
    if (news.length > 0) {
      logSuccess(SCRIPT, `主站成功取得 ${news.length} 條`);
    } else {
      logError(SCRIPT, '主站沒有可用新聞');
    }
  } catch (err) {
    logError(SCRIPT, `主站失敗：${err.message}`);
  }

  // 2. 若主站失敗或無資料→改用備援 Jina
  if (!news.length) {
    try {
      news = await fetchFromBackup();
      if (news.length > 0) {
        logSuccess(SCRIPT, `備援 Jina 成功取得 ${news.length} 條`);
      } else {
        logError(SCRIPT, 'Jina 來源沒有可用新聞');
      }
    } catch (err) {
      logError(SCRIPT, `Jina 備援抓取失敗：${err.message}`);
    }
  }

  if (!news.length) {
    logError(SCRIPT, '兩個來源皆無新聞可用，流程中斷');
    return;
  }

  // --- 寫入主檔 ---
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(news, null, 2), 'utf8');
  logSavedMain(SCRIPT, news.length, OUTPUT_FILE);

  // --- 更新歷史 + last_updated ---
  const { newCount } = saveHistoryAndUpdateLast(
    news, 'macaodaily', HISTORY_FILE, LAST_UPDATED_FILE
  );
  logSavedHis(SCRIPT, HISTORY_FILE, newCount);

  // --- 預覽 ---
  logPreview(SCRIPT, news[0] || '無可用新聞');
}

fetchNews();
// ///// the end of fetch_macaodaily_ws_cb.js - Lotus v1.5.6（2025-07-13 備援版）