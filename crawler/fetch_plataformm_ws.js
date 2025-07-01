// crawler/fetch_plataformm_ws.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dayjs from 'dayjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[爬蟲] fetch_plataformm_ws 啟動');

const PAGES = [
  'https://r.jina.ai/https://www.plataformamedia.com/zh-hant/seccao/%e6%be%b3%e9%96%80/',
  'https://r.jina.ai/https://www.plataformamedia.com/zh-hant/seccao/%e6%be%b3%e9%96%80/page/2/'
];

const MAX_NEWS = 10;

function extractDate(text) {
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? dayjs(match[0]).format('YYYY-MM-DD') : '';
}

function extractNewsFromMarkdown(markdown) {
  const results = [];

  // 🔍 找出澳門段落
  const sectionStart = markdown.indexOf('澳門\n==');
  if (sectionStart === -1) return results;

  const newsSection = markdown.substring(sectionStart);
  const newsEnd = newsSection.indexOf('### 即時報導');
  const sectionContent = newsEnd !== -1 ? newsSection.substring(0, newsEnd) : newsSection;

  const lines = sectionContent.split('\n').map(l => l.trim()).filter(Boolean);

  let i = 0;
  let bigNewsAdded = false;

  // ✅ 使用最早成功邏輯抓大圖新聞
  while (i < lines.length && !bigNewsAdded) {
    if (lines[i].startsWith('[![') && i + 2 < lines.length && lines[i + 1].startsWith('[')) {
      const titleLine = lines[i + 1];
      const linkMatch = titleLine.match(/\((https?:\/\/[^\s)]+)\)/);
      const titleMatch = titleLine.match(/\[(.*?)\]/);
      const dateLine = lines[i + 3] || '';

      if (linkMatch && titleMatch) {
        results.push({
          title: titleMatch[1].trim(),
          link: linkMatch[1],
          date: extractDate(dateLine)
        });
        bigNewsAdded = true;
      }
      break;
    }
    i++;
  }

  // ✅ 抓小圖新聞（正則處理）
  const smallNewsRegex = /\*\s+\[\]\((https?:\/\/[^\s]+)\s+"(.*?)"\)\s+\[.*?\]\(\1\)[\s\S]+?by\s+\[.*?\]\(.*?\)(\d{4}-\d{2}-\d{2})/g;
  let match;
  while ((match = smallNewsRegex.exec(sectionContent)) !== null) {
    const [, link, title, date] = match;
    results.push({
      title: title.trim(),
      link: link.trim(),
      date: dayjs(date).format('YYYY-MM-DD')
    });
  }

  return results;
}

(async () => {
  try {
    let allResults = [];

    for (const url of PAGES) {
      const res = await axios.get(url);
      const markdown = res.data;
      const news = extractNewsFromMarkdown(markdown);

      allResults = allResults.concat(news);
      if (allResults.length >= MAX_NEWS) break;
    }

    const finalResults = allResults
      .filter(n => n.title && n.link && n.date)
      .slice(0, MAX_NEWS); // ❗保留原始順序，不排序

    const outputPath = path.join(__dirname, '../data/fetch_plataformm_ws.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalResults, null, 2), 'utf-8');

    console.log(`[完成] 共儲存 ${finalResults.length} 則新聞`);
    console.log('[預覽] 第 1 則：', finalResults[0]);
  } catch (err) {
    console.error('[錯誤] 抓取失敗：', err.message);
  }
})();