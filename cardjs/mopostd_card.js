// cardjs/mopostd_card.js - Lotus v1.3.7（2025-07-12）
// 用途：Macau Post Daily（英字報）新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（Lotus fetchScript 標準格式）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'mopostd-card',
  key:       'mopostd',
  title:     'Macau Post Daily',
  jsonPath:  '/data/fetch_mopostd.json',
  fetchScript: 'fetch_mopostd_ws_cb.js',
  show:      15,           // 顯示 15 則
  max:       30,           // 最大 30 則
  autoRefresh: 60,         // 每 60 分鐘自動刷新
  tag:       '#MoPostDaily',
  theme:     'default',
  backgroundColor:   '#8E354A',
  backgroundTo:      '#8E354A',
  newsListBg:        '#fff',
  newsListFontTitle: '#802338',
  newsListFontDate:  '#888',
  scrollThumb:       '#B07E8B',
  scrollTrack:       '#8E354A'
});