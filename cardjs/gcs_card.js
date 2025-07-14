// cardjs/gcs_card.js – Lotus v1.3.6（2025-07-12，調整新聞列表背景為卡片底色 50% 透明度）
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
  theme: 'default',
  /* 卡片背景漸層起始色 → 結束色 */
  backgroundColor: '#FFB11B',
  backgroundTo:    '#FFB11B',
  /* 新聞列表背景、字色 */
  /* 將列表區背景設為卡片主色 50% 透明 */
  newsListFontTitle: '#000000',
  newsListFontDate:  '#666666',
  /* 滾動條顏色 */
  scrollThumb: '#FFD370',
  scrollTrack: '#FFB11B'
});