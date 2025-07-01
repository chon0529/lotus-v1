// fetch_tdm_ws_jina.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dayjs from 'dayjs';

console.log('[爬蟲] fetch_tdm_ws_jina 啟動');

const url = 'https://r.jina.ai/https://www.tdm.com.mo/zh-hant/news-list?type=image&category=all&page=1&date=' + dayjs().format('YYYY-MM-DD');

try {
  const res = await fetch(url);
  const text = await res.text();

  const lines = text.split('\n');
  const newsList = [];

  let currentDate = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 處理大圖新聞
    if (line.startsWith('[![') && line.includes('-----------')) {
      const match = line.match(/\]\(([^\s]+)[^\)]*\)\s*(.+?)\s*-+\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
      if (match) {
        const linkMatch = line.match(/\]\((https?:[^\s]+)\)/);
        if (linkMatch) {
          newsList.push({
            title: match[2].trim(),
            link: linkMatch[1],
            date: match[3]
          });
        }
      }
      continue;
    }

    // 處理小圖新聞
    if (line.startsWith('*') && line.includes('####')) {
      const match = line.match(/####\s*(.+?)\s+(\d{4}-\d{2}-\d{2})/);
      const linkMatch = line.match(/\]\((https?:[^\s]+)\)/);
      if (match && linkMatch) {
        newsList.push({
          title: match[1].trim(),
          link: linkMatch[1],
          date: match[2]
        });
      }
    }
  }

  if (newsList.length === 0) {
    console.warn('[警告] 未擷取到任何新聞');
  } else {
    console.log(`[完成] 共儲存 ${newsList.length} 則新聞`);
    console.log(`[預覽] 第 1 則：${newsList[0].title}`);
    fs.writeFileSync(
      path.join('./data', 'fetch_tdm_ws_jina.json'),
      JSON.stringify(newsList, null, 2),
      'utf-8'
    );
  }
} catch (err) {
  console.error('[錯誤] 擷取過程發生例外：', err.message);
}
