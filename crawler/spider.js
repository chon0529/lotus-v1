// crawler/spider.js
import { fetchColumn1 } from './fetchColumn1.js';
import { fetchColumn2 } from './fetchColumn2.js';
import { fetchColumn3 } from './fetchColumn3.js';
import { fetchColumn4 } from './fetchColumn4.js';

const columnMap = {
  column1: fetchColumn1,
  column2: fetchColumn2,
  column3: fetchColumn3,
  column4: fetchColumn4,
};

export async function runSpider(columnId = null) {
  if (columnId) {
    const fn = columnMap[columnId];
    if (!fn) {
      console.error(`[爬蟲] 無此欄位：${columnId}`);
      return;
    }

    try {
      await fn();
    } catch (err) {
      console.error(`[爬蟲][${columnId}] 抓取失敗:`, err.message);
    }

  } else {
    for (const id of Object.keys(columnMap)) {
      console.log(`[爬蟲] 正在抓取：${id}`);
      try {
        await columnMap[id]();
      } catch (err) {
        console.error(`[爬蟲][${id}] 抓取失敗:`, err.message);
      }
    }
  }
}
