// server.js - Lotus1 Core Server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 靜態資源路徑
app.use('/css',     express.static(path.join(__dirname, 'css')));
app.use('/lib',     express.static(path.join(__dirname, 'lib')));
app.use('/cardjs',  express.static(path.join(__dirname, 'cardjs')));
app.use('/data',    express.static(path.join(__dirname, 'data')));
app.use('/',        express.static(path.join(__dirname)));  // index.html

// 2. 單一 fetch 腳本 API (強化防呆與 debug)
app.get('/run-fetch', async (req, res) => {
  const { script, force = 0, interval = 5 } = req.query;
  // ===== 新增 debug log 與防呆 =====
  console.log(`[run-fetch]  script = ${script}, force = ${force}, interval = ${interval}`);
  // 強化防呆：多加一條 script === 'undefined'
  if (!script || typeof script !== 'string' || script === 'undefined' || script.includes('..') || script.includes('/')) {
    res.status(400).json({ success: false, error: 'Invalid or missing script parameter' });
    return;
  }
  try {
    const { execFile } = await import('child_process');
    execFile('node', [`crawler/${script}`, force, interval], (err, stdout, stderr) => {
      res.json({
        success: !err,
        stdout: stdout ? stdout.trim() : '',
        stderr: stderr ? stderr.trim() : '',
        code: err?.code ?? 0
      });
      if (err) console.error(stderr);
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

// 3. Dssopt 卡片專用批次 API
app.post('/run-dssopt', async (req, res) => {
  exec('node batch/run_all_dssopt.js', (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.json({ status: 'dssopt batch ERR', stderr: stderr.trim() });
    }
    res.json({ status: 'OK' });
  });
});

// 4. Committees 卡片專用批次 API
app.post('/run-committees', async (req, res) => {
  exec('node batch/run_all_committees.js', (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.json({ status: 'committees batch ERR', stderr: stderr.trim() });
    }
    res.json({ status: 'OK' });
  });
});

// 5. GCSGBA 卡片專用批次 API
app.post('/run-gcsgba', async (req, res) => {
  exec('node batch/run_all_gcsgba.js', (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.json({ status: 'gcsgba batch ERR', stderr: stderr.trim() });
    }
    res.json({ status: 'OK' });
  });
});

// 6. GBA 卡片專用批次 API
app.post('/run-gba', async (req, res) => {
  exec('node batch/run_all_gba.js', (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.json({ status: 'gba batch ERR', stderr: stderr.trim() });
    }
    res.json({ status: 'OK' });
  });
});

// 7. 404 頁面
app.use((req, res) => res.status(404).send('Not Found'));

// 啟動服務
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

/*
---------------------------------------------------
【說明】
- /run-dssopt 供 Dssopt 卡片自動批次抓取與合併
- /run-committees 供 Committees 卡片自動批次抓取與合併
- /run-GBA 供 GBA 卡片自動批次抓取與合併
- /run-GCSGBA 供 GCSGBA 卡片自動批次抓取與合併
- 前端只要呼叫這兩個 API，不需再理會具體細節
- GET /run-fetch 保留傳統單腳本呼叫方式
- run-fetch：強化 debug 與參數檢查，能一眼看出前端誰沒帶 script 或有異常
- 建議你在每次刷新四張新卡時觀察 terminal log，有 undefined 一定馬上現形
- 其它批次、靜態路徑、404 都完全一致
---------------------------------------------------
*/