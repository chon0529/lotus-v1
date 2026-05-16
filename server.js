import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const app=express();
const PORT=3000;

app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

app.get('/api/health',(req,res)=>res.json({
  ok:true,
  app:'Nova-Lotus',
  timezone:'Asia/Macau',
  now:new Date().toISOString()
}));

app.listen(PORT,'0.0.0.0',()=>console.log('Nova-Lotus running: http://localhost:'+PORT));
