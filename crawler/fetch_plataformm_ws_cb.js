// fetch_plataformm_ws_cb.js - Lotus v1.0.0-0711（Plataforma Media 澳門新聞 CB 合併版）
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
  saveHistoryAndUpdateLast, saveToHisAll, updateLastAddedAll
} from './modules/historyManager.js';

const SCRIPT = 'fetch_plataformm_ws_cb.js';
const OUTPUT = './data/fetch_plataformm_ws_cb.json';
const HISTORY = './data/his_fetch_plataformm.json';
const HIS_ALL = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS = 22;

const PAGES = [
  'https://r.jina.ai/https://www.plataformamedia.com/zh-hant/seccao/%e6%be%b3%e9%96%80/',
  'https://r.jina.ai/https://www.plataformamedia.com/zh-hant/seccao/%e6%be%b3%e9%96%80/page/2/'
];

// 工具 - 解析日期
function extractDate(text) {
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? dayjs(match[0]).format('YYYY-MM-DD') : '';
}

// 工具 - 解析 Markdown
function extractNewsFromMarkdown(markdown) {
  const results = [];

  // 找澳門段
  const sectionStart = markdown.indexOf('澳門\n==');
  if (sectionStart === -1) return results;

  const newsSection = markdown.substring(sectionStart);
  const newsEnd = newsSection.indexOf('### 即時報導');
  const sectionContent = newsEnd !== -1 ? newsSection.substring(0, newsEnd) : newsSection;
  const lines = sectionContent.split('\n').map(l => l.trim()).filter(Boolean);

  let i = 0;
  let bigNewsAdded = false;

  // 大圖新聞
  while (i < lines.length && !bigNewsAdded) {
    if (lines[i].startsWith('[![') && i + 2 < lines.length && lines[i + 1].startsWith('[')) {
      const titleLine = lines[i + 1];
      const linkMatch = titleLine.match(/\((https?:\/\/[^\s)]+)\)/);
      const titleMatch = titleLine.match(/\[(.*?)\]/);
      const dateLine = lines[i + 3] || '';

      if (linkMatch && titleMatch) {
        results.push({
          title: titleMatch[1].trim(),
          link: linkMatch[1],
          pubDate: extractDate(dateLine),
          source: 'Plataforma Media'
        });
        bigNewsAdded = true;
      }
      break;
    }
    i++;
  }

  // 小圖新聞
  const smallNewsRegex = /\*\s+\[\]\((https?:\/\/[^\s]+)\s+"(.*?)"\)\s+\[.*?\]\(\1\)[\s\S]+?by\s+\[.*?\]\(.*?\)(\d{4}-\d{2}-\d{2})/g;
  let match;
  while ((match = smallNewsRegex.exec(sectionContent)) !== null) {
    const [, link, title, date] = match;
    results.push({
      title: title.trim(),
      link: link.trim(),
      pubDate: dayjs(date).format('YYYY-MM-DD'),
      source: 'Plataforma Media'
    });
  }

  return results;
}

// 主要流程
(async () => {
  logInfo(SCRIPT, '啟動 Plataforma Media 澳門新聞 CB');
  try {
    let allResults = [];

    for (const url of PAGES) {
      const res = await axios.get(url);
      const markdown = res.data;
      const news = extractNewsFromMarkdown(markdown);

      allResults = allResults.concat(news);
      if (allResults.length >= MAX_NEWS) break;
    }

    // 過濾與裁切
    const finalResults = allResults
      .filter(n => n.title && n.link && n.pubDate)
      .slice(0, MAX_NEWS);

    fs.writeFileSync(OUTPUT, JSON.stringify(finalResults, null, 2), 'utf-8');
    logSuccess(SCRIPT, `共 ${finalResults.length} 則新聞已存至 ${OUTPUT}`);

    // 歷史 & last
    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      finalResults, 'plataformm', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount > 0) await saveToHisAll(newItems, 'plataformm', HIS_ALL);
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);

    // 補全 last_updated.json 結構
    try {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
      let data = {};
      if (fs.existsSync(LASTUPDATED)) {
        data = JSON.parse(fs.readFileSync(LASTUPDATED, 'utf-8'));
      }
      data['plataformm'] = {
        fetch: 'plataformm',
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

  
    logPreview(SCRIPT, finalResults[0] || '無法顯示新聞');
  } catch (err) {
    logError(SCRIPT, '抓取失敗：' + err.message);
  }
})();