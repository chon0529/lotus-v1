import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'gba-card',
  key:       'gba',
  title:     '大灣區新聞',
  jsonPath:  '/data/fetch_gba.json',
  show:      10,
  max:       20,
  autoRefresh: 60, // 每小時
  backgroundColor: '#B5495B',
  backgroundTo:    '#B5495B',
  tag: '#GBA #灣區',
  theme: 'default',
  onRefresh: async function() {
    const res = await fetch('/run-gba', { method: 'POST' });
    const ret = await res.json();
    if (ret.status !== 'OK') {
      alert('GBA 新聞刷新失敗！');
      throw new Error(ret.stderr || 'GBA batch error');
    }
  }
});