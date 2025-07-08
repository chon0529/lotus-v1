// cardjs/mopostd_card.js - Lotus v1.0.0-0710
import { cardInit } from './_card_core.js'; 
cardInit({
  cardId: 'mopostd-card',
  key: 'mopostd',
  title: 'Macau Post Daily',
  jsonPath: '/data/fetch_mopostd.json',
  fetchScript: 'fetch_mopostd_ws_cb.js',
  show: 15,
  max: 30,
  autoRefresh: 60,
  tag: '#MoPostDaily',
  backgroundColor: '#8E354A',
  scrollThumb: '#B07E8B',
  scrollTrack: '#8E354A'
});