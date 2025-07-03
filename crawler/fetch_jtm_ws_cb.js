import fs from 'fs';
import axios from 'axios';
import dayjs from 'dayjs';
import { logger } from './logger.js';

const SCRIPT_NAME = 'Fetch_jtm_ws_cb.js';
const OUTPUT_FILE = './data/fetch_jtm_ws_cb.json';
const HIS_FILE = './data/fetch_jtm_ws_cb_his.json';
const LAST_UPDATED_FILE = './data/last_updated.json';
const MARKDOWN_URL = 'https://r.jina.ai/https://jtm.com.mo/';
const MAX_NEWS = 13; // 5+8

function updateLastUpdated(scriptName, isAdded) {
  let lastObj = {};
  if (fs.existsSync(LAST_UPDATED_FILE)) {
    try { lastObj = JSON.parse(fs.readFileSync(LAST_UPDATED_FILE, 'utf-8')); } catch {}
  }
  const nowStr = () => {
    const now = new Date();
    return (
      now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0')
    );
  };
  const key = scriptName.replace('.js','').replace(/^fetch_/i, 'fetch_');
  if (!lastObj[key]) lastObj[key] = {};
  lastObj[key].last_run = nowStr();
  if (isAdded) lastObj[key].last_added = nowStr();
  fs.writeFileSync(LAST_UPDATED_FILE, JSON.stringify(lastObj, null, 2), 'utf-8');
}

// 處理 5 big pic + 8 normal pic（全部在 markdown 內一起抽取）
function parseMarkdown(markdown) {
  const results = [];

  // 1. 先抓 [標題 --- 日期](link) 格式（5 big pic）
  const regexBig = /\[(.+?)\s+-+\s+(\d{1,2} \w{3}, \d{4})\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  while ((match = regexBig.exec(markdown)) !== null && results.length < MAX_NEWS) {
    const [, rawTitle, rawDate, link] = match;
    const date = dayjs(rawDate, 'D MMM, YYYY').format('YYYY-MM-DD');
    results.push({ title: rawTitle.trim(), link, date });
  }

  // 2. 再抓 normal 格式（### [title](url) + date）
  const regexNormal = /###\s*\[(.+?)\]\((https?:\/\/[^\s)]+)\)[\s\S]*?(\d{1,2} \w{3}, \d{4})/g;
  while ((match = regexNormal.exec(markdown)) !== null && results.length < MAX_NEWS) {
    const [, rawTitle, link, rawDate] = match;
    const date = dayjs(rawDate, 'D MMM, YYYY').format('YYYY-MM-DD');
    // 避免重複（如有可能重複URL/標題）
    if (!results.find(n => n.link === link)) {
      results.push({ title: rawTitle.trim(), link, date });
    }
  }

  return results.slice(0, MAX_NEWS);
}

(async () => {
  logger.info(`${SCRIPT_NAME} 開始執行...`);
  let news = [];
  let markdown = '';

  // 下載 markdown
  try {
    const resp = await axios.get(MARKDOWN_URL, { timeout: 60000 });
    markdown = resp.data;
    logger.success('成功取得 markdown 內容');
  } catch (err) {
    logger.error('無法取得 markdown 內容：' + err.message);
    updateLastUpdated('fetch_jtm_ws_cb.js', false);
    process.exit(1);
  }

  // 解析內容
  try {
    news = parseMarkdown(markdown);
    if (!Array.isArray(news) || news.length === 0) throw new Error('新聞數量為 0');
    logger.success(`共擷取 ${news.length} 條新聞`);
  } catch (err) {
    logger.error('解析 markdown 失敗：' + err.message);
    updateLastUpdated('fetch_jtm_ws_cb.js', false);
    process.exit(1);
  }

  // 儲存主檔
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(news, null, 2), 'utf-8');
    logger.savedMain(SCRIPT_NAME, news.length, OUTPUT_FILE);
  } catch (err) {
    logger.error('寫入主檔失敗：' + err.message);
    updateLastUpdated('fetch_jtm_ws_cb.js', false);
    process.exit(1);
  }

  // 處理 HIS
  let oldHis = { news: [] };
  if (fs.existsSync(HIS_FILE)) {
    try { oldHis = JSON.parse(fs.readFileSync(HIS_FILE, 'utf-8')); } catch {}
  }
  const oldTitles = (oldHis.news || []).map(item => item.title);
  const newNews = news.filter(item => !oldTitles.includes(item.title));
  const nowString = () => {
    const now = new Date();
    return (
      now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0')
    );
  };

  const hisData = {
    last_run: nowString(),
    last_added: newNews.length > 0 ? nowString() : (oldHis.last_added || nowString()),
    news: (newNews.length > 0 ? newNews : oldHis.news)
  };
  try {
    fs.writeFileSync(HIS_FILE, JSON.stringify(hisData, null, 2), 'utf-8');
    logger.savedHis(SCRIPT_NAME, HIS_FILE, newNews.length);
    if (newNews.length > 0) {
      logger.preview(`本次新增 ${newNews.length} 則新聞，首則：\n${JSON.stringify(newNews[0], null, 2)}`);
    } else {
      logger.preview(`本次無新增新聞`);
    }
  } catch (err) {
    logger.error('寫入 HIS 檔失敗：' + err.message);
  }

  updateLastUpdated('fetch_jtm_ws_cb.js', newNews.length > 0);
})();
