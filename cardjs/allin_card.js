// cardjs/allin_card.js - Lotus v1.3.7（2025-07-12）
// 用途：Allin Media（博彩新聞）新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（Lotus fetchScript 標準格式）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'allin-card',
  key:       'allin',
  title:     'Allin Media',
  jsonPath:  '/data/fetch_allin.json',
  fetchScript: 'fetch_allin_ws_cb.js',
  show:      15,           // 顯示 15 則
  max:       22,           // 最大 22 則
  autoRefresh: 30,         // 每 30 分鐘自動刷新
  tag:       '#澳門 #博彩',
  theme:     'default',
  backgroundColor:   '#FFB11B',
  backgroundTo:      '#FFB11B',
  newsListBg:        '#fff',
  newsListFontTitle: '#b57708',
  newsListFontDate:  '#999',
  scrollThumb:       '#FFE8AC',
  scrollTrack:       '#FFB11B'
});