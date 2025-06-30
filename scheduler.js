// scheduler.js
import { setInterval } from 'node:timers/promises';
import { fetchColumn1 } from './crawler/fetchColumn1.js';
import { fetchColumn2 } from './crawler/fetchColumn2.js';
import { fetchColumn3 } from './crawler/fetchColumn3.js';
import { fetchColumn4 } from './crawler/fetchColumn4.js';

console.log("==== 排程器啟動中，每 30 秒檢查一次任務 ====");

let lastRun = {
  column1: 0,
  column2: 0,
  column3: 0,
  column4: 0,
};

const runTasks = async () => {
  const now = Date.now();

  // 每 1 分鐘執行 column1
  if (now - lastRun.column1 > 60 * 1000) {
    console.log("[排程器] 觸發：column1");
    await fetchColumn1();
    lastRun.column1 = now;
  }

  // 每 2 分鐘執行 column2~4
  for (const col of ['column2', 'column3', 'column4']) {
    if (now - lastRun[col] > 2 * 60 * 1000) {
      console.log(`[排程器] 觸發：${col}`);
      if (col === 'column2') await fetchColumn2();
      if (col === 'column3') await fetchColumn3();
      if (col === 'column4') await fetchColumn4();
      lastRun[col] = now;
    }
  }
};

(async () => {
  for await (const _ of setInterval(30 * 1000)) {
    await runTasks();
  }
})();
