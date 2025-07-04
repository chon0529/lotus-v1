// cardjs/macaodaily_card.js

const dayjs = window.dayjs;

const cardId = 'macaodaily-card';
const jsonPath = './data/fetch_macaodaily_ws_cb.json';
const autoRefreshMinutes = 5;

const card = document.getElementById(cardId);
const newsListEl = card.querySelector('.news-list');
const newsCountEl = card.querySelector('.news-count-icon');
const lastUpdateEl = card.querySelector('.card-last-update');
const refreshBtn = card.querySelector('.card-refresh');
const statusEl = card.querySelector('.card-status');

let lastUpdateTime = null;
let nextRefreshCountdown = autoRefreshMinutes * 60;
let autoRefreshTimer = null;

async function fetchNewsData() {
  try {
    statusEl.textContent = '現正抓取新聞中...';
    const res = await fetch(jsonPath + '?t=' + Date.now());
    if (!res.ok) throw new Error('讀取失敗');
    const data = await res.json();
    statusEl.textContent = '新聞載入完成';
    return data;
  } catch (err) {
    statusEl.textContent = '讀取新聞失敗';
    console.error('Fetch error:', err);
    return null;
  }
}

function renderNewsList(news) {
  if (!news || news.length === 0) {
    newsListEl.innerHTML = '<li>無新聞資料</li>';
    newsCountEl.textContent = '0';
    return;
  }
  newsCountEl.textContent = news.length;

  let html = '';
  news.slice(0, 22).forEach((item, idx) => {
    html += `<li>
      <span class="news-rank">${idx + 1}</span>
      <a class="news-title" href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
      <span class="date">${item.pubDate}</span>
    </li>`;
  });
  newsListEl.innerHTML = html;
}

function updateLastUpdateTimeDisplay() {
  if (!lastUpdateTime) {
    lastUpdateEl.textContent = '-- 分鐘前更新';
    return;
  }
  const diffMins = Math.floor((Date.now() - lastUpdateTime) / 60000);
  lastUpdateEl.textContent = diffMins > 0 ? `${diffMins} 分鐘前更新` : '剛剛更新';
}

function updateNextRefreshCountdownDisplay() {
  if (nextRefreshCountdown <= 0) {
    statusEl.textContent = '即將自動更新...';
    return;
  }
  const mins = Math.floor(nextRefreshCountdown / 60);
  const secs = nextRefreshCountdown % 60;
  statusEl.textContent = `還剩約 ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} 將更新`;
}

async function refreshNews(force = false) {
  // 檢查是否超過自動更新間隔
  const now = Date.now();
  if (!force && lastUpdateTime && (now - lastUpdateTime) < autoRefreshMinutes * 60 * 1000) {
    // 不重抓，直接更新顯示時間與倒數
    updateLastUpdateTimeDisplay();
    nextRefreshCountdown = Math.floor((autoRefreshMinutes * 60) - (now - lastUpdateTime) / 1000);
    updateNextRefreshCountdownDisplay();
    return;
  }
  
  // 強制抓取資料
  statusEl.textContent = '現正抓取新聞中...';
  const news = await fetchNewsData();
  if (news) {
    renderNewsList(news);
    lastUpdateTime = Date.now();
    updateLastUpdateTimeDisplay();
    nextRefreshCountdown = autoRefreshMinutes * 60;
    updateNextRefreshCountdownDisplay();
  } else {
    statusEl.textContent = '抓取新聞失敗，請稍後重試';
  }
}

function startAutoRefreshTimer() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(() => {
    if (nextRefreshCountdown > 0) {
      nextRefreshCountdown--;
      updateNextRefreshCountdownDisplay();
      updateLastUpdateTimeDisplay();
    } else {
      refreshNews(false);
    }
  }, 1000);
}

// 監聽刷新按鈕，強制刷新並重置倒數
refreshBtn.addEventListener('click', async () => {
  statusEl.textContent = '手動刷新中...';
  await refreshNews(true);
  nextRefreshCountdown = autoRefreshMinutes * 60;
  updateNextRefreshCountdownDisplay();
});

// 初始化卡片
async function init() {
  await refreshNews(false);
  startAutoRefreshTimer();
}

// 啟動
init();
