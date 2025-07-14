// cardjs/dssopt_card.js - Lotus v1.3.6
import { cardInit } from './_card_core.js';

cardInit({
  cardId:            'dssopt-card',
  key:               'dssopt',
  title:             '土地 - 工務 - 城規 - 工程',
  jsonPath:          '/data/fetch_dssopt.json',
  fetchScript:       'fetch_dssopt_cb.js',
  show:              15,
  max:               30,
  autoRefresh:       120, // 120 分鐘
  tag:               '#DSSOPT #工程',
  theme:             'default',
  backgroundColor:   '#227D51',
  backgroundTo:      '#227D51',
  newsListBg:        '#fff',
  newsListFontTitle: '#000',
  newsListFontDate:  '#666',
  scrollThumb:       '#FFD700',
  scrollTrack:       '#074b31'
});