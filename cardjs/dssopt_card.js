import { cardInit } from './_card_core.js';

cardInit({
  cardId:            'dssopt-card',
  key:               'dssopt',
  title:             '土地 - 城規 - 工程',
  jsonPath:          '/data/fetch_dssopt.json',
  show:              15,
  max:               30,
  autoRefresh:       120, // 120 分鐘
  tag:               '#土地 #工程 #城規',
  theme:             'default',
  backgroundColor:   '#227D51',
  backgroundTo:      '#227D51',
  newsListBg:        '#fff',
  newsListFontTitle: '#000',
  newsListFontDate:  '#666',
  scrollThumb:       '#FFD700',
  scrollTrack:       '#074b31',

  // 加入刷新前觸發的 callback
  onRefresh: async function() {
    // 1. 叫伺服器執行批次抓取+合併
    const res = await fetch('/run-dssopt', { method: 'POST' });
    const ret = await res.json();
    if (ret.status !== 'OK') {
      alert('伺服器批次失敗！' + (ret.stderr || ret.status));
      throw new Error('Dssopt batch error: ' + (ret.stderr || ret.status));
    }
    // 2. 執行完才 fetch 最新 jsonPath（即 /data/fetch_dssopt.json）
    // 若 cardInit 自動處理，不需額外撰寫
  }
});