// cardjs/jtm_card.js - Lotus v1.3.0-0710
import { cardInit } from './_card_core.js'; 
cardInit({
  cardId: 'jtm-card',
  key: 'jtm',                     // 對應 last_updated.json 裡的 jtm 欄位
  title: 'Jornal Tribuna de Macau',
  jsonPath: '/data/fetch_jtm.json',
  fetchScript: 'fetch_jtm_ws_cb.js',
  show: 15,
  max: 22,
  autoRefresh: 15,
  tag: '#JTM',
  backgroundColor: '#0D5661',
  scrollThumb: '#407B85',
  scrollTrack: '#0D5661'
});