// cardjs/macaudailytimes_card.js - Lotus v1.0.0-0710
import { cardInit } from './_card_core.js'; 
cardInit({
  cardId: 'macaudailytimes-card',
  key: 'macaudailytimes',
  title: 'Macau Daily Times',
  jsonPath: '/data/fetch_macaudailytimes.json',
  fetchScript: 'fetch_macaudailytimes_ws_cb.js',
  show: 15,
  max: 30,
  autoRefresh: 45,
  tag: '#澳門',
  backgroundColor: '#64363C',
  scrollThumb: '#8E695B',
  scrollTrack: '#64363C'
});