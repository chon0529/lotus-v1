// cardjs/committees_card.js - Lotus v1.3.6
import { cardInit } from './_card_core.js';

cardInit({
  cardId:            'committees-card',
  key:               'committees',
  title:             '委員會消息',
  jsonPath:          '/data/fetch_committees.json',
  show:              12,
  max:               24,
  autoRefresh:       120, // 120 分鐘
  tag:               '#CAEU #CPU #CRU',
  theme:             'default',
  backgroundColor:   '#86C166',
  backgroundTo:      '#86C166',
  newsListBg:        '#fff',
  newsListFontTitle: '#000',
  newsListFontDate:  '#666',
  scrollThumb:       '#A8D8B9',
  scrollTrack:       '#86C166',

  // 自定義刷新前 hook
  onRefresh: async function() {
    // Step 1: 先叫伺服器跑批次
    const res = await fetch('/run-committees', { method: 'POST' });
    const ret = await res.json();
    if (ret.status !== 'OK') {
      alert('伺服器批次更新失敗！' + (ret.stderr || ret.status));
      throw new Error('Committees batch error: ' + (ret.stderr || ret.status));
    }
    // Step 2: 成功後自動 fetch 最新 jsonPath（cardInit 內建即可）
  }
});