/**
 * Lotus 1 Dssopt 卡片新聞批次抓取與合併控制腳本
 * 進度條＋即時狀態版
 * GPT-20250712
 */
import { exec } from 'child_process';

const fetchScripts = [
  { name: '土地工務局', file: 'crawler/fetch_dsscu_ws_adv3.js' },
  { name: '公共建設局', file: 'crawler/fetch_dsop_ws.js' },
  { name: '澳門城規',   file: 'crawler/fetch_gcsup_ws.js' },
  { name: '澳門工程',   file: 'crawler/fetch_gcseng_ws.js' }
];

const totalSteps = fetchScripts.length + 1; // 4 fetch + 1 merge

function printProgress(current, total, message) {
  const percent = Math.round((current / total) * 100);
  process.stdout.write(`\r[${percent}%] ${message}                        `);
}

function runScript(label, script, step, total) {
  return new Promise((resolve) => {
    printProgress(step, total, `${label} 執行中...`);
    exec(`node ${script}`, (err, stdout, stderr) => {
      if (err) {
        printProgress(step, total, `[ERR] ${label} (${script})`);
        console.log(`\n[錯誤] ${label}：${stderr.trim()}`);
        resolve({ label, script, status: 'ERR' });
      } else {
        printProgress(step, total, `[OK]  ${label} (${script})`);
        // 只顯示前 1 行 stdout，太長建議摘要
        const lines = stdout.trim().split('\n');
        if (lines[0]) console.log(`\n[OK] ${label}：${lines[0]}`);
        resolve({ label, script, status: 'OK' });
      }
    });
  });
}

async function runAll() {
  let results = [];
  let step = 1;
  for (const fscr of fetchScripts) {
    results.push(await runScript(fscr.name, fscr.file, step++, totalSteps));
  }
  // 合併
  results.push(await runScript('合併合成', 'crawler/fetch_dssopt_cb.js', step, totalSteps));
  // 完成提示
  console.log('\n\n批次結果總結：');
  results.forEach(r => {
    console.log(`${r.label} - ${r.status}`);
  });
  if (results.every(r => r.status === 'OK')) {
    console.log('\n[100%] 全部完成，Dssopt 資料已更新！');
  } else {
    console.log('\n[警告] 有失敗項目，請檢查 ERR 訊息！');
  }
}

// 啟動
runAll();