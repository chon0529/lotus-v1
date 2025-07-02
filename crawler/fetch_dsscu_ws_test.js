// fetch_dsscu_ws_test.js
// 測試：從 DSSCU Jina.ai 頁面提取新聞標題與日期

import fetch from 'node-fetch';
import dayjs from 'dayjs';

console.log('[測試] fetch_dsscu_ws_test 啟動');

const url = 'https://r.jina.ai/https://www.dsscu.gov.mo/zh/latestnews/newslist?page=1&termSlug=news';

try {
  const res = await fetch(url);
  const text = await res.text();

  // 擷取 "新聞及消息" 區塊之間的內容，並避免匹配過頭至頁尾
  const contentMatch = text.match(/\u65b0\u805e\u53ca\u6d88\u606f\n=+\n([\s\S]+?)(?=\*\s*1\s*\*\s*2)/);

  if (!contentMatch) {
    console.error('❌ 無法定位新聞區塊');
    process.exit(1);
  }

  const content = contentMatch[1];

  const regex = /上載日期:(\d{4}-\d{2}-\d{2})\s+(.+?)(?=\d{4}-\d{2}-\d{2}|$)/gs;

  const results = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const date = match[1].trim();
    const rawTitle = match[2].trim();

    // 去除標題結尾潛在雜訊（如頁尾、語言選擇、圖片）
    const cleanTitle = rawTitle.split(/\*\s*1/)[0]
                               .split(/語言選擇/)[0]
                               .split(/!\[Image/)[0]
                               .replace(/[\n\*]+$/g, '')
                               .trim();

    results.push({ title: cleanTitle, date });
  }

  console.log('✅ 擷取結果：');
  console.log(results);

} catch (err) {
  console.error('❌ 錯誤:', err.message);
}
