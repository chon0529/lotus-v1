// cardjs/cepa_card.js - Lotus v1 標準版
import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'cepa-card',
  key:       'cepa',
  title:     'CEPA 動態',
  jsonPath:  '/data/fetch_cepa_ws_cb.json',
  show:      12,
  max:       24,
  autoRefresh: 120, // 每 120 分鐘
  backgroundColor: '#F5B199',
  backgroundTo:    '#F5B199',
  newsListBg:      '#fff',
  newsListFontTitle: '#000',
  newsListFontDate:  '#666',
  scrollThumb:      '#FFD700',
  scrollTrack:      '#F5B199',
  tag: '#CEPA #區域合作',
  theme: 'default',

  onRefresh: async function() {
    const res = await fetch('/run-fetch?script=fetch_cepa_ws_cb.js');
    const ret = await res.json();
    if (!ret.success) {
      alert('CEPA 新聞刷新失敗！');
      throw new Error(ret.stderr || 'CEPA batch error');
    }
  }
});