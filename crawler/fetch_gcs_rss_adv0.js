// crawler/fetch_gcs_rss_adv0.js
import axios from 'axios';
import xml2js from 'xml2js';
import fs from 'fs';
import dayjs from 'dayjs';

const url = 'https://govinfohub.gcs.gov.mo/api/rss/n/zh-hant';

export async function fetchGcsRssAdv0() {
  console.log('[RSS][欄1_adv0] 啟動');
  try {
    const res = await axios.get(url, {
      headers: {
        'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      responseType: 'text'
    });

    const xml = res.data;
    const result = await xml2js.parseStringPromise(xml, { trim: true });

    const rawItems = result.rss.channel[0].item || [];
    const items = rawItems.slice(0, 10).map(item => ({
      title: item.title[0],
      link: item.link[0],
      pubDate: item.pubDate[0]
    }));

    // 若不足 10 則，補上空白新聞
    const today = dayjs().format('MM-DD');
    while (items.length < 10) {
      items.push({
        title: `（${today} 暫無更多新聞）`,
        link: '#',
        pubDate: ''
      });
    }

    fs.writeFileSync('data/column1.json', JSON.stringify(items, null, 2), 'utf8');
    console.log(`[RSS][欄1_adv0] 已更新，共 ${items.length} 則新聞`);
  } catch (err) {
    console.error('[RSS][欄1_adv0] 抓取失敗:', err.message);
  }
}

// 如果直接執行本檔案
if (import.meta.url.endsWith('fetch_gcs_rss_adv0.js')) {
  fetchGcsRssAdv0();
}
