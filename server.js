// server.js - Lotus1 Core Server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 靜態資源掛載（確保路徑與檔名一致）
app.use('/css',     express.static(path.join(__dirname, 'css')));
app.use('/lib',     express.static(path.join(__dirname, 'lib')));
app.use('/cardjs',  express.static(path.join(__dirname, 'cardjs')));
app.use('/data',    express.static(path.join(__dirname, 'data')));
app.use('/',        express.static(path.join(__dirname)));  // index.html

// 2. /run-fetch API：始終回傳 200 + JSON
app.get('/run-fetch', async (req, res) => {
  const { script, force = 0, interval = 5 } = req.query;
  try {
    const { execFile } = await import('child_process');
    execFile('node', [`crawler/${script}`, force, interval], (err, stdout, stderr) => {
      res.json({
        success: !err,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        code: err?.code ?? 0
      });
      if (err) console.error(stderr);
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

// 3. 404 處理
app.use((req, res) => res.status(404).send('Not Found'));

// 啟動
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});