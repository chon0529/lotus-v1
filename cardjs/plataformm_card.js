// plataformm_card.js
const CARD_KEY = 'plataformm';
const FETCH_API = '/api/data/fetch_plataformm_ws_cb.json';
const FETCH_INTERVAL_MIN = 60; // 單位: 分鐘
const BG_COLOR = '#206f99';

let timer = null;
let nextUpdate = null;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  if (!dateStr) return '';
  // 今日顯示 hh:mm，否則 mm-dd
  if (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  ) {
    return d.toLocaleTimeString('zh-Hant', { hour: '2-digit', minute: '2-digit' });
  }
  return `${d.getMonth() + 1}-${d.getDate()}`;
}

function setCountdown(elem, mins) {
  let left = mins * 60;
  elem.textContent = `下次自動更新：${mins} 分鐘後`;
  clearInterval(timer);
  timer = setInterval(() => {
    left--;
    if (left <= 0) {
      elem.textContent = '即將更新…';
      clearInterval(timer);
    } else {
      elem.textContent = `下次自動更新：${Math.floor(left / 60)}:${(left % 60).toString().padStart(2, '0')}`;
    }
  }, 1000);
}

async function fetchAndRender() {
  const card = document.querySelector(`#card-${CARD_KEY}`);
  if (!card) return;

  // 狀態
  const status = card.querySelector('.card-status');
  status.textContent = '載入中…';

  // 取得資料
  let newsList = [];
  try {
    const res = await fetch(FETCH_API + '?_t=' + Date.now());
    newsList = await res.json();
    status.textContent = `共 ${newsList.length} 則新聞`;
  } catch (e) {
    status.textContent = '載入失敗';
    return;
  }

  // 列表區
  const list = card.querySelector('.card-list');
  list.innerHTML = '';
  newsList.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card-item';
    div.innerHTML = `
      <a href="${item.link}" target="_blank" rel="noopener">
        <span class="title">${item.title}</span>
        <span class="date">${formatDate(item.pubDate)}</span>
      </a>
    `;
    list.appendChild(div);
  });
}

export function cardInit_plataformm() {
  // 動態產生卡片 DOM
  if (document.querySelector(`#card-${CARD_KEY}`)) return;

  const wrap = document.createElement('div');
  wrap.id = `card-${CARD_KEY}`;
  wrap.className = 'lotus-card';
  wrap.style.background = BG_COLOR;
  wrap.style.color = '#fff';
  wrap.style.borderRadius = '1.5em';
  wrap.style.fontFamily = "'HanaMin', 'Noto Sans TC', '微軟正黑體', serif";
  wrap.style.padding = '18px 18px 12px 18px';
  wrap.style.marginBottom = '18px';
  wrap.style.minWidth = '330px';
  wrap.style.maxWidth = '390px';
  wrap.style.boxShadow = '0 3px 16px 0 rgba(0,0,0,.10)';
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.innerHTML = `
    <div class="card-head" style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:1.3em;font-weight:700;letter-spacing:1px">Plataforma Media 澳門新聞</span>
      <span class="card-status" style="font-size:.95em;opacity:.82"></span>
    </div>
    <div class="card-list" style="margin-top:12px"></div>
    <div class="card-foot" style="margin-top:16px;font-size:.92em;opacity:.8;display:flex;align-items:center;">
      <span class="countdown"></span>
      <button class="refresh-btn" style="margin-left:auto;background:#fff1;border:none;padding:3px 13px;border-radius:1em;color:#fff;cursor:pointer;font-size:.96em;">手動刷新</button>
    </div>
  `;
  document.querySelector('#lotus-board').appendChild(wrap);

  // 刷新、倒數
  const status = wrap.querySelector('.card-status');
  const countdown = wrap.querySelector('.countdown');
  const refreshBtn = wrap.querySelector('.refresh-btn');
  let interval = FETCH_INTERVAL_MIN;

  const autoUpdate = () => {
    fetchAndRender();
    setCountdown(countdown, interval);
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      fetchAndRender();
      setCountdown(countdown, interval);
    }, interval * 60 * 1000);
  };

  refreshBtn.onclick = () => {
    fetchAndRender();
    setCountdown(countdown, interval);
  };

  fetchAndRender();
  setCountdown(countdown, interval);
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    fetchAndRender();
    setCountdown(countdown, interval);
  }, interval * 60 * 1000);
}

// 若你用全域卡片自動載入，可加進 window
window.cardInit_plataformm = cardInit_plataformm;