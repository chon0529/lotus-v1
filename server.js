import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runColumnTask } from './crawler/spider.js';

const app = express();
const PORT = 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/data/:col.json', (req, res) => {
  const file = path.join(__dirname, 'data', `${req.params.col}.json`);
  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    res.status(404).json([]);
  }
});

app.get('/trigger/:col', async (req, res) => {
  const colId = req.params.col;
  console.log(`[手動觸發] ${colId}`);
  await runColumnTask(colId);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
