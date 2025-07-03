// fetch_macaodaily_ws_2.0_index.js
// ✅ M&S 版本：專供 index.html 結合使用（即時更新卡片）

import * as cheerio from 'cheerio';
import fs from 'fs';
import fetch from 'node-fetch';
import dayjs from 'dayjs';
import { logInfo, logSuccess, logError } from './logger.js';

const URL = 'https://www.modaily.cn/amucsite/web/index.html#/home';
const OUTPUT_PATH = './data/fetch_macaodaily_ws_2.0_index.json';

export default async function fetchMacauDailyIndex() {
  logInfo('fetch_macaodaily_ws_2.0_index 啟動');

  try {
    const response = await fetch(URL);
    const html = await response.text();

    const newsRegex = /<div ng-repeat="item in Hdata" class="ng-scope">([\s\S]*?)<\/div>/g;
    const items = html.match(newsRegex);

    if (!items || items.length === 0) {
      logError('❌ 未擷取到任何新聞區塊。');
      return [];
    }

    const newsList = [];
    for (const block of items.slice(0, 22)) {
      const titleMatch = block.match(/<h3[^>]*?>(.*?)<\/h3>/);
      const timeMatch = block.match(/<li class="ng-binding">(.*?)<\/li>/);
      const idMatch = block.match(/img[^>]+ng-src=".*?(\d{7,8})/);

      if (titleMatch && timeMatch && idMatch) {
        newsList.push({
          title: titleMatch[1].trim(),
          date: dayjs(timeMatch[1].trim()).format('YYYY-MM-DD'),
          url: `https://www.modaily.cn/amucsite/web/index.html#/detail/${idMatch[1]}`,
        });
      }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newsList, null, 2), 'utf8');
    logSuccess(`✅ 共擷取 ${newsList.length} 則新聞，已儲存至 ${OUTPUT_PATH}`);
    return newsList;
  } catch (err) {
    logError('❌ 抓取或解析新聞時發生錯誤：' + err.message);
    return [];
  }
}
