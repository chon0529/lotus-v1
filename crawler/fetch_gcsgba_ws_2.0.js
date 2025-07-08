// fetch_gcsgba_ws_2.0.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { logInfo, logSuccess, logError } from './modules/logger.js';

const SCRIPT = 'fetch_gcsgba_ws_2.0.js';   // ★ 正確名稱

logInfo(SCRIPT, '啟動');

const URL = 'https://www.gcs.gov.mo/news/list/zh-hant/topics/%E7%B2%B5%E6%B8%AF%E6%BE%B3%E5%A4%A7%E7%81%A3%E5%8D%80';

try {
  const res = await fetch(URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  const newsList = [];

  $('.infiniteItem').each((_, el) => {
    const $el = $(el);

    const title = $el.find('.subject .txt').text().trim();
    const author = $el.find('.dept').text().trim();
    const abstract = $el.find('.baseSize').text().trim();
    const date = $el.find('time').attr('datetime')?.split('T')[0] || '';
    const rawHref = $el.find('a.baseInfo').attr('href') || '';
    const idMatch = rawHref.match(/detail\/zh-hant\/([^?]+)/);
    const address = idMatch ? `https://www.gcs.gov.mo/detail/zh-hant/${idMatch[1]}` : '';

    if (title && address) {
      newsList.push({ title, author, abstract, date, address });
    }
  });

  fs.writeFileSync('./data/fetch_gcsgba_ws_2.0.json', JSON.stringify(newsList, null, 2), 'utf-8');
  logSuccess(SCRIPT, `共抓取 ${newsList.length} 則新聞，已儲存至 fetch_gcsgba_ws_2.0.json`);
} catch (error) {
  logError(SCRIPT, `抓取或解析失敗：${error.message}`);
}