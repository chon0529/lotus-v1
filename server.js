// server.js
import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.resolve('./')));

// 提供 API 來執行特定爬蟲
app.get('/run-fetch', (req, res) => {
  const target = req.query.target;
  if (!target) return res.status(400).send('Missing target');
  
  const scriptPath = `./crawler/fetch_${target}_ws_cb.js`;
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[SERVER] ❌ 爬蟲失敗: ${target}`, error);
      return res.status(500).send('爬蟲執行失敗');
    }
    console.log(`[SERVER] ✅ 爬蟲成功: ${target}`);
    res.send('Fetch completed');
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`[SERVER] ✅ Server started on http://localhost:${PORT}`);
});
