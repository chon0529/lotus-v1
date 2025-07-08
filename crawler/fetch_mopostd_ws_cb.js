// crawler/fetch_mopostd_ws_cb.js - Lotus v1.0.0-0710
import fs from 'fs';
import fetch from 'node-fetch';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { logInfo, logSuccess, logError, logPreview } from './modules/logger.js';
import { saveHistoryAndUpdateLast, saveToHisAll, updateLastAddedAll } from './modules/historyManager.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Macau');

const SCRIPT      = 'fetch_mopostd_ws_cb.js';
const OUTPUT      = './data/fetch_mopostd.json';
const HISTORY     = './data/his_fetch_mopostd.json';
const HIS_ALL     = './data/HIS_ALL.json';
const LASTUPDATED = './data/last_updated.json';
const MAX_NEWS    = 30;
const MARKDOWN    = 'https://r.jina.ai/https://www.macaupostdaily.com/news/list?tab=LATEST';

function extractTitleAbstract(txt) {
  const words = txt.split(/\s+/);
  const preps = ['A','An','The','To','Of','On','At','In','Is','As','By','For','From','With',
                 'Raising','Launching','Opening','Boosting','Proposing','Building','Increasing'];
  for (let i=1; i<words.length; i++){
    if (preps.includes(words[i])){
      return {
        title: words.slice(0,i).join(' '),
        abstract: words.slice(i).join(' ')
      };
    }
  }
  return { title: txt, abstract: '' };
}

function parseMarkdown(md){
  const out=[];
  const re = /\[#####\s*([^\]]+?)\s*!\[[^\]]*\]\(([^)]+)\)\]\(([^)]+)\)/g;
  let m;
  while((m=re.exec(md))&& out.length<MAX_NEWS){
    const { title, abstract } = extractTitleAbstract(m[1].trim());
    out.push({
      title, abstract,
      link: m[3].trim(),
      image: m[2].trim(),
      pubDate: dayjs().format('YYYY-MM-DD')
    });
  }
  return out;
}

(async()=>{
  logInfo(SCRIPT,'啟動抓取 MoPostDaily');
  try {
    logInfo(SCRIPT, `下載 Markdown：${MARKDOWN}`);
    const res = await fetch(MARKDOWN);
    const md  = await res.text();
    const items = parseMarkdown(md);
    fs.writeFileSync(OUTPUT, JSON.stringify(items,null,2),'utf-8');
    logSuccess(SCRIPT, `共 ${items.length} 則新聞已存至 ${OUTPUT}`);

    const { newCount, newItems } = await saveHistoryAndUpdateLast(
      items, 'mopostd', HISTORY, LASTUPDATED, 'scheduled'
    );
    if (newCount>0){
      await saveToHisAll(newItems,'mopostd',HIS_ALL);
      await updateLastAddedAll('mopostd',LASTUPDATED);
    }
    logSuccess(SCRIPT, `共新增 ${newCount} 條，已寫入 ${HISTORY}`);
    logPreview(SCRIPT, items[0]||'無法顯示新聞');
  } catch(err){
    logError(SCRIPT, err.message);
  }
})();