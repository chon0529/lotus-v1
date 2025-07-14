// cardjs/aamacau_card.js - Lotus v1.3.7（2025-07-12）
// 用途：論盡澳門（aamacau.com）新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（Lotus fetchScript 標準格式）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'aamacau-card',
  key:       'aamacau',
  title:     '論盡澳門',
  jsonPath:  '/data/fetch_aamacau.json',
  fetchScript: 'fetch_aamacau_ws_cb.js',
  show:      15,        // 一次顯示 15 則
  max:       30,        // 保留最大條數
  autoRefresh: 15,      // 每 15 分鐘自動刷新
  tag:       '#澳門 #即時',
  theme:     'default',
  backgroundColor:   '#B5495B',
  backgroundTo:      '#B5495B',
  newsListBg:        '#fff',
  newsListFontTitle: '#222',
  newsListFontDate:  '#888',
  scrollThumb:       '#F2C7C7',
  scrollTrack:       '#B5495B'
});