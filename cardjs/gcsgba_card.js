import { cardInit } from './_card_core.js';

cardInit({
  cardId: 'gcsgba-card',
  key: 'gcsgba',
  title: '大灣區與橫琴新聞',
  jsonPath: '/data/fetch_gcsgba.json',
  show: 15,
  max: 30,
  autoRefresh: 120, // 120 分鐘
  tag: 'GBA',
  backgroundColor: '#B5495B',
  scrollThumb: '#FFD700',
  scrollTrack: '#800000',
  icon: '🌉',
  statusBar: true,

  // 標準批次刷新：自動呼叫批次 API
  onRefresh: async function() {
    const res = await fetch('/run-gcsgba', { method: 'POST' });
    const ret = await res.json();
    if (ret.status !== 'OK') {
      alert('大灣區與橫琴新聞合併刷新失敗！');
      throw new Error(ret.stderr || 'gcsgba batch error');
    }
  }
});