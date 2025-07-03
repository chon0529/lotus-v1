// crawler/fetch_macaodaily_ws_2.0.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { logStart, logSuccess, logError } from './logger.js';

const TARGET_URL = 'http://www.modaily.cn/amucsite/web/index.html#/home'; // 若为 SPA，可换成真实的 API endpoint

/**
 * 抓取「澳門日報」最新新闻列表
 * @returns {Promise<Array<{ title: string, date: string, url: string }>>}
 */
export default async function fetchMacDaily() {
  logStart('fetch_macaodaily_ws_2.0');

  try {
    // 1. 发请求
    const { data: html } = await axios.get(TARGET_URL, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MacDailyBot/1.0)',
      },
    });

    // 2. 载入并解析
    const $ = cheerio.load(html);
    const articles = [];

    // 3. 根据实际页面结构调整 selector —— 下面是示例
    //    假设新闻条目在 <div class="news-list"> 下的 .news-item 元素里
    $('.news-list .news-item').each((i, el) => {
      if (articles.length >= 22) return false; // 最多抓 22 条
      const $el = $(el);

      const title = $el.find('.news-title').text().trim();
      const date  = $el.find('.news-date').text().trim();  // e.g. "2025/07/02"

      let href = $el.find('a').attr('href') || '';
      // 如果链接不是完整 URL，就补全
      if (href && !href.startsWith('http')) {
        href = new URL(href, TARGET_URL).href;
      }

      articles.push({ title, date, url: href });
    });

    logSuccess('fetch_macaodaily_ws_2.0', `共抓到 ${articles.length} 条新闻`);
    return articles;
  } catch (err) {
    logError('fetch_macaodaily_ws_2.0', err.message);
    throw err;
  }
}

// 如果直接用 `node fetch_macaodaily_ws_2.0.js` 执行，则打印结果
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const list = await fetchMacDaily();
      console.log(JSON.stringify(list, null, 2));
    } catch {
      process.exit(1);
    }
  })();
}