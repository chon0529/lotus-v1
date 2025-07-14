// cardjs/hengqingov_card.js - Lotus v1 標準版
import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'hengqingov-card',
  key:       'hengqingov',
  title:     '橫琴官方新聞',
  jsonPath:  '/data/fetch_hengqingov_ws_cb.json',
  show:      10,
  max:       30,
  autoRefresh: 60, // 每 60 分鐘自動刷新
  backgroundColor: '#33A6B8',
  backgroundTo:    '#33A6B8',
  newsListBg:      '#fff',
  newsListFontTitle: '#000',
  newsListFontDate:  '#666',
  scrollThumb:      '#A8D8B9',
  scrollTrack:      '#33A6B8',
  tag: '#橫琴 #官方',
  theme: 'default',

  // 刷新按鈕和自動刷新時都會跑這段
  onRefresh: async function() {
    const res = await fetch('/run-fetch?script=fetch_hengqingov_ws_cb.js');
    const ret = await res.json();
    if (!ret.success) {
      alert('橫琴新聞刷新失敗！');
      throw new Error(ret.stderr || 'Hengqin batch error');
    }
  }
});