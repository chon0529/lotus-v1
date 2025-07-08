// cardjs/chengpou_card.js - Lotus v1.2.6-0709
import { cardInit } from './_card_core.js'; 
cardInit({
  cardId: 'chengpou-card',
  key: 'chengpou',
  title: '正報',
  jsonPath: '/data/fetch_chengpou.json',
  fetchScript: 'fetch_chengpou_ws_cb.js',
  show: 15,
  max: 30,
  autoRefresh: 30,
  tag: '#澳門 #正報',
  backgroundColor: '#0D5661',
  scrollThumb: '#56ABB1',
  scrollTrack: '#0D5661'
});