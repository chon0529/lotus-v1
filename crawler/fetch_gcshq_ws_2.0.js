// fetch_gcshq_ws_2.0.js
// 爬蟲：抓取 GCS 橫琴粵澳深度合作區新聞（不依賴 markdown.new）

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import dayjs from 'dayjs';
import { logStart, logSuccess, logError } from './logger.js';

// 啟動提示
logStart('fetch_gcshq_ws_2.0');

// 設定 URL 與儲存路徑
const url = 'https://www.gcs.gov.mo/list/zh-hant/topics/%E6%A9%AB%E7%90%B4%E7%B2%B5%E6%BE%B3%E6%B7%B1%E5%BA%A6%E5%90%88%E4%BD%9C%E5%8D%80';
const outputPath = './data/fetch_gcshq_ws.json';

try {
  // 發送請求（避免自動重導造成 jsessionid 問題）
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow'
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const newsList = [];

  $('tr.infiniteItem').each((_, el) => {
    const title = $(el).find('.subject .txt').text().trim();
    const author = $(el).find('.dept').text().trim();
    const dateRaw = $(el).find('time').attr('datetime');
    const abstract = $(el).find('.baseSize').text().trim();
    const href = $(el).find('a.baseInfo').attr('href');

    if (title && dateRaw && href) {
      newsList.push({
        title,
        author,
        abstract,
        date: dayjs(dateRaw).format('YYYY-MM-DD'),
        address: 'https://www.gcs.gov.mo' + href.replace('..', '')
      });
    }
  });

  // 儲存 JSON
  fs.writeFileSync(outputPath, JSON.stringify(newsList, null, 2), 'utf-8');
  logSuccess(`共擷取 ${newsList.length} 則新聞，已儲存至 ${outputPath}`);
} catch (err) {
  logError('抓取或解析失敗：' + err.message);
}