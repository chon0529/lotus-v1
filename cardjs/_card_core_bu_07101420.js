// cardjs/_card_core.js - Lotus v1.2.8-ESM（改寫：完全 ESM，不再 window 掛載）
// 注意：index.html 需 <script type="module"> 載入，且 dayjs 與 plugin 順序要正確

// 請確認在 index.html <head> 先這樣設：
// dayjs.extend(window.dayjs_plugin_utc); dayjs.extend(window.dayjs_plugin_timezone); dayjs.tz.setDefault('Asia/Macau');

export function cardInit({
  cardId,
  key,
  title,
  jsonPath,
  fetchScript,
  show = 15,
  max = 22,
  autoRefresh = 5,
  tag,
  backgroundColor = '#333',
  scrollThumb = '#F2C7C7',
  scrollTrack = '#B5495B'
}) {
  const wrap = document.getElementById(cardId);
  wrap.innerHTML = `
    <div class="card" style="--card-bg-color:${backgroundColor}">
      <div class="card-header">
        <h2>${title}</h2>
        <button class="refresh-btn" title="手動刷新">🔄</button>
      </div>
      <div class="card-meta">
        <span class="tags">${tag}</span>
        <span class="last-update"></span>
      </div>
      <ul class="news-list"></ul>
      <div class="card-status"></div>
    </div>`;

  const now = () => dayjs().tz('Asia/Macau');
  let countdownId = null;

  setTimeout(() => {
    const ul = wrap.querySelector('.news-list');
    if (!ul) return;
    ul.style.setProperty('--scroll-thumb', scrollThumb);
    ul.style.setProperty('--scroll-track', scrollTrack);
    ul.style.maxHeight = `${max * 32}px`;
    ul.style.minHeight = `${show * 32}px`;
  }, 0);

  function setStatus(txt) {
    wrap.querySelector('.card-status').textContent = txt;
  }

  async function updateLast() {
    try {
      const data = await fetch('/data/last_updated.json').then(r=>r.json());
      const info = data[key] || {};
      let txt = '尚未更新';
      if (info.lastSuccess) {
        const m = now().diff(dayjs(info.lastSuccess), 'minute');
        txt = m < 1 ? '剛剛更新' : `${m} 分鐘前更新`;
      }
      wrap.querySelector('.last-update').textContent = txt;
    } catch {
      wrap.querySelector('.last-update').textContent = '';
    }
  }

  async function showData() {
    let mainList = [];
    const hisPath = jsonPath.replace('fetch_', 'his_fetch_');
    try { mainList = await fetch(jsonPath).then(r=>r.json()); } catch{}
    if (mainList.length < max) {
      let hisList = [];
      try { hisList = await fetch(hisPath).then(r=>r.json()); } catch{}
      const seen = new Set(mainList.map(i=>i.link));
      const extra = hisList.filter(i=>!seen.has(i.link)).slice(0, max - mainList.length);
      mainList = mainList.concat(extra);
    }
    const ul = wrap.querySelector('.news-list');
    ul.innerHTML = '';
    mainList.slice(0, max).forEach((item, idx) => {
      const li = document.createElement('li');
      const a  = document.createElement('a');
      const s  = document.createElement('span');
      a.href = item.link;
      a.textContent = `${idx+1}. ${item.title}`;
      a.target = '_blank'; a.rel = 'noopener';
      let p = String(item.pubDate || item.date || '');
      if (/^\d{1,2}:\d{2}$/.test(p))         s.textContent = p;
      else if (/^\d{4}-\d{2}-\d{2}/.test(p)) s.textContent = p.slice(5,10);
      else                                  s.textContent = p || '--';
      li.append(a, s);
      ul.append(li);
    });
    if (!wrap.querySelector('.news-list').children.length) {
      setStatus('暫無新聞');
    }
  }

  function startCountdown(sec) {
    clearInterval(countdownId);
    let s = sec;
    countdownId = setInterval(() => {
      if (s <= 0) {
        clearInterval(countdownId);
        fetchAndUpdate(true);
      } else {
        const m = String(Math.floor(s/60)).padStart(2,'0');
        const ss = String(s%60).padStart(2,'0');
        setStatus(`還剩約 ${m}:${ss} 將更新`);
        s--;
      }
    }, 1000);
  }

  async function fetchAndUpdate(force=false) {
    setStatus(force ? '手動刷新中...' : '正在更新中...');
    try {
      const res = await fetch(`/run-fetch?script=${fetchScript}&force=${force?1:0}&interval=${autoRefresh}`);
      const ret = await res.json();
      if (!ret.success) throw new Error(ret.stderr||'未知錯誤');
    } catch {
      setStatus('DNS 失敗，5 分鐘後重試');
      return startCountdown(5*60);
    }
    await showData();
    await updateLast();
    startCountdown(autoRefresh*60);
  }

  (async () => {
    await showData();
    await updateLast();
    let diff = Infinity;
    try {
      const data = await fetch('/data/last_updated.json').then(r=>r.json());
      const info = data[key] || {};
      diff = now().diff(dayjs(info.lastSuccess), 'minute');
    } catch{}
    if (diff >= autoRefresh) fetchAndUpdate(true);
    else startCountdown((autoRefresh - diff)*60);
    wrap.querySelector('.refresh-btn').addEventListener('click', ()=>fetchAndUpdate(true));
  })();
}