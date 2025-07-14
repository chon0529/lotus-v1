// cardjs/plataformm_card.js - Lotus v1.3.7（2025-07-12）
// 用途：Plataforma Media 澳門新聞卡片，單一來源自動/手動刷新
// 最後修改：2025-07-12 by GPT（Lotus fetchScript 標準格式）

import { cardInit } from './_card_core.js';

cardInit({
  cardId:    'plataformm-card',
  key:       'plataformm',
  title:     'Plataforma Media 澳門新聞',
  jsonPath:  '/data/fetch_plataformm_ws_cb.json',
  fetchScript: 'fetch_plataformm_ws_cb.js',
  show:      12,               // 顯示 12 則
  max:       24,               // 最大 24 則
  autoRefresh: 60,             // 每 60 分鐘自動刷新
  tag:       '#葡語 #澳門',
  theme:     'default',
  backgroundColor:   '#206f99',
  backgroundTo:      '#206f99',
  newsListBg:        '#fff',
  newsListFontTitle: '#175275',
  newsListFontDate:  '#888',
  scrollThumb:       '#a7c9de',
  scrollTrack:       '#206f99'
});