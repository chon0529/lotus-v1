// main.js
async function loadMacauDailyNews() {
  try {
    const res = await fetch('./data/fetch_macaodaily_ws_2.0.json');
    const newsList = await res.json();

    renderMacauDailyCard(newsList);
  } catch (error) {
    console.error('🚨 無法載入澳門日報新聞：', error);
    document.getElementById('macaodaily-card').innerHTML = `<p style="color:white;">⚠️ 載入失敗</p>`;
  }
}

function renderMacauDailyCard(newsList) {
  const card = document.getElementById('macaodaily-card');

  // 計算 1 小時內的新聞數量
  const now = new Date();
  const recentCount = newsList.filter(item => {
    const itemDate = new Date(item.date);
    const diff = (now - itemDate) / (1000 * 60 * 60); // 小時
    return diff <= 1;
  }).length;

  // 最後更新時間
  const lastUpdateText = `更新於 ${formatTimeDiff(now)} 前`;

  // 限制最多 22 則新聞
  const visibleNews = newsList.slice(0, 22);

  // 建立新聞列表 HTML
  const newsHTML = visibleNews.map(item => {
    return `<div class="news-item">
      • <a href="${item.url}" target="_blank">${item.title}</a>
      <span class="news-date">${item.date}</span>
    </div>`;
  }).join('');

  // 組合卡片 HTML
  card.innerHTML = `
    <div class="card-header">
      <a href="http://www.macaodaily.com/" target="_blank" class="card-title">📌 澳門日報</a>
      <div class="card-icons">
        <span class="circle-number">${recentCount}</span>
        <button class="refresh-btn" onclick="refreshMacauDaily()">🔄</button>
      </div>
    </div>
    <div class="card-subtitle">#澳門 #即時<br><span>${lastUpdateText}</span></div>
    <div class="news-list">${newsHTML}</div>
  `;
}

// 刷新卡片內容
function refreshMacauDaily() {
  document.getElementById('macaodaily-card').innerHTML = '<p style="color:white;">♻️ 更新中...</p>';
  setTimeout(() => loadMacauDailyNews(), 500);
}

// 格式化時間差（幾分鐘前、幾小時前）
function formatTimeDiff(time) {
  const diffMs = new Date() - time;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 60) return `${diffMin} 分鐘`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} 小時`;
}

// ⏱ 初始載入
loadMacauDailyNews();
