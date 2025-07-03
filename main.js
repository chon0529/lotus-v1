import fetchMacDaily from './fetch_macaodaily_ws_2.0.js';

const card = document.getElementById('macaodaily-card');
const newsList = document.getElementById('news-list');
const newCountEl = document.getElementById('new-count');
const lastUpdatedEl = document.getElementById('last-updated');
const refreshBtn = document.getElementById('refresh-btn');

let currentItems = [];

// 計算「X 分鐘前更新」
function formatRelativeTime(date) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return '剛剛更新';
  return `${diffMin} 分鐘前更新`;
}

// 渲染卡片內容
async function renderCard() {
  try {
    refreshBtn.disabled = true;
    const items = await fetchMacDaily(); // 假設回傳 { title, date: 'YYYY-MM-DD', url }
    const parsed = items.map(it => ({
      ...it,
      dateObj: new Date(it.date),
    }));
    // 計算一小時內新增
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const newCount = parsed.filter(it => it.dateObj.getTime() >= oneHourAgo).length;
    newCountEl.textContent = newCount;

    // last updated
    lastUpdatedEl.textContent = formatRelativeTime(new Date());

    // 列表最多 22 條，預設顯示最新 15 條
    const display = parsed.slice(0, 15);
    currentItems = parsed;

    // 清空舊項目
    newsList.innerHTML = '';
    display.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      a.target = '_blank';
      a.textContent = item.title;
      a.style.color = 'inherit';
      a.style.textDecoration = 'none';

      const dateSpan = document.createElement('span');
      dateSpan.textContent = item.date; // YYYY-MM-DD

      li.appendChild(a);
      li.appendChild(dateSpan);
      newsList.appendChild(li);
    });
  } catch (e) {
    console.error('抓取或解析失敗', e);
  } finally {
    refreshBtn.disabled = false;
  }
}

// 綁定「立即更新」按鈕
refreshBtn.addEventListener('click', () => {
  renderCard();
});

// 首次載入
renderCard();