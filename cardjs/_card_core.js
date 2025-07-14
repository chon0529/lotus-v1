// cardjs/_card_core.js – Lotus v1.3.6（優化 onRefresh 判斷）
/* global dayjs, window */
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);
dayjs.tz.setDefault('Asia/Macau');

export function cardInit({
  cardId, key, title, jsonPath, fetchScript,
  show = 12, max = 35, autoRefresh = 5, tag,
  theme = 'default',
  backgroundColor = '#333', backgroundTo = '#fff',
  newsListBg = '#fff', newsListFontTitle = '#000', newsListFontDate = '#666',
  scrollThumb = 'rgba(0,0,0,0.2)', scrollTrack = 'transparent',
  onRefresh   // 👈注意一定要在參數解構這裡寫
}) {
  const wrap = document.getElementById(cardId);
  wrap.innerHTML = `
    <div class="card card-live theme-${theme}"
         style="
           --card-bg-from: ${backgroundColor};
           --card-bg-color: ${backgroundColor};
           --card-bg-to:    ${backgroundTo};
           --newslist-bg:         ${newsListBg};
           --newslist-font-title: ${newsListFontTitle};
           --newslist-font-date:  ${newsListFontDate};
           --scroll-thumb:        ${scrollThumb};
           --scroll-track:        ${scrollTrack};
         ">
      <div class="news-list-area">
        <ul class="news-list"></ul>
      </div>
      <div class="card-footer">
        <div class="footer-row1">
          <span class="card-title">${title}</span>
          <span class="footer-btns">
            <button class="footer-btn btn-refresh" title="手動刷新">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button class="footer-btn btn-move" title="移動">
              <i class="bi bi-arrows-move"></i>
            </button>
          </span>
        </div>
        <div class="footer-row2">
          <span class="card-tags">${tag}</span>
          <div class="footer-statuses">
            <span class="card-last-update"></span>
            <span class="separator"> | </span>
            <span class="card-next-update"></span>
          </div>
        </div>
      </div>
    </div>`;

  const now = () => dayjs().tz();
  let countdownId;

  function setStatus(txt) {
    wrap.querySelector('.card-last-update').textContent = txt;
  }

  async function updateLast() {
    try {
      const data = await fetch('/data/last_updated.json').then(r=>r.json());
      const info = data[key] || {};
      let txt = '尚未更新';
      if (info.lastSuccess) {
        const m = now().diff(dayjs(info.lastSuccess),'minute');
        txt = m<1?'剛剛更新':`${m} 分鐘前更新`;
      }
      wrap.querySelector('.card-last-update').textContent = txt;
    } catch {
      wrap.querySelector('.card-last-update').textContent = '';
    }
  }

  function showSkeleton(count = 5) {
    const ul = wrap.querySelector('.news-list');
    ul.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const li = document.createElement('li');
      li.classList.add('skeleton');
      li.innerHTML = `<div class="sk-title"></div><div class="sk-date"></div>`;
      ul.append(li);
    }
  }

  async function showData() {
    let mainList = [];
    const hisPath = jsonPath.replace('fetch_','his_fetch_');
    try { mainList = await fetch(jsonPath).then(r=>r.json()); } catch{}
    if (mainList.length < max) {
      let hisList = [];
      try { hisList = await fetch(hisPath).then(r=>r.json()); } catch{}
      const seen = new Set(mainList.map(n=>n.link));
      mainList = mainList.concat(
        hisList.filter(n=>!seen.has(n.link)).slice(0, max-mainList.length)
      );
    }
    const ul = wrap.querySelector('.news-list');
    ul.innerHTML = '';
    mainList.slice(0, max).forEach((item, idx) => {
      const li = document.createElement('li');
      const a  = document.createElement('a');
      const sp = document.createElement('span');
      a.href = item.link; 
      a.target='_blank'; 
      a.rel='noopener';
      let p = String(item.pubDate||item.date||'');
      if (/^\d{4}-\d{2}-\d{2}/.test(p)) p=p.slice(5,10);
      else if (!/^\d{1,2}:\d{2}$/.test(p)) p=p||'--';
      a.textContent = `${idx+1}. ${item.title}`;
      sp.textContent = `– ${p}`;
      li.append(a, sp);
      ul.append(li);
    });
    if (!ul.children.length) setStatus('暫無新聞');
    enableScrollOnArea();
  }

  function enableScrollOnArea() {
    const ul = wrap.querySelector('.news-list');
    ul.classList.remove('show-scroll');
    ul.onwheel = ul.ontouchmove = () => {
      ul.classList.add('show-scroll');
      clearTimeout(ul._timer);
      ul._timer = setTimeout(() => ul.classList.remove('show-scroll'), 1200);
    };
  }

  function startCountdown(sec) {
    clearInterval(countdownId);
    let s = sec;
    countdownId = setInterval(() => {
      if (s <= 0) {
        clearInterval(countdownId);
        if (typeof onRefresh === 'function') {
          onRefresh();
        } else {
          fetchAndUpdate(true);
        }
      } else {
        const m = String(Math.floor(s/60)).padStart(2,'0'),
              ss = String(s%60).padStart(2,'0');
        wrap.querySelector('.card-next-update').textContent = `下次自動更新 ${m}:${ss}`;
        s--;
      }
    }, 1000);
  }

  async function fetchAndUpdate(force=false) {
    if (!fetchScript || fetchScript === 'undefined') {
      setStatus('未設定 fetchScript，無法刷新！');
      return;
    }
    setStatus(force?'手動刷新中...':'正在更新中...');
    try {
      const res = await fetch(
        `/run-fetch?script=${fetchScript}&force=${force?1:0}&interval=${autoRefresh}`
      );
      const ret = await res.json();
      if (!ret.success) throw new Error(ret.stderr||'錯誤');
    } catch {
      setStatus('DNS 失敗，5 分鐘後重試');
      return startCountdown(300);
    }
    await showData();
    await updateLast();
    startCountdown(autoRefresh*60);
  }

  // 初始化
  (async ()=>{
    await showData(); await updateLast();
    let diff=Infinity;
    try {
      const info = (await fetch('/data/last_updated.json').then(r=>r.json()))[key]||{};
      diff=now().diff(dayjs(info.lastSuccess),'minute');
    }catch{}
    diff>=autoRefresh
      ? (typeof onRefresh === 'function' ? onRefresh() : fetchAndUpdate(true))
      : startCountdown((autoRefresh-diff)*60);

    // 按鈕刷新
    wrap.querySelector('.btn-refresh').onclick = ()=>{
      if (typeof onRefresh === 'function') return onRefresh();
      fetchAndUpdate(true);
    };
  })();
}