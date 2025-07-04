const CARD_ID = 'macaodaily-card';
const DATA_URL = './data/fetch_macaodaily_ws_cb.json';
const DEFAULT_SHOW = 10;
const MAX_SHOW = 22;
let newsData = [];
let lastUpdateTime = null;
let autoRefreshTimer = null;
const AUTO_REFRESH_MINUTES = 5; // 自動每5分鐘刷新

async function fetchNews() {
  try {
    const resp = await fetch(DATA_URL + '?_t=' + Date.now());
    if (!resp.ok) throw new Error('載入失敗');
    const json = await resp.json();
    if (!Array.isArray(json)) throw new Error('資料格式錯誤');
    newsData = json;
    lastUpdateTime = Date.now();
    renderCard();
  } catch (e) {
    renderError('⚠️ 無法讀取新聞資料');
    console.error('[MACAODAILY][ERROR]', e);
  }
}

function renderCard() {
  const card = document.getElementById(CARD_ID);
  if (!card) return;
  const countIcon = card.querySelector('.news-count-icon');
  countIcon.textContent = Math.min(newsData.length, MAX_SHOW);

  updateLastUpdate();
  const newsList = card.querySelector('.news-list');
  newsList.innerHTML = '';
  newsData.slice(0, DEFAULT_SHOW).forEach((item, idx) => {
    let li = document.createElement('li');
    li.innerHTML = `
      <span class="news-rank">${idx + 1}</span>
      <a class="news-title" href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
      <span class="date">${item.pubDate}</span>
    `;
    newsList.appendChild(li);
  });
}

function renderError(msg) {
  const card = document.getElementById(CARD_ID);
  if (!card) return;
  card.querySelector('.news-count-icon').textContent = '0';
  card.querySelector('.card-last-update').textContent = '-- 分鐘前更新';
  card.querySelector('.news-list').innerHTML = `<li>${msg}</li>`;
}

function updateLastUpdate() {
  const card = document.getElementById(CARD_ID);
  if (!card) return;
  if (!lastUpdateTime) {
    card.querySelector('.card-last-update').textContent = '-- 分鐘前更新';
    return;
  }
  let mins = Math.floor((Date.now() - lastUpdateTime) / 60000);
  if (mins < 1) mins = 0;
  card.querySelector('.card-last-update').textContent = `${mins} 分鐘前更新`;
}

async function macaodailyCardInit() {
  const card = document.getElementById(CARD_ID);
  if (!card) return;
  card.querySelector('.news-count-icon').textContent = '0';
  card.querySelector('.news-list').innerHTML = '<li>載入中...</li>';
  card.querySelector('.card-last-update').textContent = '-- 分鐘前更新';
  await fetchNews();
  card.querySelector('.card-refresh').onclick = async function(){
    await fetchNews();
  };
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(() => {
    updateLastUpdate();
    if (lastUpdateTime && (Date.now() - lastUpdateTime > AUTO_REFRESH_MINUTES*60*1000)) {
      fetchNews();
    }
  }, 15000);
}
window.addEventListener('DOMContentLoaded', macaodailyCardInit);