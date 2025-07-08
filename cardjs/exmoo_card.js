// cardjs/exmoo_card.js - Lotus v1.0.1-0709
import { cardInit } from './_card_core.js'; 
cardInit({
  cardId: 'exmoo-card',
  key: 'exmoo',
  title: '力報',
  jsonPath: '/data/fetch_exmoo.json',
  fetchScript: 'fetch_exmoo_ws_cb.js',
  show: 15,
  max: 24,
  autoRefresh: 5,
  tag: '#澳門 #力報',
  backgroundColor: '#B1B479',
  scrollThumb: '#E5E9BB',
  scrollTrack: '#B1B479'
});