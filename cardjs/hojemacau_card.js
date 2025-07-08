// cardjs/hojemacau_card.js - Lotus v1.0.0-0710
import { cardInit } from './_card_core.js'; 
cardInit({
  cardId: 'hojemacau-card',
  key: 'hojemacau',
  title: 'Hoje Macau',
  jsonPath: '/data/fetch_hojemacau.json',
  fetchScript: 'fetch_hojemacau_ws_cb.js',
  show: 15,
  max: 48,
  autoRefresh: 30,
  tag: '#Sociedade #Política',
  backgroundColor: '#8E354A',
  scrollThumb: '#B07E8B',
  scrollTrack: '#8E354A'
});