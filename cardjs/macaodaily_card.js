import { cardInit } from './_card_core.js';

cardInit({
  cardId: 'macaodaily-card',
  key: 'macaodaily',
  title: '澳門日報',
  jsonPath: '/data/fetch_macaodaily.json',
  fetchScript: 'fetch_macaodaily_ws_cb.js',
  show: 12,
  max: 35,
  autoRefresh: 5,
  tag: '#澳門 #即時',

  backgroundColor: '#DB4D6D',  // 渐变起点色
  backgroundTo:    '#DB4D6D',     // 渐变终点色
  newsListBg:        '#fff',
  newsListFontTitle:'#000',
  newsListFontDate: '#666',
  scrollThumb:     '#F2C7C7',
  scrollTrack:     '#B5495B'
});
