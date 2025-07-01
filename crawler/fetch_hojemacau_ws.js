// fetch_hojemacau_ws.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import dayjs from 'dayjs';

const urls = [
  { url: 'https://hojemacau.com.mo/seccao/sociedade/', label: 'Sociedade' },
  { url: 'https://hojemacau.com.mo/seccao/politica/', label: 'Política' }
];

const results = [];

console.log('[爬蟲] fetch_hojemacau_ws 啟動');

for (const { url, label } of urls) {
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const newsList = [];

    $('article[id^="post-"]').each((_, el) => {
      const element = $(el);

      // 嘗試從多種來源獲得連結
      const link =
        element.find('header h2 a').attr('href') ||
        element.find('a.post-thumbnail').attr('href') ||
        element.find('> a').attr('href');

      if (!link) return;

      // 嘗試從多種來源獲得標題
      const rawTitle =
        element.find('header h2 a').text().trim() ||
        element.find('> a').attr('title')?.trim() ||
        element.find('header .aut_name a').text().trim();

      if (!rawTitle) return;

      const title = `(${label}) ${rawTitle}`;

      // 日期抓取
      const dateText = element.find('footer i').text().trim();
      let date = '';
      const parsedDate = dayjs(dateText, 'YYYY-MM-DD');
      if (parsedDate.isValid()) {
        date = parsedDate.format('YYYY-MM-DD');
      } else {
        // 嘗試用自然語言時間解析
        const maybeDate = dayjs(dateText);
        date = maybeDate.isValid() ? maybeDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      }

      newsList.push({ title, link, date });
    });

    console.log(`[資訊] ${label} 抓取完成，共 ${newsList.length} 則新聞`);
    results.push(...newsList);
  } catch (error) {
    console.warn(`[錯誤] 抓取 ${label} 時發生錯誤：`, error.message);
  }
}

// 排序
results.sort((a, b) => (a.date < b.date ? 1 : -1));

// 輸出
const outputPath = './data/fetch_hojemacau_ws.json';
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

if (results.length === 0) {
  console.warn('[警告] 未擷取到任何新聞，請檢查來源與選擇器。');
} else {
  console.log(`[完成] 共儲存 ${results.length} 則新聞 → ${outputPath}`);
}
