// fetch_cbaoverall_ws_mix.js
import axios from 'axios';
import * as fs from 'fs';

console.log('[爬蟲] fetch_cbaoverall_ws_mix 啟動');

const sources = [
  {
    url: 'https://r.jina.ai/https://www.cnbayarea.org.cn/news/news1/index.html',
    label: '高層關注'
  },
  {
    url: 'https://r.jina.ai/https://www.cnbayarea.org.cn/news/focus/index.html',
    label: '最新動態'
  },
  {
    url: 'https://r.jina.ai/https://www.cnbayarea.org.cn/policy/policy%20release/policies/index.html',
    label: '最新政策'
  }
];

const news = [];

for (const { url, label } of sources) {
  try {
    const res = await axios.get(url);
    const html = res.data;

    let regex;
    if (label === '最新政策') {
      // URL3 結構（無開頭 *）
      regex = /#+\s*\[(.+?)\]\((https?:\/\/[^\s]+?)\s*\".*?\"\)[\s\S]*?\n\s*(\d{4}-\d{2}-\d{2})/g;
    } else {
      // URL1 和 URL2 結構（有 * 開頭）
      regex = /\*?\s*#+\s*\[(.+?)\]\((https?:\/\/[^\s]+?)\)[\s\S]*?\n\s*(\d{4}-\d{2}-\d{2})/g;
    }

    const matches = [...html.matchAll(regex)];
    console.log(`[資訊] ${label} 抓取完成，共 ${matches.length} 則新聞`);

    for (const m of matches) {
      news.push({
        title: `(${label}) ${m[1]}`.replace(/\s+/g, ' ').trim(),
        link: m[2].trim(),
        date: m[3].trim()
      });
    }
  } catch (err) {
    console.warn(`[錯誤] 抓取 ${label} 失敗：`, err.message);
  }
}

if (news.length === 0) {
  console.warn('[警告] 未擷取到任何新聞，請檢查來源與選擇器。');
} else {
  // 依日期排序（新到舊）
  news.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 儲存 JSON
  fs.writeFileSync('./data/fetch_cbaoverall_ws_mix.json', JSON.stringify(news, null, 2));
  console.log(`[完成] 共儲存 ${news.length} 則新聞`);
  console.log('[預覽] 第 1 則：', news[0]);
}
