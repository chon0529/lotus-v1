// crawler/rss.js
import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 取得 __dirname (ES module 下沒內建)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
 headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*;q=0.01'
  }
});

const FEED_URL = 'https://govinfohub.gcs.gov.mo/api/rss/n/zh-hant';
const OUTPUT_FILE = path.join(__dirname, '../data/column1.json');

export async function fetchRss() {
  try {
    const feed = await parser.parseURL(FEED_URL);
    const items = feed.items.slice(0, 10).map(entry => ({
      title: entry.title,
      link: entry.link,
      time: new Date(entry.isoDate || entry.pubDate).toISOString().replace('T', ' ').slice(0, 16)
    }));
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2), 'utf-8');
    console.log(`[RSS] 已更新 column1.json，共 ${items.length} 則新聞`);
  } catch (err) {
    console.error('[RSS] 更新失敗：', err.message);
  }
}

// 直接執行時立即跑一次
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === `file://${process.argv[1]}.js`) {
  fetchRss();
}
