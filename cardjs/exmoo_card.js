// cardjs/exmoo_card.js - Lotus v1.3.7（2025-07-12）
// 用途：力報（exmoo.com）新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（Lotus fetchScript 標準格式）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'exmoo-card',
  key:       'exmoo',
  title:     '力報',
  jsonPath:  '/data/fetch_exmoo.json',
  fetchScript: 'fetch_exmoo_ws_cb.js',
  show:      15,          // 顯示 15 則
  max:       24,          // 最大 24 則
  autoRefresh: 5,         // 每 5 分鐘自動刷新
  tag:       '#澳門 #力報',
  theme:     'default',
  backgroundColor:   '#B1B479',
  backgroundTo:      '#B1B479',
  newsListBg:        '#fff',
  newsListFontTitle: '#333',
  newsListFontDate:  '#888',
  scrollThumb:       '#E5E9BB',
  scrollTrack:       '#B1B479'
});