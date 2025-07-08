// dssopt_card.js
import { cardInit } from './_card_core.js';

cardInit({
  cardId: 'dssopt-card',
  key: 'dssopt',
  title: 'DSSOPT 土地工務／公共建設／城規／工程',
  jsonPath: '/data/fetch_dssopt.json',
  fetchScript: 'fetch_dssopt_cb.js',
  show: 15,
  max: 30,
  autoRefresh: 120,  // 120 分鐘
  tag: 'DSSOPT',
  backgroundColor: '#227D51',
  scrollThumb: '#FFD700',
  scrollTrack: '#074b31'
});