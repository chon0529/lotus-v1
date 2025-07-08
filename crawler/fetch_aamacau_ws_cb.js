// crawler/fetch_aamacau_ws_cb.js - Lotus v1.6.0-0710（全域格式 & logger 規範）
import fs from 'fs';
import fetch from 'node-fetch';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { logInfo, logSuccess, logError, logPreview } from './modules/logger.js';
import { saveHistoryAndUpdateLast, saveToHisAll } from './modules/historyManager.js';

dayjs.extend(utc); dayjs.extend(timezone); dayjs.tz.setDefault('Asia/Macau');

const SCRIPT      = 'fetch_aamacau_ws_cb.js';
const URL         = 'https://r.jina.ai/https://aamacau.com/topics/breakingnews/';
const OUTPUT      = './data/fetch_aamacau.json';
const HISTORY     = './data/his_fetch_aamacau.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS    = 12;

(async () => {
  logInfo(SCRIPT, '啟動');
  try {
    logInfo(SCRIPT, `載入：${URL}`);
    const res = await fetch(URL);
    const text = await res.text();
    const lines = text.split('\n');

    const items = [];
    function convertDate(raw) {
      const match = raw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
      if (!match) return '';
      const [, year, month, day] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    for (let i = 0; i < lines.length - 2; i++) {
      const imageLine = lines[i].trim();
      const emptyLine = lines[i + 1].trim();
      const infoLine = lines[i + 2].trim();
      if (
        imageLine.startsWith('[![') &&
        emptyLine === '' &&
        infoLine.startsWith('[') &&
        infoLine.includes('年') &&
        infoLine.includes('｜文：')
      ) {
        const titleMatch = infoLine.match(/\[(.+?)\]\((https:\/\/aamacau\.com\/\?p=\d+).+?\)/);
        const dateMatch = infoLine.match(/(\d{4}年\d{1,2}月\d{1,2}日)/);
        if (titleMatch && dateMatch) {
          const title = titleMatch[1];
          const link = titleMatch[2];
          const pubDate = convertDate(dateMatch[1]);
          items.push({ title, link, pubDate });
        }
      }
      if (items.length >= MAX_NEWS) break;
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(items, null, 2), 'utf8');
    logSuccess(SCRIPT, `共 ${items.length} 則新聞已存至 ${OUTPUT}`);

    // ===== 這裡是關鍵！ =====
    const { newCount } = saveHistoryAndUpdateLast(
      items,           // 新聞資料
      'aamacau',       // key 必須與前端 key 及 last_updated.json 對應
      HISTORY,
      LASTUPDATED,
      'scheduled'
    );

    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);
    logPreview(SCRIPT, items[0] || '無法顯示新聞');

  } catch (err) {
    logError(SCRIPT, err.message);
  }
})();