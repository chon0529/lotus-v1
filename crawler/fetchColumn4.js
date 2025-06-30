// crawler/fetchColumn4.js
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('data/column4.json');

export async function fetchColumn4() {
  const mock = Array.from({ length: 10 }, (_, i) => ({
    title: `建築新聞 ${i + 1}`,
    link: '#',
    pubDate: new Date().toISOString(),
  }));

  fs.writeFileSync(filePath, JSON.stringify(mock, null, 4), 'utf-8');
  console.log(`[爬蟲] 欄4 模擬資料已更新，共 ${mock.length} 則`);
}
