// cardjs/_card_core.js
export function cardInit({ cardId, jsonPath, show = 10, max = 20, autoRefresh = 5 }) {
  const card = document.getElementById(cardId);
  if (!card) return;
  let newsData = [];
  let lastUpdateTime = null;
  let timer = null;

  // 時間顯示（強制 GMT+8）
  function timeAgo() {
    if (!lastUpdateTime) return '-- 分鐘前更新';
    const diff = Math.floor((Date.now() - lastUpdateTime) / 60000);
    return `${diff < 1 ? 0 : diff} 分鐘前更新`;
  }

  // 抓 JSON
  async function fetchNews() {
    try {
      const resp = await fetch(jsonPath + '?_t=' + Date.now());
      if (!resp.ok) throw new Error('載入失敗');
      newsData = await resp.json();
      lastUpdateTime = Date.now();
      render();
    } catch {
      card.querySelector('.news-list').innerHTML = `<li>⚠️ 載入失敗</li>`;
    }
  }

  function render() {
    card.querySelector('.news-count-icon').textContent = Math.min(newsData.length, max);
    card.querySelector('.card-last-update').textContent = timeAgo();
    const ul = card.querySelector('.news-list');
    ul.innerHTML = '';
    newsData.slice(0, show).forEach((item, idx) => {
      let li = document.createElement('li');
      li.innerHTML = `
        <span class="news-rank">${idx + 1}</span>
        <a class="news-title" href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
        <span class="date">${item.pubDate}</span>
      `;
      ul.appendChild(li);
    });
  }

  // 綁定 refresh
  card.querySelector('.card-refresh').onclick = async function() {
    await fetchNews();
    restartTimer();
  };

  function restartTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(fetchNews, autoRefresh * 60 * 1000);
  }

  // 自動/初始化
  fetchNews();
  restartTimer();
}