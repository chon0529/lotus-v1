// cardjs/hojemacau_card.js - Lotus v1.3.7（2025-07-12）
// 用途：Hoje Macau 新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（Lotus fetchScript 標準格式）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'hojemacau-card',
  key:       'hojemacau',
  title:     'Hoje Macau',
  jsonPath:  '/data/fetch_hojemacau.json',
  fetchScript: 'fetch_hojemacau_ws_cb.js',
  show:      15,            // 顯示 15 則
  max:       48,            // 最大 48 則
  autoRefresh: 30,          // 每 30 分鐘自動刷新
  tag:       '#Sociedade #Política',
  theme:     'default',
  backgroundColor:   '#8E354A',
  backgroundTo:      '#8E354A',
  newsListBg:        '#fff',
  newsListFontTitle: '#802338',
  newsListFontDate:  '#888',
  scrollThumb:       '#B07E8B',
  scrollTrack:       '#8E354A'
});