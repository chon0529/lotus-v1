// fetch_gcshq_ws.js
// 擷取 GCS 粵港澳橫琴合作區新聞

import fs from 'fs';
import fetch from 'node-fetch';
import dayjs from 'dayjs';

console.log('🚀 fetch_gcshq_ws 啟動');

const url = 'https://markdown.new/https://www.gcs.gov.mo/list/zh-hant/topics/%E6%A9%AB%E7%90%B4%E7%B2%B5%E6%BE%B3%E6%B7%B1%E5%BA%A6%E5%90%88%E4%BD%9C%E5%8D%80?0';

try {
  const res = await fetch(url);
  const text = await res.text();

  const blockMatch = text.match(/橫琴粵澳深度合作區\n=+\n([\s\S]+?)\[\+ 更多]/);
  if (!blockMatch) throw new Error('❌ 找不到新聞區塊');

  const content = blockMatch[1];

  const regex = /\[([^\]]+?)\]\((https:\/\/www\.gcs\.gov\.mo\/detail\/[^\)]+?)\)[\s\S]+?\[#\#\#\#\# ([^\s]+) (.+?) ([^\s]+)\]\(.*?\)/g;

  const results = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const fullLine = match[1].trim();
    const link = match[2].trim();
    const title = match[3].trim();
    const author = match[4].trim();
    const relative = match[5].trim();

    const date = parseRelativeDate(relative);
    const abstract = fullLine
      .replace(title, '')
      .replace(author, '')
      .replace(relative, '')
      .trim();

    results.push({ title, author, abstract, date, url: link });
    console.log(`✅ ${title} | ${date} | ${author}`);
  }

  fs.writeFileSync('./data/fetch_gcshq_ws.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('💾 已儲存至 ./data/fetch_gcshq_ws.json');
} catch (err) {
  console.error('❌ 發生錯誤：', err.message);
}

function parseRelativeDate(text) {
  const today = dayjs();
  if (text.includes('天前')) {
    const n = parseInt(text);
    return today.subtract(n, 'day').format('YYYY-MM-DD');
  } else if (text.includes('周前')) {
    const n = parseInt(text);
    return today.subtract(n, 'week').format('YYYY-MM-DD');
  } else if (text.includes('月前')) {
    const n = parseInt(text);
    return today.subtract(n, 'month').format('YYYY-MM-DD');
  }
  return today.format('YYYY-MM-DD');
}
