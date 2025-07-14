// batch/run_all_committees.js - Lotus v1.0.0-0712（CAEU + CRU + CPU 批次抓取 + 合併）
import { exec } from 'child_process';

const fetchScripts = [
  { name: 'CAEU', file: 'fetch_caeu_ws.js' },
  { name: 'CRU',  file: 'fetch_cru_ws.js' },
  { name: 'CPU',  file: 'fetch_cpu_ws.js' }
];

// 執行單一腳本
function runScript(script) {
  return new Promise((resolve) => {
    exec(`node crawler/${script}`, (err, stdout, stderr) => {
      if (err) {
        console.log(`[ERR] ${script}: ${stderr.trim()}`);
        resolve({ script, status: 'ERR' });
      } else {
        // 僅顯示第一行 log（避免太長）
        const firstLine = stdout.trim().split('\n')[0] || '';
        console.log(`[OK]  ${script}${firstLine ? '：' + firstLine : ''}`);
        resolve({ script, status: 'OK' });
      }
    });
  });
}

async function runAll() {
  let results = [];
  let step = 1;
  const totalSteps = fetchScripts.length + 1;
  for (const fscr of fetchScripts) {
    const msg = `[${Math.round((step/totalSteps)*100)}%] ${fscr.name} 執行中...`;
    process.stdout.write(`\r${msg}                  `);
    results.push(await runScript(fscr.file));
    step++;
  }
  // 合併合成
  process.stdout.write(`\r[100%] 合併合成 (fetch_committees_cb.js) 執行中...     `);
  results.push(await runScript('fetch_committees_cb.js'));
  process.stdout.write('\n');
  // 完成總結
  console.log('\n批次結果總結：');
  fetchScripts.forEach((fscr, idx) => {
    console.log(`${fscr.name} - ${results[idx].status}`);
  });
  console.log(`合併合成 - ${results[results.length-1].status}`);
  if (results.every(r => r.status === 'OK')) {
    console.log('\n[100%] 全部完成，Committees 資料已更新！');
  } else {
    console.log('\n[警告] 有失敗項目，請檢查 ERR 訊息！');
  }
}

// 啟動
runAll();