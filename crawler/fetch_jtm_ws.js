// crawler/fetch_jtm_ws.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dayjs.extend(customParseFormat);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[爬蟲] fetch_jtm_ws 啟動');

const SOURCE_URL = 'https://r.jina.ai/https://jtm.com.mo/';
const OUTPUT_PATH = path.join(__dirname, '../data/fetch_jtm_ws.json');
const MAX_NEWS = 15;

function extractFromMarkdown(markdown) {
  const results = [];

  // 用正則擷取格式：[title --- date](link)
  const regex = /\[(.+?)\s+-+\s+(\d{1,2} \w{3}, \d{4})\]\((https?:\/\/[^\s)]+)\)/g;

  let match;
  while ((match = regex.exec(markdown)) !== null && results.length < MAX_NEWS) {
    const [, rawTitle, rawDate, link] = match;

    const date = dayjs(rawDate, 'D MMM, YYYY').format('YYYY-MM-DD');

    results.push({
      title: rawTitle.trim(),
      link,
      date
    });
  }

  return results;
}

(async () => {
  try {
    const res = await axios.get(SOURCE_URL);
    const markdown = res.data;

    const newsList = extractFromMarkdown(markdown);

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newsList, null, 2), 'utf-8');

    console.log(`[完成] 抓取 ${newsList.length} 則新聞`);
    console.log('[預覽] 第 1 則：', newsList[0]);
  } catch (err) {
    console.error('[錯誤] 無法抓取：', err.message);
  }
})();