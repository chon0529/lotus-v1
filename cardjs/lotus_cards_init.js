// lotus_cards_init.js - Lotus v1.0.0
// 全卡片初始化與自動掛載模組（主控用）
// [Big5 註解：每張卡片一份 JS，全部於此統一調用]
//
// === 需配合 _card_core.js 使用 ===

import { cardInit } from './cardjs/_card_core.js'; 

// === 卡片設定清單，直接新增或調整 ===
const cardsConfig = [
  {
    cardId: 'macaodaily-card',  // 卡片主DIV的ID
    key: 'macaodaily',          // JSON及更新機制對應key
    title: '澳門日報',
    jsonPath: '/data/fetch_macaodaily.json',
    fetchScript: 'fetch_macaodaily_ws_cb.js',
    show: 15,                   // 最少顯示數量
    max: 22,                    // 最多顯示數量
    autoRefresh: 5,             // 幾分鐘自動刷新
    tag: '#澳門 #即時',
    backgroundColor: '#B5495B',
    scrollThumb: '#F2C7C7',
    scrollTrack: '#B5495B',
    type: 'live',               // 卡片型別
  },
  {
    cardId: 'tdm-card',
    key: 'tdm',
    title: '澳廣視',
    jsonPath: '/data/fetch_tdm.json',
    fetchScript: 'fetch_tdm_ws_cb.js',
    show: 10,
    max: 18,
    autoRefresh: 10,
    tag: '#澳門 #電視',
    backgroundColor: '#35729E',
    scrollThumb: '#D6E3F2',
    scrollTrack: '#35729E',
    type: 'live',
  },
    {
    cardId: 'gcs-card',
    key: 'gcs',
    title: '澳廣視',
    jsonPath: '/data/fetch_gcs.json',
    fetchScript: 'fetch_gcs_rss_cb.js',
    show: 15,
    max: 22,
    autoRefresh: 10,
    tag: '#澳門 #即時 #官方',
    backgroundColor: '#35729E',
    scrollThumb: '#D6E3F2',
    scrollTrack: '#35729E',
    type: 'live',
  },
  {
    cardId: 'conclude-card',   // 摘要卡
    key: 'conclude',
    title: '新聞摘要',
    jsonPath: '/data/fetch_conclude.json',
    fetchScript: 'fetch_conclude_ws_cb.js',
    show: 5,
    max: 10,
    autoRefresh: 20,
    tag: '#摘要 #精選',
    backgroundColor: '#44434B',
    scrollThumb: '#D8D8D8',
    scrollTrack: '#44434B',
    type: 'conclude',          // 新類型
  }
];

// === 逐一初始化 ===
cardsConfig.forEach(opt => {
  cardInit(opt);
});
