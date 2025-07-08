// macaucabletv_card.js
const CARD_ID = 'macaucabletv_card';
const FETCH_URL = './data/fetch_macaucabletv_ws_cb.json';
const REFRESH_MINUTES = 60; // 自動刷新間隔
const BG_COLOR = '#323e2e';

let timer = null;
let nextUpdate = 0;

// 卡片初始化
window.cardInit = function cardInit_macaucabletv() {
  const card = document.getElementById(CARD_ID);
  if (!card) return;

  card.style.background = BG_COLOR;
  card.style.color = '#fff';
  card.style.fontFamily = '"HanaMin", "Noto Sans TC", "微軟正黑體", sans-serif';
  card.innerHTML = `<div class="status">讀取中...</div>`;

  fetchAndRender();

  // 啟動倒數
  if (timer) clearInterval(timer);
  timer = setInterval(updateCountdown, 1000);

  function updateCountdown() {
    const left = Math.max(0, Math.round((nextUpdate - Date.now()) / 1000));
    const bar = card.querySelector('.countdown');
    if (bar) bar.textContent = left > 0
      ? `下次自動更新：${Math.floor(left/60)}分${(left%60).toString().padStart(2, '0')}秒`
      : '即將重新整理...';
    if (left <= 0) {
      fetchAndRender();
    }
  }

  function fetchAndRender() {
    card.innerHTML = `<div class="status">載入中...</div>`;
    fetch(FETCH_URL + '?_=' + Date.now())
      .then(r => r.json())
      .then(list => {
        nextUpdate = Date.now() + REFRESH_MINUTES * 60 * 1000;
        renderNews(list);
      })
      .catch(e => {
        card.innerHTML = `<div class="status" style="color:#faa">載入失敗：${e.message}</div>`;
      });
  }

  function renderNews(list) {
    if (!list || !list.length) {
      card.innerHTML = `<div class="status">暫無新聞</div>
        <div class="countdown" style="font-size:12px;margin-top:8px"></div>`;
      return;
    }
    card.innerHTML = `
      <div style="padding:10px 10px 5px 10px;">
        <div style="font-size:18px;font-weight:bold;margin-bottom:6px;letter-spacing:2px;">澳門有線電視</div>
        <div class="countdown" style="font-size:12px;margin-bottom:10px;"></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${list.slice(0, 8).map(item => `
            <div style="background:rgba(0,0,0,0.12);border-radius:9px;padding:7px 12px;">
              <a href="${item.link}" target="_blank" style="color:#ffd;word-break:break-all;font-size:15px;font-weight:500;text-decoration:none;">${item.title}</a>
              <span style="float:right;font-size:12px;color:#ccc;margin-left:6px">${formatDate(item.pubDate)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function formatDate(str) {
    // 今日則顯示時分，否則 MM-DD
    if (!str) return '';
    const d = new Date(str);
    const today = new Date();
    if (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    ) {
      return str.slice(11, 16); // 假設格式含時分
    }
    return str.slice(5, 10);
  }
};