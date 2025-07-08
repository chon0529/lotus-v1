// crawler/fetch_chengpou_ws_cb.js - Lotus v1.5.1-0706（修正版）
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  logInfo,
  logSuccess,
  logError,
  logPreview
} from './modules/logger.js';
import {
  saveHistoryAndUpdateLast,
  saveToHisAll,
  updateLastAddedAll
} from './modules/historyManager.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Macau');

const SCRIPT           = 'fetch_chengpou_ws_cb.js';
const MAIN_URL         = 'https://chengpou.com.mo/newstag/Macao.html';
const JINA_BASE        = 'https://r.jina.ai/https://chengpou.com.mo/newstag/Macao.html';
const OUTPUT_FILE      = './data/fetch_chengpou.json';
const HISTORY_FILE     = './data/his_fetch_chengpou.json';
const HIS_ALL_FILE     = './data/HIS_ALL.json';
const LAST_UPDATED_FILE= './data/last_updated.json';
const MAX_NEWS         = 30;
const RETRY_DELAY_SEC  = 5 * 60;

async function fetchFromHTMLPage(pageNum) {
  const url = pageNum === 1
    ? MAIN_URL
    : `${MAIN_URL}?page=${pageNum}`;
  logInfo(SCRIPT, `[HTML] 加载第 ${pageNum} 页 → ${url}`);
  try {
    const res = await fetch(url, { timeout: 15000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const items = [];
    $('#news-list-container .news-list-detail').each((_, el) => {
      if (items.length >= MAX_NEWS) return;
      const $a      = $(el).find('a').first();
      const linkRel = $a.attr('href')||'';
      const link    = linkRel.startsWith('http')
                       ? linkRel
                       : `https://chengpou.com.mo${linkRel}`;
      const $imgs   = $(el).find('img.news-list-img');
      const image   = $imgs.attr('src')
                        ? `https://chengpou.com.mo${$imgs.attr('src')}`
                        : '';
      const $titles = $(el).find('p.news-list-tilte');
      const title   = $titles.map((i, t)=>$(t).text().trim()).get().join(' ');
      const abstract= $(el).find('.news-list-description').text().trim() || '-';
      const rawDate = $(el).find('.news-list-date').text().trim();
      const pubDate = rawDate.match(/^\d{4}-\d{2}-\d{2}$/)
                        ? rawDate
                        : dayjs(rawDate).format('YYYY-MM-DD');
      if (title && link) {
        items.push({ title, abstract, pubDate, link, image });
      }
    });
    return items;
  } catch (err) {
    logError(SCRIPT, `[HTML] 第 ${pageNum} 页加载失败：${err.message}`);
    return [];
  }
}

async function fetchFromHTML() {
  let all = [];
  for (let p = 1; p <= 3 && all.length < MAX_NEWS; p++) {
    const part = await fetchFromHTMLPage(p);
    if (!part.length) break;      // 403 或页面阻挡就停
    all = all.concat(part);
    if (part.length < MAX_NEWS) continue;
  }
  return all.slice(0, MAX_NEWS);
}

async function fetchFromMarkdownPage(pageNum) {
  const url = pageNum === 1
    ? JINA_BASE
    : `${JINA_BASE}?page=${pageNum}`;
  logInfo(SCRIPT, `[MD] 加载第 ${pageNum} 页 → ${url}`);
  const res = await fetch(url, { timeout: 20000 });
  const text = await res.text();
  // 简单用正则拆分项
  const mdItems = Array.from(text.matchAll(/\[!\[Image.*?\)\s+([^[]+?)\s+(\d{4}-\d{2}-\d{2})\]\((https?:\/\/[^\)]+)\)/g))
    .map(m => {
      const [full, head, date, link] = m;
      // head = "标题 摘要 ... 2025-07-05"
      const parts = head.split('【');
      const title = parts.shift().trim();
      const abstract = parts.length
        ? '【' + parts.join('【')
        : '-';
      const imageMatch = full.match(/\[!\[Image.*?\]\((https?:\/\/[^\)]+)\)/);
      const image = imageMatch ? imageMatch[1] : '';
      return { title, abstract, pubDate: date, link, image };
    });
  return mdItems.slice(0, MAX_NEWS);
}

async function fetchFromMarkdown() {
  let all = [];
  for (let p = 1; p <= 3 && all.length < MAX_NEWS; p++) {
    try {
      const part = await fetchFromMarkdownPage(p);
      all = all.concat(part);
    } catch (err) {
      logError(SCRIPT, `[MD] 第 ${p} 页解析失败：${err.message}`);
      break;
    }
  }
  return all.slice(0, MAX_NEWS);
}

(async () => {
  logInfo(SCRIPT, '啟動抓取正報新聞');
  let news = await fetchFromHTML();
  if (news.length < MAX_NEWS) {
    logInfo(SCRIPT, 'HTML 資料不足，啟用 Markdown 備援');
    const more = await fetchFromMarkdown();
    news = news.concat(more).slice(0, MAX_NEWS);
  }
  if (!Array.isArray(news)) news = [];
  if (!news.length) {
    logError(SCRIPT, '兩種方式均無新聞，保留舊 JSON；5 分鐘後重試');
    return;
  }

  // 寫主檔
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(news, null, 2), 'utf-8');
  logSuccess(SCRIPT, `共 ${news.length} 則新聞已存至 ${OUTPUT_FILE}`);

  // 更新歷史與 last_updated
  const result = saveHistoryAndUpdateLast(
    news, 'chengpou', HISTORY_FILE, LAST_UPDATED_FILE, 'scheduled'
  );
  // 支援不同 historyManager 回傳格式
  let newCount = 0, newItems = [];
  if (typeof result === 'number') {
    newCount = result;
    newItems = []; // 若無法取得 newItems
  } else if (typeof result === 'object' && result) {
    newCount = result.newCount || 0;
    newItems = result.newItems || [];
  }
  logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY_FILE}`);

  // 寫入 HIS_ALL 並更新 lastAddedAll
  if (newItems && newItems.length) {
    await saveToHisAll(newItems, 'ChengPou', HIS_ALL_FILE);
    updateLastAddedAll('chengpou', LAST_UPDATED_FILE);
  }

  // 預覽
  logPreview(SCRIPT, news[0]);
})();