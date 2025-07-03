// js/macaodaily_card.js
async function runFetchScript(scriptName) {
  try {
    await fetch(`/run-fetch?target=${scriptName}`);
  } catch (err) {
    console.error('爬蟲執行失敗:', err);
  }
}

async function fetchDataAndUpdate() {
  try {
    const resp = await fetch('./data/fetch_macaodaily_ws_cb.json');
    return await resp.json();
  } catch (e) {
    console.error("讀取新聞失敗:", e);
    return [];
  }
}

async function macaodailyCardInit() {
  const card = document.getElementById('macaodaily-card');
  const maxShow = 22;
  const defaultShow = 10;

  await runFetchScript('macaodaily');
  const data = await fetchDataAndUpdate();

  const count = Math.min(data.length, maxShow);
  card.querySelector('.news-count-icon').textContent = count;

  let lastUpdateTime = Date.now();
  function updateLastUpdate() {
    let mins = Math.floor((Date.now() - lastUpdateTime) / 60000);
    card.querySelector('.card-last-update').textContent = `${mins} 分鐘前更新`;
  }

  const newsList = card.querySelector('.news-list');
  newsList.innerHTML = '';
  data.slice(0, defaultShow).forEach(item => {
    let li = document.createElement('li');
    li.innerHTML = `<span class="title">${item.title}</span> <span class="date">${item.pubDate}</span>`;
    li.onclick = () => window.open(item.link, '_blank');
    newsList.appendChild(li);
  });

  card.querySelector('.card-refresh').onclick = async () => {
    lastUpdateTime = Date.now();
    updateLastUpdate();
    await runFetchScript('macaodaily');
    const data = await fetchDataAndUpdate();
    const count = Math.min(data.length, maxShow);
    card.querySelector('.news-count-icon').textContent = count;
    newsList.innerHTML = '';
    data.slice(0, defaultShow).forEach(item => {
      let li = document.createElement('li');
      li.innerHTML = `<span class="title">${item.title}</span> <span class="date">${item.pubDate}</span>`;
      li.onclick = () => window.open(item.link, '_blank');
      newsList.appendChild(li);
    });
  };

  updateLastUpdate();
  setInterval(updateLastUpdate, 60000);
}

window.addEventListener('DOMContentLoaded', macaodailyCardInit);
