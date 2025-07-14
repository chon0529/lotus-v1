// cardjs/macaubusiness_card.js - Lotus v1.3.7（2025-07-12）
// 用途：澳門商報（Macau Business）新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（Lotus fetchScript 標準格式）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'macaubusiness-card',
  key:       'macaubusiness',
  title:     '澳門商報 Macau Business',
  jsonPath:  '/data/fetch_macaubusiness_ws_cb.json',
  fetchScript: 'fetch_macaubusiness_ws_cb.js',
  show:      12,           // 每次顯示 12 則（可調整）
  max:       22,           // 最大 22 則
  autoRefresh: 120,        // 每 120 分鐘自動刷新
  tag:       '#澳門 #商報',
  theme:     'default',
  backgroundColor:   '#FC9F4D',
  backgroundTo:      '#FC9F4D',
  newsListBg:        '#fff',
  newsListFontTitle: '#c05d00',
  newsListFontDate:  '#666',
  scrollThumb:       '#ffe1c1',
  scrollTrack:       '#FC9F4D'
});