// cardjs/macaucabletv_card.js - Lotus v1.3.7（2025-07-12）
// 用途：澳門有線電視新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（fetchScript 標準，原有倒數、主題色等已統一整合）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'macaucabletv-card',
  key:       'macaucabletv_ws_cb',
  title:     '澳門有線電視',
  jsonPath:  '/data/fetch_macaucabletv_ws_cb.json',
  show:      8,       // 一次顯示 8 則（可調整）
  max:       30,      // 保留最大條數
  autoRefresh: 60,    // 每 60 分鐘自動刷新
  backgroundColor: '#323e2e',
  backgroundTo:    '#323e2e',
  newsListBg:      '#fff',
  newsListFontTitle: '#1a1',
  newsListFontDate:  '#888',
  scrollThumb:      '#bad8b5',
  scrollTrack:      '#323e2e',
  tag: '#澳門有線 #CableTV',
  theme: 'default',

  // 只需 fetchScript，不需自訂 onRefresh（單一來源型）
  fetchScript: 'fetch_macaucabletv_ws_cb.js'
});