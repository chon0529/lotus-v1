// fetch_al_ws_cb.js - Lotus v1.0.0-0711（立法會書面質詢合併制）
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import dayjs from 'dayjs';
import {
  logInfo, logSuccess, logError, logPreview
} from './modules/logger.js';
import {
  saveHistoryAndUpdateLast,
  saveToHisAll,
  updateLastAddedAll
} from './modules/historyManager.js';

const SCRIPT = 'fetch_al_ws_cb.js';
const URL = 'https://www.al.gov.mo/zh/written-consultation';
const OUTPUT = './data/fetch_al_ws.json';
const HISTORY = './data/his_fetch_al.json';
const HIS_ALL = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS = 40;
const AUTO_REFRESH_MIN = 60;

// 主流程
(async () => {
  logInfo(SCRIPT, '啟動抓取澳門立法會書面質詢');

  let news = [];
  try {
    const res = await fetch(URL, { timeout: 20000 });
    const html = await res.text();
    const $ = cheerio.load(html);

    // 只處理 tbody > tr
    $('#page-wrapper > div:nth-child(3) > div > div > table > tbody > tr').each((_, tr) => {
      const tds = $(tr).find('td');
      if (tds.length < 7) return; // 不符結構直接略過

      const date = tds.eq(0).text().trim();
      const name = tds.eq(1).text().trim().replace(/\s+/g, '');
      const summary = tds.eq(2).text().trim();
      const category = tds.eq(3).text().trim();
      const number = tds.eq(4).text().trim();
      const advisoryTd = tds.eq(5);
      const replyTd = tds.eq(6);

      // 抓 advisory PDF
      const advisoryA = advisoryTd.find('a[href$=".pdf"]');
      const advisoryHref = advisoryA.attr('href');
      const advisoryUrl = advisoryHref ? 'https://www.al.gov.mo' + advisoryHref : '';

      // 抓 reply PDF
      const replyA = replyTd.find('a[href$=".pdf"]');
      const replyHref = replyA.attr('href');
      const replyUrl = replyHref ? 'https://www.al.gov.mo' + replyHref : '';

      // 判斷狀態與 title
      let title;
      if (advisoryUrl && !replyUrl) {
        title = `(${category})${name}提出${summary}（${number}） - [沒有回覆]`;
      } else if (advisoryUrl && replyUrl) {
        title = `(${category})${name}提出${summary}（${number}） - [回覆]`;
      } else {
        return; // 非標準結構，不處理
      }

      news.push({
        title,
        link: advisoryUrl,
        reply: replyUrl || '',
        pubDate: date
      });
    });

    // 按日期排序（新到舊），取前 40 則
    news.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
    news = news.slice(0, MAX_NEWS);

    // 輸出主檔
    fs.writeFileSync(OUTPUT, JSON.stringify(news, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${news.length} 則新聞已存至 ${OUTPUT}`);
  } catch (err) {
    logError(SCRIPT, `抓取或解析失敗：${err.message}`);
    news = [];
  }

  // 歷史與 last_updated.json
  const { newCount, newItems } = await saveHistoryAndUpdateLast(
    news, 'al_ws', HISTORY, LASTUPDATED, 'scheduled'
  );
  if (newCount > 0) await saveToHisAll(newItems, 'al_ws', HIS_ALL);
  logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);

  // last_updated.json 寫入完整結構
  try {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    let data = {};
    if (fs.existsSync(LASTUPDATED)) {
      data = JSON.parse(fs.readFileSync(LASTUPDATED, 'utf-8'));
    }
    data['al_ws'] = {
      fetch: 'al_ws',
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

  // 同步 lastAddedAll
  await updateLastAddedAll('al_ws', LASTUPDATED);

  // 預覽
  logPreview(SCRIPT, news[0] || '無法顯示新聞');
})();