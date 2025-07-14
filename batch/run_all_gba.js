// batch/run_all_gba.js - Lotus v1.0.0 GBA 卡批次抓取＋合併
import { exec } from 'child_process';

const fetchScripts = [
  { name: '灣區行動', file: 'fetch_cbaaction_ws.js' },
  { name: '灣區綜合', file: 'fetch_cbaoverall_ws_mix.js' }
];

function runScript(script) {
  return new Promise((resolve) => {
    exec(`node crawler/${script}`, (err, stdout, stderr) => {
      if (err) {
        console.log(`[ERR] ${script}: ${stderr.trim()}`);
        resolve({ script, status: 'ERR' });
      } else {
        console.log(`[OK]  ${script}`);
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
  // 合併
  process.stdout.write(`\r[100%] 合併合成 (fetch_gba_cb.js) 執行中...     `);
  results.push(await runScript('fetch_gba_cb.js'));
  process.stdout.write('\n');
  // 總結
  console.log('\n批次結果總結：');
  fetchScripts.forEach((fscr, idx) => {
    console.log(`${fscr.name} - ${results[idx].status}`);
  });
  console.log(`合併合成 - ${results[results.length-1].status}`);
  if (results.every(r => r.status === 'OK')) {
    console.log('\n[100%] 全部完成，GBA 新聞已更新！');
  } else {
    console.log('\n[警告] 有失敗項目，請檢查 ERR 訊息！');
  }
}

runAll();