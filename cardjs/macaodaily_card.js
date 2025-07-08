// cardjs/macaodaily_card.js - Lotus v1.2.8-0710（範本）
import { cardInit } from './_card_core.js'; 
cardInit({
  cardId: 'macaodaily-card',
  key: 'macaodaily',
  title: '澳門日報',
  jsonPath: '/data/fetch_macaodaily.json',
  fetchScript: 'fetch_macaodaily_ws_cb.js',
  show: 15,
  max: 22,
  autoRefresh: 5,
  tag: '#澳門 #即時',
  backgroundColor: '#B5495B',
  scrollThumb: '#F2C7C7',
  scrollTrack: '#B5495B'
});