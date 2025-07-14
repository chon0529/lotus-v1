// cardjs/tdm_card.js - Lotus v1 標準版
import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'tdm-card',
  key:       'tdm_ws_cb',
  title:     '澳廣視新聞',
  jsonPath:  '/data/fetch_tdm_ws_cb.json',
  show:      15,
  max:       30,
  autoRefresh: 60, // 每 60 分鐘自動刷新
  backgroundColor: '#224d27',
  backgroundTo:    '#224d27',
  newsListBg:      '#fff',
  newsListFontTitle: '#222',
  newsListFontDate:  '#2d9c4b',
  scrollThumb:      '#89C997',
  scrollTrack:      '#224d27',
  tag: '#TDM #澳廣視',
  theme: 'default',

  // optional: 明確給 fetchScript 名稱（如你的 /run-fetch 支援）
  fetchScript: 'fetch_tdm_ws_cb.js',

  // optional: 自訂刷新行為（如需批次，否則可刪除這段）
  // onRefresh: async function() {
  //   const res = await fetch('/run-fetch?script=fetch_tdm_ws_cb.js');
  //   const ret = await res.json();
  //   if (!ret.success) {
  //     alert('TDM 新聞刷新失敗！');
  //     throw new Error(ret.stderr || 'TDM batch error');
  //   }
  // }
});