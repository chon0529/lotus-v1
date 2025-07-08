// fetch_dsop_ws.js
// 來源：DSOP 交通事務局（via Jina.ai）
// 擷取新聞標題、摘要、日期、連結

import fetch from 'node-fetch';
import fs from 'fs';
import dayjs from 'dayjs';

console.log('[爬蟲] fetch_dsop_ws 啟動');

const url = 'https://r.jina.ai/https://www.dsop.gov.mo/newslist/';
const outputPath = './data/fetch_dsop_ws.json';
const hisPath = './data/his_fetch_dsop.json';

try {
  const res = await fetch(url);
  const text = await res.text();

  // 擷取 Markdown 中以 "*   DD\n\nMM-YYYY\n\n[title](url)\n\nabstract\n\n" 結構的內容
  const regex = /\*\s+(\d{2})\n\n(\d{2})-(\d{4})\n\n\[(.+?)\]\((https?:\/\/[^\s]+?)\)\n\n([\s\S]*?)(?=\n\*|$)/g;

  const results = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const day = match[1];
    const month = match[2];
    const year = match[3];
    const title = match[4].trim();
    const url = match[5].trim();
    const abstract = match[6].trim().replace(/\n+/g, ' ');
    const date = `${year}-${month}-${day}`;

    results.push({
      title,
      abstract,
      date,
      url
    });
  }

  // 寫入主檔
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`✅ 共擷取 ${results.length} 則新聞，已儲存至 ${outputPath}`);

  // ========== 寫入歷史檔（去重、只保留新資料於最前）=========
  let his = [];
  try {
    his = JSON.parse(fs.readFileSync(hisPath, 'utf-8').trim());
    if (!Array.isArray(his)) his = [];
  } catch { his = []; }

  const oldKeys = new Set(his.map(n => `${n.title}|${n.date}`));
  const toAdd = results.filter(n => !oldKeys.has(`${n.title}|${n.date}`));
  if (toAdd.length) {
    his = toAdd.concat(his).slice(0, 1000);
    fs.writeFileSync(hisPath, JSON.stringify(his, null, 2), 'utf-8');
    console.log(`🗂️  新增 ${toAdd.length} 條至歷史檔 ${hisPath}`);
  } else {
    console.log('🟡 沒有新增歷史新聞');
  }

} catch (err) {
  console.error('❌ 錯誤:', err.message);
}