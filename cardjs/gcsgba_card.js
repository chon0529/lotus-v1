// gcsgba_card.js
import { cardInit } from './_card_core.js';

cardInit({
  cardId: 'gcsgba-card',
  key: 'gcsgba',
  title: '大灣區與橫琴新聞',
  jsonPath: '/data/fetch_gcsgba.json',
  fetchScript: 'fetch_gcsgba_cb.js',
  show: 15,
  max: 30,
  autoRefresh: 120,
  tag: 'GBA',
  backgroundColor: '#B5495B',
  scrollThumb: '#FFD700',
  scrollTrack: '#800000',
  icon: '🌉',
  statusBar: true,
  // onNewsClick: (item) => { ... },  // 可自訂點擊行為
  // customRender: (item) => { ... }, // 可自訂顯示格式
  // 其他自訂屬性 ...
});