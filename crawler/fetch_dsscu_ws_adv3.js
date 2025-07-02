// fetch_dsscu_ws_adv3.js
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import dayjs from 'dayjs';

// 設定常數
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '../data/fetch_dsscu_ws_adv3.json');
const ADD_JSON_PATH = path.join(__dirname, '../data/dsscu_ws_add.json');

// Google API 設定
const GOOGLE_API_KEY = 'AIzaSyBVCYJ4R41gYnCVhaWg6HsDHMZ-aCJRPXk';
const GOOGLE_CX = 'f4b3bee7cebef473e';

// Serper API 備用
const SERPER_API_KEY = '0b1d91d95814db67ac4dabce1f0b376e3cbc06bd';

// 主程式開始
console.log('[爬蟲] fetch_dsscu_ws_adv3 啟動');

// 讀取 ADD_JSON
let addJson = {};
if (fs.existsSync(ADD_JSON_PATH)) {
  try {
    const data = fs.readFileSync(ADD_JSON_PATH, 'utf-8');
    addJson = JSON.parse(data);
  } catch {
    addJson = {};
  }
}

// 擷取原始新聞資料
const url = 'https://r.jina.ai/https://www.dsscu.gov.mo/zh/latestnews/newslist?page=1&termSlug=news';
const response = await fetch(url);
const raw = await response.text();

const blockMatch = raw.match(/\u65b0\u805e\u53ca\u6d88\u606f\n=+\n([\s\S]+?)(?=\*\s*1\s*\*\s*2)/);
if (!blockMatch) {
  console.error('❌ 無法定位新聞區塊');
  process.exit(1);
}
const content = blockMatch[1];

const regex = /上載日期:(\d{4}-\d{2}-\d{2})\s+(.+?)(?=\d{4}-\d{2}-\d{2}|$)/gs;

const newsList = [];
let match;

while ((match = regex.exec(content)) !== null) {
  const date = match[1].trim();
  const rawTitle = match[2].trim();
  const cleanTitle = rawTitle.split(/\*\s*1/)[0]
                             .split(/語言選擇/)[0]
                             .split(/!\[Image/)[0]
                             .replace(/[\n\*]+$/g, '')
                             .trim();
  newsList.push({ title: cleanTitle, date });
}

console.log(`✅ 共擷取 ${newsList.length} 則新聞，開始搜尋連結`);

// 查詢網址
const finalList = [];

for (const item of newsList) {
  const title = item.title;
  const date = item.date;
  let url = '';
  let source = '';

  // Step 1: 先查 ADD JSON
  if (addJson[title]) {
    url = addJson[title];
    source = 'ADD_JSON';
  } else {
    // Step 2: GOOGLE API 查詢
    try {
      const customsearch = google.customsearch('v1');
      const res = await customsearch.cse.list({
        auth: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q: title,
      });
      const items = res.data.items || [];
      const found = items.find(it => it.link.includes('gov.mo'));
      if (found) {
        url = found.link;
        source = 'GOOGLE';
      }
    } catch {}

    // Step 3: Serper API
    if (!url) {
      try {
        const res = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: title })
        });
        const data = await res.json();
        const found = data?.organic?.find(i => i.link.includes('gov.mo'));
        if (found) {
          url = found.link;
          source = 'SERPER';
        }
      } catch {}
    }

    // Step 4: 預設
    if (!url) {
      url = 'https://www.dsscu.gov.mo/zh/latestnews/newslist/?page=1&termSlug=news';
      source = 'DEFAULT';
    }

    // 儲存到 ADD_JSON
    addJson[title] = url;
  }

  console.log(`[${title}] [${date}] [${source}]`);
  finalList.push({ title, date, url });
}

// 儲存兩個檔案
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalList, null, 2), 'utf-8');
fs.writeFileSync(ADD_JSON_PATH, JSON.stringify(addJson, null, 2), 'utf-8');

console.log(`💾 已儲存至 ${OUTPUT_PATH}`);
console.log(`📁 已更新補充資料至 ${ADD_JSON_PATH}`);
