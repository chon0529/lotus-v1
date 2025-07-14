// cardjs/macaudailytimes_card.js - Lotus v1.3.7（2025-07-12）
// 用途：Macau Daily Times（MDT）新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（Lotus fetchScript 標準格式）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'macaudailytimes-card',
  key:       'macaudailytimes',
  title:     'Macau Daily Times',
  jsonPath:  '/data/fetch_macaudailytimes.json',
  fetchScript: 'fetch_macaudailytimes_ws_cb.js',
  show:      15,             // 顯示 15 則
  max:       30,             // 最大 30 則
  autoRefresh: 45,           // 每 45 分鐘自動刷新
  tag:       '#澳門',
  theme:     'default',
  backgroundColor:   '#64363C',
  backgroundTo:      '#64363C',
  newsListBg:        '#fff',
  newsListFontTitle: '#43282b',
  newsListFontDate:  '#888',
  scrollThumb:       '#8E695B',
  scrollTrack:       '#64363C'
});