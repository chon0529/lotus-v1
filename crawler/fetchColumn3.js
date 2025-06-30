// fetchColumn3.js
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = 'https://r.jina.ai/https://www.gcs.gov.mo/news/list/zh-hant/topics/%E7%B2%B5%E6%B8%AF%E6%BE%B3%E5%A4%A7%E7%81%A3%E5%8D%80?0';
const outputPath = path.join(__dirname, '../data/column3.json');

async function fetchColumn3() {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html'
      }
    });
    const text = await res.text();
    const lines = text.split('\n');

    const news = [];

    for (let line of lines) {
      if (news.length >= 10) break;

      if (line.includes('Image') && line.includes('https://www.gcs.gov.mo/news/detail/')) {
        // 擷取標題：從冒號 : 開始，到第一個「。或]」
        let rawTitle = '';
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const afterColon = line.slice(colonIndex + 1);
          const endIndex = Math.min(
            ...['。', ']'].map(s => afterColon.indexOf(s)).filter(i => i !== -1)
          );
          rawTitle = endIndex !== Infinity ? afterColon.slice(0, endIndex) : afterColon;
        }

        const cleanTitle = rawTitle.trim();

        // 擷取連結
        const linkMatch = line.match(/\((https:\/\/www\.gcs\.gov\.mo\/news\/detail\/zh-hant\/[^)\s]+)\)/);
        const link = linkMatch ? linkMatch[1].split(';')[0] : null;

        if (cleanTitle && link) {
          news.push({
            title: cleanTitle,
            link,
            pubDate: new Date().toISOString()
          });
        }
      }
    }

    fs.writeFileSync(outputPath, JSON.stringify(news, null, 2), 'utf-8');
    console.log(`[爬蟲] 欄3 已更新，共 ${news.length} 則新聞`);
  } catch (error) {
    console.error('[爬蟲][欄3] 錯誤:', error.message);
  }
}

fetchColumn3();
