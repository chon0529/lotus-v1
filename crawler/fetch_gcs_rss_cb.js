// fetch_gcs_rss_cb.js - GPT-1.4.0-0708（修正版）
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { logInfo, logSuccess, logError, logPreview } from './modules/logger.js';
import { saveHistoryAndUpdateLast, updateLastAddedAll } from './modules/historyManager.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Macau');

const MAIN_URL = 'https://www.gcs.gov.mo/list/zh-hant/news/';
const BACKUP_URL = 'https://govinfohub.gcs.gov.mo/api/rss/n/zh-hant';

const OUTPUT_FILE = './data/fetch_gcs.json';
const HISTORY_FILE = './data/his_fetch_gcs.json';
const ALL_HISTORY_FILE = './data/HIS_ALL.json';
const LAST_UPDATED_FILE = './data/last_updated.json';
const MAX_NEWS = 35;

logInfo('fetch_gcs_rss_cb.js', '啟動抓取 GCS 新聞（主：官方網頁）');

async function fetchFromMain() {
  logInfo('fetch_gcs_rss_cb.js', `主來源：${MAIN_URL}`);
  try {
    const res = await fetch(MAIN_URL, { timeout: 20000 });
    const html = await res.text();
    const $ = cheerio.load(html);
    const newsList = [];
    $('.infiniteItem').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.subject .txt').text().trim();
      const abstract = $el.find('.baseSize').text().trim();
      const date = $el.find('time').attr('datetime')?.split('T')[0] || '';
      const rawHref = $el.find('a.baseInfo').attr('href') || '';
      const idMatch = rawHref.match(/detail\/zh-hant\/([^?]+)/);
      const link = idMatch ? `https://www.gcs.gov.mo/detail/zh-hant/${idMatch[1]}` : '';
      if (title && link) {
        newsList.push({
          title,
          pubDate: date ? dayjs(date).tz('Asia/Macau').format('YYYY-MM-DD') : '',
          link,
          abstract: abstract || '-'
        });
      }
    });
    return newsList.slice(0, MAX_NEWS);
  } catch (err) {
    logError('fetch_gcs_rss_cb.js', `主來源官網失敗(${err.message})，轉用 RSS 備援`);
    return null;
  }
}

async function fetchFromBackup() {
  logInfo('fetch_gcs_rss_cb.js', `備援 RSS：${BACKUP_URL}`);
  try {
    const res = await fetch(BACKUP_URL, { timeout: 15000 });
    if (!res.ok) throw new Error(`RSS 備援回應錯誤：${res.status}`);
    const xml = await res.text();
    const items = Array.from(xml.matchAll(/<item>[\s\S]*?<\/item>/g));
    const newsList = items.slice(0, MAX_NEWS).map(item => {
      const getTag = (tag) => {
        const m = item[0].match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
        return m ? m[1].trim() : '';
      };
      return {
        title: getTag('title'),
        pubDate: dayjs(getTag('pubDate')).tz('Asia/Macau').format('YYYY-MM-DD HH:mm'),
        link: getTag('link'),
        abstract: getTag('description') || '-'
      };
    }).filter(i => i.title && i.link);
    return newsList;
  } catch (err) {
    logError('fetch_gcs_rss_cb.js', `RSS 備援也失敗(${err.message})，僅保留舊 JSON；於 05:00 後重試，原排程延至 10 分鐘後`);
    return [];
  }
}

// 自行寫函式更新完整 last_updated 格式
function updateLastUpdatedFull(key, data) {
  try {
    let json = {};
    if (fs.existsSync(LAST_UPDATED_FILE)) {
      json = JSON.parse(fs.readFileSync(LAST_UPDATED_FILE, 'utf-8'));
    }
    json[key] = { ...json[key], ...data };
    fs.writeFileSync(LAST_UPDATED_FILE, JSON.stringify(json, null, 2), 'utf-8');
  } catch(e) {
    // ignore error
  }
}

(async () => {
  let news = await fetchFromMain();
  let sourceUsed = 'main';
  if (!news || news.length === 0) {
    news = await fetchFromBackup();
    sourceUsed = 'backup';
  }
  if (!news || news.length === 0) {
    // 主備都失敗，留舊資料
    return;
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(news, null, 2), 'utf-8');
  logSuccess('fetch_gcs_rss_cb.js', `共 ${news.length} 則新聞已存至於 ${OUTPUT_FILE}`);

  // 寫入歷史與 last_updated
  const result = await saveHistoryAndUpdateLast(
    news,
    'gcs',
    HISTORY_FILE,
    LAST_UPDATED_FILE,
    "scheduled"
  );
  let newCount = 0, newItems = [];
  if (typeof result === 'object' && result) {
    newCount = result.newCount || 0;
    newItems = result.newItems || [];
  } else if (typeof result === 'number') {
    newCount = result;
  }
  logSuccess('fetch_gcs_rss_cb.js', `共新增 ${newCount} 條，已寫入 ${HISTORY_FILE}`);

  // 寫入 HIS_ALL.json 並同步 lastAddedAll
  let allHistory = [];
  if (fs.existsSync(ALL_HISTORY_FILE)) {
    try {
      const txt = fs.readFileSync(ALL_HISTORY_FILE, 'utf-8').trim();
      allHistory = txt ? JSON.parse(txt) : [];
      if (!Array.isArray(allHistory)) allHistory = [];
    } catch { allHistory = []; }
  }
  const allExistingLinks = new Set(allHistory.map(n => n.link));
  newItems.forEach(item => {
    if (!allExistingLinks.has(item.link)) {
      allHistory.push({
        Source: "GCS",
        title: item.title,
        pubDate: item.pubDate,
        Date: dayjs().format('YYYY-MM-DD'),
        link: item.link,
        Abstract: item.abstract || '-'
      });
    }
  });
  fs.writeFileSync(ALL_HISTORY_FILE, JSON.stringify(allHistory, null, 2), 'utf-8');

  // 更新 lastUpdated 的完整結構
  updateLastUpdatedFull('gcs', {
    fetch: 'gcs',
    lastRun: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    lastSuccess: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    lastAdded: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    lastOperation: 'scheduled',
    lastManual: null
  });

  

  // 預覽
  if (news.length > 0) logPreview('fetch_gcs_rss_cb.js', news[0]);
  else logPreview('fetch_gcs_rss_cb.js', '無法顯示新聞');
})();