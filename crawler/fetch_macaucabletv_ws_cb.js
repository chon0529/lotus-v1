// crawler/fetch_macaucabletv_ws_cb.js
// Lotus v1.0 CB化
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dayjs from 'dayjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import {
  logInfo, logSuccess, logError, logPreview
} from './modules/logger.js';
import {
  saveHistoryAndUpdateLast,
  saveToHisAll,
  updateLastAddedAll
} from './modules/historyManager.js';

const SCRIPT = 'fetch_macaucabletv_ws_cb.js';
const OUTPUT = './data/fetch_macaucabletv_ws_cb.json';
const HISTORY = './data/his_fetch_macaucabletv.json';
const HIS_ALL = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS = 20;

// 解決 __dirname 在 ESM 中不可用問題
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_URL = 'https://r.jina.ai/https://www.macaucabletv.com/video/category/ALL';

(async () => {
  logInfo(SCRIPT, '啟動 澳門有線電視新聞 CB 化抓取');

  try {
    const res = await axios.get(SOURCE_URL);
    const markdown = res.data;

    const regex = /\[!\[.*?\]\((.*?)\)\s+(.*?)\s+(\d{4}年\d{1,2}月\d{1,2}日).*?\]\((https?:\/\/[^\s)]+)\)/g;

    let match;
    const results = [];

    while ((match = regex.exec(markdown)) !== null) {
      const [, imageUrl, rawTitle, rawDate, link] = match;

      // 標題淨化，保留主題
      const cleanedTitle = rawTitle.trim().replace(/^影片\s*/, '').split(' ')[0];
      const dateMatch = rawDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (!dateMatch) continue;
      const [, year, month, day] = dateMatch;
      const pubDate = dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).format('YYYY-MM-DD');

      results.push({
        title: cleanedTitle,
        link,
        pubDate
      });
    }

    // 儲存主 json
    fs.writeFileSync(OUTPUT, JSON.stringify(results.slice(0, MAX_NEWS), null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${results.length} 則新聞已存至 ${OUTPUT}`);

    // 寫入歷史/last_updated 處理
    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      results.slice(0, MAX_NEWS), 'macaucabletv', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) await saveToHisAll(newItems, 'macaucabletv', HIS_ALL);
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);

    // last_updated.json 結構補全
    try {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      let data = {};
      if (fs.existsSync(LASTUPDATED)) {
        data = JSON.parse(fs.readFileSync(LASTUPDATED, 'utf-8'));
      }
      data['macaucabletv'] = {
        fetch: 'macaucabletv',
        lastRun: now,
        lastSuccess: now,
        lastAdded: now,
        lastOperation: 'scheduled',
        lastManual: null
      };
      fs.writeFileSync(LASTUPDATED, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      logError(SCRIPT, `更新 last_updated.json 失敗: ${err.message}`);
    }

    // HIS_ALL lastAddedAll 更新
    await updateLastAddedAll('macaucabletv', LASTUPDATED);

    // 預覽
    logPreview(SCRIPT, results[0] || '無法顯示新聞');
  } catch (error) {
    logError(SCRIPT, '抓取失敗：' + error.message);
  }
})();