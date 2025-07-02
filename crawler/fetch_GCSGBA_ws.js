// fetch_gcshq_ws.js
// 資料來源：https://markdown.new/https://www.gcs.gov.mo/list/zh-hant/topics/粵港澳大灣區?0

import fetch from 'node-fetch';
import fs from 'fs';
import dayjs from 'dayjs';

console.log("[爬蟲] fetch_gcsgba_ws 啟動");

const url = "https://markdown.new/https://www.gcs.gov.mo/list/zh-hant/topics/%E7%B2%B5%E6%B8%AF%E6%BE%B3%E5%A4%A7%E7%81%A3%E5%8D%80?0";

try {
  const res = await fetch(url);
  const text = await res.text();

  const blockMatch = text.match(/粵港澳大灣區\n=+\n([\s\S]+?)\[\+ 更多\]/);
  if (!blockMatch) {
    console.error("❌ 無法擷取區塊內容");
    process.exit(1);
  }

  const block = blockMatch[1];

  const regex = /\[([^\]]+?)\]\((https:\/\/www\.gcs\.gov\.mo\/detail\/zh-hant\/[^\)]+?)\)\n\n\* \* \*\n\n\[\]\([^\)]+\)\n\n\[##### (.+?) ([^\s]+?) ([^\]]+?)\]/g;

  const results = [];
  let match;
  while ((match = regex.exec(block)) !== null) {
    const [_, fullText, url, confirmTitle, source, dateText] = match;

    const title = confirmTitle.trim();
    const abstract = fullText.replace(title, '').trim();
    const date = parseRelativeDate(dateText.trim());

    results.push({
      title,
      abstract,
      date,
      url
    });
  }

  console.log(`✅ 共擷取 ${results.length} 則新聞`);
  const outPath = './data/fetch_gcsgba_ws.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`💾 已儲存至 ${outPath}`);

} catch (err) {
  console.error("❌ 錯誤:", err.message);
}

// 將「4天前」、「1天前」轉為 YYYY-MM-DD
function parseRelativeDate(text) {
  const now = dayjs();
  const match = text.match(/(\d+)天前/);
  if (match) {
    const days = parseInt(match[1], 10);
    return now.subtract(days, 'day').format('YYYY-MM-DD');
  } else {
    return now.format('YYYY-MM-DD'); // fallback today
  }
}
