// fetch_DSSOPT_rss.js
import Parser from 'rss-parser';
import fs from 'fs';
import dayjs from 'dayjs';
import puppeteer from 'puppeteer';

console.log('[爬蟲] fetch_DSSOPT_rss 啟動');

const parser = new Parser();
const outputPath = './data/fetch_DSSOPT_rss.json';

const rssFeeds = [
  { url: 'https://www.dsop.gov.mo/system/rss/?type=news', label: 'DSOP' },
  { url: 'https://www.dsat.gov.mo/tc/news_rss.aspx', label: 'DSAT' }
];

// 處理 DSSCU 官網（非 RSS）
async function fetchDSSCU_Website() {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('https://www.dsscu.gov.mo/zh/latestnews/newslist?page=1&termSlug=news', {
      waitUntil: 'networkidle0',
      timeout: 0
    });

    await page.waitForSelector('.ant-spin-nested-loading a');

    const news = await page.$$eval('.ant-spin-nested-loading a', elements => {
      return elements.map(el => {
        const titleEl = el.querySelector('p');
        const dateEl = el.querySelector('.date p');
        const href = el.getAttribute('href');
        const idMatch = href?.match(/newslist\/([^/]+)$/);
        const id = idMatch ? idMatch[1] : null;

        return {
          title: titleEl?.innerText?.trim() || '',
          date: dateEl?.innerText?.trim() || '',
          id
        };
      }).filter(item => item.title && item.date && item.id);
    });

    await browser.close();

    const results = news.map(item => ({
      title: `(DSSCU) ${item.title}`,
      date: item.date,
      link: `https://www.dsscu.gov.mo/zh/latestnews/newslist/${item.id}`
    }));

    console.log(`[資訊] DSSCU 抓取完成，共 ${results.length} 則新聞`);
    return results;
  } catch (err) {
    console.warn('[警告] DSSCU 擷取失敗：', err.message);
    return [];
  }
}

// 處理 RSS
async function fetchRSS(url, label) {
  try {
    const feed = await parser.parseURL(url);
    const items = feed.items.map(item => {
      const date = item.pubDate || item.isoDate || '';
      return {
        title: `(${label}) ${item.title?.trim() || ''}`,
        date: dayjs(date).format('YYYY-MM-DD'),
        link: item.link
      };
    });
    console.log(`[資訊] ${label} 抓取完成，共 ${items.length} 則新聞`);
    return items;
  } catch (err) {
    console.warn(`[警告] 無法擷取 RSS：${label} ${err.message}`);
    return [];
  }
}

// 主程式邏輯
(async () => {
  const allNews = [];

  // RSS 來源
  for (const { url, label } of rssFeeds) {
    const rssItems = await fetchRSS(url, label);
    allNews.push(...rssItems);
  }

  // DSSCU 網站來源
  const dsscuItems = await fetchDSSCU_Website();
  allNews.push(...dsscuItems);

  // 根據日期排序（新到舊）
  const sortedNews = allNews
    .filter(item => item.date && item.title && item.link)
    .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());

  // 輸出 JSON
  fs.writeFileSync(outputPath, JSON.stringify(sortedNews, null, 2), 'utf-8');
  console.log(`[完成] 共儲存 ${sortedNews.length} 則新聞`);
})();
