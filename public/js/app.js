const app=document.querySelector('#app');
const title=document.querySelector('#pageTitle');
const navs=[...document.querySelectorAll('.nav')];

const getJson=async p=>{
  const r=await fetch(p,{cache:'no-store'});
  if(!r.ok)throw new Error(`${p} ${r.status}`);
  return r.json();
};

const setActive=p=>navs.forEach(n=>n.classList.toggle('active',n.dataset.page===p));

const renderMain=async()=>{
  title.textContent='總覽';
  const d=await getJson('./data/view/view_sub_main.json');
  app.innerHTML=`
    <div class="statusbar">
      <div class="tile"><b>${d.stats.sources}</b><span>所有來源</span></div>
      <div class="tile"><b>${d.stats.todayNew}</b><span>今日新增</span></div>
      <div class="tile"><b>${d.stats.within15}</b><span>15分鐘內</span></div>
      <div class="tile"><b>${d.stats.normal}</b><span>正常來源</span></div>
    </div>
    <div class="grid">
      ${d.domains.map(x=>`
        <section class="card ${x.domain.toLowerCase()}">
          <h2>${x.domain}. ${x.title}</h2>
          ${x.items.map((it,i)=>`
            <div class="item">
              <div>${i+1}. [${it.newsBox}] ${it.title}</div>
              <div class="meta">${it.source} · ${it.time}</div>
            </div>
          `).join('')}
        </section>
      `).join('')}
    </div>
  `;
};

const renderAll=async()=>{
  title.textContent='全部新聞';
  app.innerHTML=`
    <section class="card a">
      <h2>A. 政府政策</h2>
      <p class="meta">NewsWall：政府公布 / 中文新聞 / 外語新聞 / 區域合作 / 委員會工作。</p>
    </section>
    <br>
    <section class="card b">
      <h2>B. AS Roma</h2>
      <p class="meta">NewsWall：新聞消息 / 官方 / 比賽列表。X 記者消息暫不實作。</p>
    </section>
    <br>
    <section class="card c">
      <h2>C. 財經市場</h2>
      <p class="meta">NewsWall：股價 Watchlist / 財經新聞 / AI 半導體科技股。</p>
    </section>
  `;
};

const renderHealth=async()=>{
  title.textContent='來源健康';
  const d=await getJson('./data/system/source_health.json');
  app.innerHTML=`
    <table class="table">
      <thead>
        <tr>
          <th>Source</th>
          <th>Domain</th>
          <th>NewsBox</th>
          <th>Status</th>
          <th>Last Success</th>
          <th>Next</th>
        </tr>
      </thead>
      <tbody>
        ${d.sources.map(s=>`
          <tr>
            <td>${s.name}</td>
            <td>${s.domain}</td>
            <td>${s.newsBox}</td>
            <td>${s.status}</td>
            <td>${s.lastSuccess}</td>
            <td>${s.nextRefresh}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

const routes={sub_main:renderMain,sub_all:renderAll,sub_health:renderHealth};

navs.forEach(n=>n.onclick=()=>{setActive(n.dataset.page);routes[n.dataset.page]();});
document.querySelector('#refreshBtn').onclick=()=>routes[document.querySelector('.nav.active').dataset.page]();

renderMain().catch(e=>app.innerHTML=`<pre>${e.message}</pre>`);
