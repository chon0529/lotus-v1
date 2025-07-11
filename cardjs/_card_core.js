// cardjs/_card_core.js – Lotus v1.3.6（2025-07-12， 修正滚动 & 渐变 & 标题/时间分色 ）
export function cardInit({
  cardId,
  key,
  title,
  jsonPath,
  fetchScript,
  show = 12,            // 可视条数
  max = 35,             // 最多加载条数（含历史补充）
  autoRefresh = 5,      // 分钟
  tag,
  theme = 'default',

  /* 下面 5 个变量可在单卡脚本里传入覆盖 */
  backgroundColor = '#333',    // 渐变起始色
  backgroundTo    = '#fff',    // 渐变结束色
  newsListBg      = '#fff',    // 列表背景色
  newsListFontTitle = '#000',  // 标题文字色
  newsListFontDate  = '#666',  // 时间文字色

  /* 滚动条颜色 */
  scrollThumb = '#666',
  scrollTrack = '#ddd'
}) {
  const wrap = document.getElementById(cardId);
  wrap.innerHTML = `
    <div class="card card-live theme-${theme}"
         style="
           --card-bg-from: ${backgroundColor};
           --card-bg-to:   ${backgroundTo};
           --newslist-bg:        ${newsListBg};
           --newslist-font-title:${newsListFontTitle};
           --newslist-font-date: ${newsListFontDate};
           --scroll-thumb: ${scrollThumb};
           --scroll-track: ${scrollTrack};
         ">
      <div class="news-list-area">
        <ul class="news-list"></ul>
      </div>
      <div class="card-footer">
        <div class="footer-row1">
          <span class="card-title">${title}</span>
          <span class="footer-btns">
            <button class="footer-btn btn-refresh" title="刷新">⭮</button>
            <button class="footer-btn btn-move"    title="移动">✥</button>
          </span>
        </div>
        <div class="footer-row2">
          <span class="card-tags">${tag}</span>
          <span class="card-last-update"></span>
        </div>
      </div>
    </div>
  `;

  const area = wrap.querySelector('.news-list-area');
  const ul   = wrap.querySelector('.news-list');
  const now  = () => dayjs().tz('Asia/Macau');
  let countdownTimer = null;

  // 设置底部文字
  function setStatus(txt) {
    wrap.querySelector('.card-last-update').textContent = txt;
  }

  // 更新「几分钟前」
  async function updateLast() {
    try {
      const data = await fetch('/data/last_updated.json').then(r=>r.json());
      const info = data[key] || {};
      let txt = '尚未更新';
      if (info.lastSuccess) {
        const m = now().diff(dayjs(info.lastSuccess),'minute');
        txt = m<1?'剛剛更新':`${m} 分鐘前更新`;
      }
      setStatus(txt);
    } catch {
      setStatus('');
    }
  }

  // 渲染新闻条目
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

    ul.innerHTML = '';
    mainList.slice(0, max).forEach((item, idx) => {
      const li = document.createElement('li');
      const a  = document.createElement('a');
      const sp = document.createElement('span');

      // 标题
      a.href = item.link;
      a.target = '_blank';
      a.rel    = 'noopener';
      a.textContent = `${idx+1}. ${item.title}`;

      // 日期
      let p = String(item.pubDate||item.date||'');
      if (/^\d{1,2}:\d{2}$/.test(p)) { /* 保持 */ }
      else if (/^\d{4}-\d{2}-\d{2}/.test(p)) p = p.slice(5,10);
      else p = p||'--';
      sp.textContent = `– ${p}`;

      li.append(a, sp);
      ul.append(li);
    });

    if (!ul.children.length) {
      setStatus('暫無新聞');
    }
    // 渲染完毕后，重新计算高度并开启滚动
    await applyListHeight();
  }

  // 根据第一行高度动态设置列表区 max/min height
  async function applyListHeight() {
    await Promise.resolve();  // 等待DOM刷新
    const firstLi = ul.querySelector('li');
    if (!firstLi) return;
    const rowH = firstLi.getBoundingClientRect().height;
    area.style.maxHeight = `${max*rowH}px`;
    area.style.minHeight = `${show*rowH}px`;
    area.style.overflowY  = 'auto';
    // 确保 scroll 监听只绑定一次
    if (!area._scrollInited) {
      area._scrollInited = true;
      enableScrollThumb(area);
    }
  }

  // 给指定容器绑定「滚动时显示滚动条、静止后隐藏」
  function enableScrollThumb(el) {
    let t = null;
    el.addEventListener('scroll', () => {
      el.classList.add('show-scroll');
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove('show-scroll'), 1200);
    });
    // 初始化隐藏
    el.classList.remove('show-scroll');
  }

  // 倒计时并自动刷新
  function startCountdown(sec) {
    clearInterval(countdownTimer);
    let s = sec;
    countdownTimer = setInterval(() => {
      if (s <= 0) {
        clearInterval(countdownTimer);
        fetchAndUpdate(true);
      } else {
        const m  = String(Math.floor(s/60)).padStart(2,'0'),
              ss = String(s%60).padStart(2,'0');
        setStatus(`下次自動更新 ${m}:${ss}`);
        s--;
      }
    }, 1000);
  }

  // 请求数据并更新
  async function fetchAndUpdate(force = false) {
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

  // —— 初始化 —— //
  (async ()=>{
    await showData();
    await updateLast();
    // 启动倒计时或立即更新
    let diff = Infinity;
    try {
      const info = (await fetch('/data/last_updated.json').then(r=>r.json()))[key]||{};
      diff = now().diff(dayjs(info.lastSuccess),'minute');
    } catch {}
    if (diff >= autoRefresh) {
      fetchAndUpdate(true);
    } else {
      startCountdown((autoRefresh - diff)*60);
    }
    // 绑定刷新按钮
    wrap.querySelectorAll('.btn-refresh').forEach(btn =>
      btn.addEventListener('click', ()=>fetchAndUpdate(true))
    );
  })();
}
