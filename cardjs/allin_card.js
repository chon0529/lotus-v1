// cardjs/allin_card.js - Lotus v1.2.6-0709
import { cardInit } from './_card_core.js'; 
cardInit({
  cardId: 'allin-card',
  key: 'allin',
  title: 'Allin Media',
  jsonPath: '/data/fetch_allin.json',
  fetchScript: 'fetch_allin_ws_cb.js',
  show: 15,
  max: 22,
  autoRefresh: 30,
  tag: '#澳門 #博彩',
  backgroundColor: '#FFB11B',
  scrollThumb: '#FFE8AC',
  scrollTrack: '#FFB11B'
});