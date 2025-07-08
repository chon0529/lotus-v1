import fs from 'fs';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import {
  logInfo,
  logSuccess,
  logError,
  logPreview
} from './modules/logger.js';

const URL = 'https://r.jina.ai/https://www.cpu.gov.mo/zh/news/press-release';
const SAVE_PATH = './data/fetch_cpu_ws.json';
const FIXED_ADDRESS = 'https://www.cpu.gov.mo/zh/news/press-release';

logInfo('fetch_cpu_ws', '啟動');

try {
  const res = await fetch(URL);
  const html = await res.text();

  const $ = cheerio.load(html);
  const rawText = $('body').text().trim().replace(/\s+/g, ' ');
  const regex = /(\d{4}-\d{2}-\d{2}) (.+?) 上載日期 (\d{4}-\d{2}-\d{2})/g;

  const results = [];
  let match;
  while ((match = regex.exec(rawText)) !== null) {
    const [, date, title] = match;
    results.push({
      title: title.trim(),
      date: date.trim(),
      address: FIXED_ADDRESS
    });
  }

  fs.writeFileSync(SAVE_PATH, JSON.stringify(results, null, 2), 'utf-8');
  logSuccess('fetch_cpu_ws', `共擷取 ${results.length} 則新聞，儲存至 ${SAVE_PATH}`);
} catch (err) {
  logError('fetch_cpu_ws', err.message);
}