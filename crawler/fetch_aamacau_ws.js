// crawler/fetch_aamacau_ws.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const url = 'https://r.jina.ai/https://aamacau.com/topics/breakingnews/';
const OUTPUT_PATH = path.resolve('data/fetch_aamacau_ws.json');

function convertDate(raw) {
  const match = raw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function fetchAAMacau() {
  console.log('[爬蟲] fetch_aamacau_ws 啟動');

  try {
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.split('\n');

    const items = [];

    for (let i = 0; i < lines.length - 2; i++) {
      const imageLine = lines[i].trim();
      const emptyLine = lines[i + 1].trim();
      const infoLine = lines[i + 2].trim();

      // 確保是圖片行 + 空行 + 內容行
      if (
        imageLine.startsWith('[![') &&
        emptyLine === '' &&
        infoLine.startsWith('[') &&
        infoLine.includes('年') &&
        infoLine.includes('｜文：')
      ) {
        // 擷取標題與網址
        const titleMatch = infoLine.match(/\[(.+?)\]\((https:\/\/aamacau\.com\/\?p=\d+).+?\)/);
        const dateMatch = infoLine.match(/(\d{4}年\d{1,2}月\d{1,2}日)/);

        if (titleMatch && dateMatch) {
          const title = titleMatch[1];
          const link = titleMatch[2];
          const pubDate = convertDate(dateMatch[1]);

          items.push({ title, link, pubDate });
        }
      }

      if (items.length >= 10) break;
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(items, null, 2), 'utf8');
    console.log(`[爬蟲] fetch_aamacau_ws 抓取完成，共 ${items.length} 則`);
  } catch (err) {
    console.error('[爬蟲] fetch_aamacau_ws 錯誤:', err.message);
  }
}

fetchAAMacau();
