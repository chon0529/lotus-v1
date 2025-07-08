// al_ws_card.js - Lotus 專用
import { cardInit } from './_card_core.js';

cardInit({
  cardId: 'al-ws-card',
  key: 'al_ws',
  title: '立法會書面質詢',
  jsonPath: '/data/fetch_al_ws.json',
  fetchScript: 'fetch_al_ws_cb.js',
  show: 15,
  max: 40,
  autoRefresh: 60,         // 60 分鐘
  tag: '立法會質詢',
  backgroundColor: '#36563C',
  scrollThumb: '#FFD700',
  scrollTrack: '#227D51'
});