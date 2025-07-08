// cardjs/aamacau_card.js - Lotus v1.3.0-0710
import { cardInit } from './_card_core.js'; 
cardInit({
  cardId: 'aamacau-card',
  key: 'aamacau',
  title: '論盡澳門',
  jsonPath: '/data/fetch_aamacau.json',
  fetchScript: 'fetch_aamacau_ws_cb.js',
  show: 15,
  max: 30,
  autoRefresh: 15,
  tag: '#澳門 #即時',
  backgroundColor: '#B5495B',
  scrollThumb: '#F2C7C7',
  scrollTrack: '#B5495B'
});