import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('./'));

app.get('/run-fetch', async (req, res) => {
  const { script, force } = req.query;
  const scriptPath = path.join('crawler', script || '');
  if (!fs.existsSync(scriptPath)) {
    res.status(404).json({ ok: false, msg: 'Script not found' });
    return;
  }
  try {
    const exec = (await import('child_process')).exec;
    exec(`node ${scriptPath}`, (err, stdout, stderr) => {
      if (err) {
        res.json({ ok: false, error: err.toString() });
      } else {
        res.json({ ok: true, msg: 'Fetch done.' });
      }
    });
  } catch (e) {
    res.json({ ok: false, error: e.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`[SERVER] ✅ Server started on http://localhost:${PORT}`);
});
///// the end of server.js
