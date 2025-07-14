// cardjs/al_ws_card.js - Lotus v1.3.6
import { cardInit } from './_card_core.js';

cardInit({
  cardId:            'al-ws-card',
  key:               'al_ws',
  title:             '立法會質詢',
  jsonPath:          '/data/fetch_al_ws.json',
  fetchScript:       'fetch_al_ws_cb.js',
  show:              15,
  max:               40,
  autoRefresh:       60,  // 60 分鐘
  tag:               '#立法會 #質詢',
  theme:             'default',
  backgroundColor:   '#36563C',
  backgroundTo:      '#36563C',
  newsListBg:        '#fff',
  newsListFontTitle: '#000',
  newsListFontDate:  '#666',
  scrollThumb:       '#FFD700',
  scrollTrack:       '#227D51'
});