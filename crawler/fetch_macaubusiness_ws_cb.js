// fetch_macaubusiness_ws_cb.js － Lotus v1.0.0-0710
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import dayjs from 'dayjs';
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

const SCRIPT = 'fetch_macaubusiness_ws_cb.js';
const OUTPUT = './data/fetch_macaubusiness_ws_cb.json';
const HISTORY = './data/his_fetch_macaubusiness_ws_cb.json';
const HIS_ALL = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS = 22;
const url = 'https://www.macaubusiness.com/category/mna/mna-macau/';

logInfo(SCRIPT, '啟動 Macao Business 新聞抓取');

(async () => {
  let articles = [];
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    const html = await page.content();
    const $ = cheerio.load(html);

    $('div.td_module_10, div.td_module_16, div.td_module_1, div.td-block-span6').each((i, el) => {
      if (articles.length >= MAX_NEWS) return;
      const link = $(el).find('.td-module-thumb a').attr('href');
      const rawDate = $(el).find('time').attr('datetime') || $(el).find('time').text();

      if (!link) return;

      // 從網址推斷標題
      const slug = link.split('/').filter(s => s).pop();
      const title = slug
        .split('-')
        .map(word => {
          if (['of', 'the', 'and', 'to', 'in', 'a', 'for'].includes(word)) return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

      const date = rawDate
        ? dayjs(rawDate).isValid()
          ? dayjs(rawDate).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD');

      articles.push({ title, link, pubDate: date });
    });

    await browser.close();
    // 排序（新到舊）
    articles = articles.slice(0, MAX_NEWS);

    // 寫入主檔
    fs.writeFileSync(OUTPUT, JSON.stringify(articles, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${articles.length} 則新聞已存至 ${OUTPUT}`);

    // 歷史/last_updated 處理
    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      articles, 'macaubusiness_ws', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) await saveToHisAll(newItems, 'macaubusiness_ws', HIS_ALL);
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);

    // 更新 last_updated.json 結構
    try {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      let data = {};
      if (fs.existsSync(LASTUPDATED)) {
        data = JSON.parse(fs.readFileSync(LASTUPDATED, 'utf-8'));
      }
      data['macaubusiness_ws'] = {
        fetch: 'macaubusiness_ws',
        lastRun: now,
        lastSuccess: now,
        lastAdded: now,
        lastOperation: 'scheduled',
        lastManual: null
      };
      fs.writeFileSync(LASTUPDATED, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      logError(SCRIPT, `更新 last_updated.json 失敗: ${err.message}`);
    }
   // await updateLastAddedAll('macaubusiness_ws', LASTUPDATED);

    // 預覽
    logPreview(SCRIPT, articles[0] || '無法顯示新聞');
  } catch (err) {
    logError(SCRIPT, '抓取失敗: ' + err.message);
  }
})();