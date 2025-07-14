// cardjs/jtm_card.js - Lotus v1.3.7（2025-07-12）
// 用途：Jornal Tribuna de Macau（JTM）新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（Lotus fetchScript 標準格式）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'jtm-card',
  key:       'jtm',                      // last_updated.json 對應欄位
  title:     'Jornal Tribuna de Macau',
  jsonPath:  '/data/fetch_jtm.json',
  fetchScript: 'fetch_jtm_ws_cb.js',
  show:      15,               // 顯示 15 則
  max:       22,               // 最大 22 則
  autoRefresh: 15,             // 每 15 分鐘自動刷新
  tag:       '#JTM',
  theme:     'default',
  backgroundColor:   '#0D5661',
  backgroundTo:      '#0D5661',
  newsListBg:        '#fff',
  newsListFontTitle: '#14424a',
  newsListFontDate:  '#888',
  scrollThumb:       '#407B85',
  scrollTrack:       '#0D5661'
});