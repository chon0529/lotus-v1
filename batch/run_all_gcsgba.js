// batch/run_all_gcsgba.js - Lotus v1.0.0 批次：大灣區＋橫琴新聞
import { exec } from 'child_process';

const fetchScripts = [
  { name: 'GCSGBA', file: 'fetch_gcsgba_ws_2.0.js' },
  { name: 'GCSHQ',  file: 'fetch_gcshq_ws_2.0.js' }
];

function runScript(script) {
  return new Promise((resolve) => {
    exec(`node crawler/${script}`, (err, stdout, stderr) => {
      if (err) {
        console.log(`[ERR] ${script}: ${stderr.trim()}`);
        resolve({ script, status: 'ERR' });
      } else {
        const firstLine = stdout ? stdout.trim().split('\n')[0] : '';
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
  process.stdout.write(`\r[100%] 合併合成 (fetch_gcsgba_cb.js) 執行中...     `);
  results.push(await runScript('fetch_gcsgba_cb.js'));
  process.stdout.write('\n');
  // 完成總結
  console.log('\n批次結果總結：');
  fetchScripts.forEach((fscr, idx) => {
    console.log(`${fscr.name} - ${results[idx].status}`);
  });
  console.log(`合併合成 - ${results[results.length-1].status}`);
  if (results.every(r => r.status === 'OK')) {
    console.log('\n[100%] 全部完成，GCSGBA 合併新聞已更新！');
  } else {
    console.log('\n[警告] 有失敗項目，請檢查 ERR 訊息！');
  }
}

// 啟動
runAll();