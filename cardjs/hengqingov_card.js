// hengqingov_card.js  for Lotus v1
import { cardInit, fmtDate, timeDiffText } from './cardjs_common.js';

const CARD_ID = 'hengqingov_card';
const FETCH_KEY = 'hengqingov';
const DATA_PATH = './data/fetch_hengqingov_ws_cb.json';
const REFRESH_MINUTES = 60;     // 自動刷新 60 分鐘
const BG_COLOR = '#33A6B8';

// 卡片初始化
cardInit({
  cardId: CARD_ID,
  fetchKey: FETCH_KEY,
  dataPath: DATA_PATH,
  bgColor: BG_COLOR,
  refreshMinutes: REFRESH_MINUTES,
  title: '橫琴官網新聞',
  render(news, { lastSuccess, nextUpdate }) {
    if (!news || !news.length) return '<div class="empty">暫無新聞</div>';
    return `
      <ul class="news-list">
        ${news.map(item => `
          <li class="news-item">
            <a href="${item.link}" target="_blank" class="news-link">
              <span class="news-title">${item.title}</span>
              <span class="news-date">${fmtDate(item.pubDate)}</span>
            </a>
          </li>
        `).join('')}
      </ul>
      <div class="status-bar">
        <span>上次更新：${timeDiffText(lastSuccess)}</span>
        <span>下次：${timeDiffText(nextUpdate, true)}</span>
      </div>
    `;
  }
});