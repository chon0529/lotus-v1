// cardjs/gcs_card.js - Lotus v1.3.0-ESM
import { cardInit } from './_card_core.js';
cardInit({
  cardId: 'gcs-card',
  key: 'gcs',
  title: '新聞局',
  jsonPath: '/data/fetch_gcs.json',
  fetchScript: 'fetch_gcs_rss_cb.js',
  show: 15,
  max: 22,
  autoRefresh: 5,
  tag: '#官方 #政府 #即時',
  backgroundColor: '#FFB11B',
  scrollThumb: '#FFD370',
  scrollTrack: '#FFB11B'
});