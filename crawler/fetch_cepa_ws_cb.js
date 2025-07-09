// crawler/fetch_cepa_ws_cb.js - Lotus v1.0.1-0710 (CB規範)
import fs from 'fs';
import puppeteer from 'puppeteer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { logInfo, logSuccess, logError, logPreview } from './modules/logger.js';
import { saveHistoryAndUpdateLast, saveToHisAll, updateLastAddedAll } from './modules/historyManager.js';

// 強制設置時區
process.env.TZ = 'Asia/Macau';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Macau');

const SCRIPT      = 'fetch_cepa_ws_cb.js';
const OUTPUT      = './data/fetch_cepa_ws_cb.json';
const HISTORY     = './data/his_fetch_cepa_ws_cb.json';
const HIS_ALL     = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS    = 20;
const URL         = 'https://www.gov.mo/zh-hant/global-search/?q=CEPA';

(async () => {
  logInfo(SCRIPT, '啟動 CEPA 搜尋新聞抓取');
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('ul.list-search-results > li', { timeout: 15000 });

    // 抓取初步資料（注意：不在 browser context 使用 dayjs）
    const news = await page.$$eval('ul.list-search-results > li', (nodes) =>
      nodes.slice(0, 20).map(li => {
        const titleA = li.querySelector('a.text-medium.text-lg.text-primary');
        const title = titleA ? titleA.innerText.replace(/\s+/g, ' ').trim() : '';
        const link = titleA ? titleA.href : '';

        const paragraphs = li.querySelectorAll('p');
        let abstract = '';
        if (paragraphs.length > 1) {
          abstract = paragraphs[1].innerText.trim().replace(/\s+/g, ' ');
        }

        const dateSpan = li.querySelector('div.meta-data > p > span');
        let rawDate = dateSpan ? dateSpan.innerText.replace('發布日期：', '').trim() : '';

        return { title, link, abstract, rawDate }; // 不格式化日期，僅回傳
      })
    );

    await browser.close();

    // 回到 Node 環境處理日期
    const results = news
      .map(item => {
        let pubDate = '';
        if (/^\d{4}-\d{2}-\d{2}/.test(item.rawDate)) {
          pubDate = dayjs(item.rawDate).format('YYYY-MM-DD');
        } else if (item.rawDate) {
          pubDate = dayjs(item.rawDate, 'YYYY-MM-DD').isValid()
            ? dayjs(item.rawDate, 'YYYY-MM-DD').format('YYYY-MM-DD')
            : item.rawDate;
        }
        return {
          title: item.title,
          link: item.link,
          abstract: item.abstract,
          pubDate
        };
      })
      .filter(i => i.title && i.link && i.pubDate); // 過濾不完整項目

    fs.writeFileSync(OUTPUT, JSON.stringify(results, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${results.length} 則新聞已存至 ${OUTPUT}`);

    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      results, 'cepa', HISTORY, LASTUPDATED, 'scheduled'
    );

    if (newCount > 0) {
      await saveToHisAll(newItems, 'cepa', HIS_ALL);
      await updateLastAddedAll(['cepa'], LASTUPDATED);  // ✅ 包成陣列
    }

    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);
    logPreview(SCRIPT, results[0] || '無法顯示新聞');

  } catch (err) {
    if (browser) await browser.close();
    logError(SCRIPT, err.message);
  }
})();