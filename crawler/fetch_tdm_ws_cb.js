// fetch_tdm_ws_cb.js (Puppeteer 版) - Lotus 1
import puppeteer from 'puppeteer';
import fs from 'fs';
import dayjs from 'dayjs';
import { logInfo, logSuccess, logError, logPreview } from './modules/logger.js';
import { saveHistoryAndUpdateLast, saveToHisAll, updateLastAddedAll } from './modules/historyManager.js';

const SCRIPT = 'fetch_tdm_ws_cb.js';
const OUTPUT = './data/fetch_tdm_ws_cb.json';
const HISTORY = './data/his_fetch_tdm.json';
const HIS_ALL = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS = 30;

const today = dayjs().format('YYYY-MM-DD');
const URL = `https://www.tdm.com.mo/zh-hant/news-list?type=image&category=all&page=1&date=${today}`;

(async () => {
  logInfo(SCRIPT, '啟動 TDM 新聞抓取');

  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 0 });

    // 可存 HTML 供 debug
    const html = await page.content();
    fs.writeFileSync('./data/tdm_debug.html', html, 'utf-8');

    // 1. 大圖（第一則）
    const bigPicNews = await page.evaluate(() => {
      const node = document.querySelector('div.container.mt-lg-4.mt-5.mb-5.d-flex.flex-wrap > a.content_item');
      if (!node) return null;
      const title = node.querySelector('h2')?.innerText.trim() || '';
      const link = node.getAttribute('href')?.startsWith('http') ? node.getAttribute('href') : `https://www.tdm.com.mo${node.getAttribute('href')}`;
      const pubDateRaw = node.querySelector('.date')?.innerText.trim() || '';
      return { title, link, pubDate: pubDateRaw };
    });

    // 2. 小圖/小格新聞
    const smallNews = await page.evaluate(() => {
      const newsArr = [];
      // 所有小圖 news 的 li（排除廣告）
      document.querySelectorAll('div.b-overlay-wrap ul > li').forEach(li => {
        if (li.querySelector('a.content_item')) {
          const a = li.querySelector('a.content_item');
          const title = a.querySelector('h4')?.innerText.trim() || '';
          const link = a.getAttribute('href')?.startsWith('http') ? a.getAttribute('href') : `https://www.tdm.com.mo${a.getAttribute('href')}`;
          const pubDateRaw = a.querySelector('.date')?.innerText.trim() || '';
          newsArr.push({ title, link, pubDate: pubDateRaw });
        }
      });
      return newsArr;
    });

    // 整理、合併、去重
    let allNews = [];
    if (bigPicNews && bigPicNews.title && bigPicNews.link) allNews.push(bigPicNews);
    if (Array.isArray(smallNews)) allNews = allNews.concat(smallNews);

    // 去重（以 title+date）
    const uniq = new Set();
    const result = [];
    for (const n of allNews) {
      const key = n.title + '|' + n.pubDate;
      if (!uniq.has(key) && n.title && n.link) {
        result.push({
          title: n.title,
          link: n.link,
          pubDate: n.pubDate,
        });
        uniq.add(key);
      }
      if (result.length >= MAX_NEWS) break;
    }

    // 寫入 JSON
    fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${result.length} 則新聞已存至 ${OUTPUT}`);

    // 歷史及 last_updated 等，全部用標準機制
    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      result, 'tdm_ws_cb', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) await saveToHisAll(newItems, 'tdm_ws_cb', HIS_ALL);
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);

    await updateLastAddedAll('tdm_ws_cb', LASTUPDATED);
    logPreview(SCRIPT, result[0] || '無法顯示新聞');

    await browser.close();
  } catch (err) {
    logError(SCRIPT, `發生錯誤：${err.message}`);
    if (browser) await browser.close();
  }
})();