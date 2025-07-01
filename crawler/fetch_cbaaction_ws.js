// crawler/fetch_cbaaction_ws.js
import fs from 'fs';
import axios from 'axios';

const url = 'https://r.jina.ai/https://www.cnbayarea.org.cn/news/action/index.html';
const savePath = './data/fetch_cbaaction_ws.json';

async function fetchNews() {
  console.log('[爬蟲] fetch_cbaaction_ws 啟動');
  try {
    const response = await axios.get(url);
    const markdown = response.data;

    const regex = /###\s*\[(.*?)\]\((.*?)\)\s*\n+\s*(\d{4}-\d{2}-\d{2})/g;
    let match;
    const news = [];

    while ((match = regex.exec(markdown)) !== null) {
      news.push({
        title: match[1].trim(),
        url: match[2].trim(),
        date: match[3].trim()
      });
    }

    // 日期降序排序
    news.sort((a, b) => new Date(b.date) - new Date(a.date));

    fs.writeFileSync(savePath, JSON.stringify(news, null, 2), 'utf8');

    console.log(`[完成] 共儲存 ${news.length} 則新聞`);
    if (news.length > 0) {
      console.log(`[預覽] 第 1 則：${news[0].title}`);
    }
  } catch (error) {
    console.error('[錯誤] 無法抓取：', error.message);
  }
}

fetchNews();
