// cardjs/committees_card.js - Lotus v1.0.0-0710
import { cardInit } from './_card_core.js';
cardInit({
  cardId: 'committees-card',
  key: 'committees',                     // last_updated.json 裡的 key
  title: '三委會新聞',
  jsonPath: '/data/fetch_committees.json',
  fetchScript: 'fetch_committees_cb.js',  // 實際合併抓取腳本
  show: 12,
  max: 24,
  autoRefresh: 120,                       // 預設120分鐘
  tag: '#CAEU #CPU #CRU',
  backgroundColor: '#86C166',
  scrollThumb: '#A8D8B9',
  scrollTrack: '#86C166'
});