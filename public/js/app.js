const app=document.querySelector('#app');
const title=document.querySelector('#pageTitle');
const navs=[...document.querySelectorAll('.nav')];
const refreshBtn=document.querySelector('#refreshBtn');
const themeToggle=document.querySelector('#themeToggle');
const sidebarToggle=document.querySelector('#sidebarToggle');
const expandedSources={};
const statusLabels={success:'正常',normal:'正常',planned:'待接入',disabled:'暫停',failed:'異常'};

const getJson=async p=>{
  const r=await fetch(p,{cache:'no-store'});
  if(!r.ok)throw new Error(`${p} ${r.status}`);
  return r.json();
};

const setActive=p=>navs.forEach(n=>n.classList.toggle('active',n.dataset.page===p));
const getExpanded=domain=>expandedSources[domain]??[];
const sourceCountText=count=>`${count} 個來源`;
const statusText=status=>statusLabels[status]??status;
const badgeText=source=>source.badge??source.label.slice(0,2).toUpperCase();

const setTheme=theme=>{
  document.body.dataset.theme=theme;
  themeToggle.textContent=theme==='light'?'深色':'明亮';
  localStorage.setItem('novaLotusTheme',theme);
};

const setSidebar=collapsed=>{
  document.body.classList.toggle('sidebar-collapsed',collapsed);
  sidebarToggle.textContent=collapsed?'›':'‹';
  sidebarToggle.setAttribute('aria-label',collapsed?'展開側欄':'收合側欄');
  localStorage.setItem('novaLotusSidebar',collapsed?'collapsed':'expanded');
};

setTheme(localStorage.getItem('novaLotusTheme')==='light'?'light':'dark');
setSidebar(localStorage.getItem('novaLotusSidebar')==='collapsed');

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
  const d=await getJson('./data/view/view_sub_all.json');
  const draw=()=>{
    app.innerHTML=`
      <div class="sourcewall">
        ${d.domains.map(domain=>{
          const activeKeys=getExpanded(domain.domain);
          const activeSources=activeKeys.map(key=>domain.sources.find(source=>source.sourceKey===key)).filter(Boolean);
          return `
            <section class="card ${domain.domain.toLowerCase()} sourcewall-domain">
              <h2>${domain.domain}. ${domain.title}</h2>
              <div class="sourcewall-layout">
                <div class="source-list">
                  ${domain.sources.map(source=>`
                    <button
                      class="source-button ${activeKeys.includes(source.sourceKey)?'active':''}"
                      data-domain="${domain.domain}"
                      data-source-key="${source.sourceKey}"
                      ${source.disabled?'disabled aria-disabled="true"':''}
                    >
                      <span class="source-badge">${badgeText(source)}</span>
                      <span class="source-label">${source.label}</span>
                    </button>
                  `).join('')}
                </div>
                <div class="expanded-source-grid">
                  ${activeSources.map(source=>`
                    <article class="expanded-source-card">
                      <h3>${source.label}</h3>
                      <p>${source.description}</p>
                      <div class="newsbox-tags">
                        ${source.newsBoxIds.map(id=>`<span>${id}</span>`).join('')}
                      </div>
                      <div class="meta">${sourceCountText(source.sourceCount)} · ${statusText(source.status)}</div>
                      ${source.items.map((it,i)=>`
                        <div class="item">
                          <div>${i+1}. ${it.title}</div>
                          <div class="meta">${it.source} · ${it.time} · ${it.newsBox}</div>
                        </div>
                      `).join('')}
                    </article>
                  `).join('')}
                </div>
              </div>
            </section>
          `;
        }).join('')}
      </div>
    `;

    app.querySelectorAll('.source-button:not(:disabled)').forEach(btn=>{
      btn.onclick=()=>{
        const domain=btn.dataset.domain;
        const sourceKey=btn.dataset.sourceKey;
        const expanded=getExpanded(domain);
        expandedSources[domain]=expanded.includes(sourceKey)
          ? expanded.filter(key=>key!==sourceKey)
          : [sourceKey,...expanded.filter(key=>key!==sourceKey)].slice(0,3);
        draw();
      };
    });
  };
  draw();
};

const renderHealth=async()=>{
  title.textContent='來源健康';
  const d=await getJson('./data/system/source_health.json');
  app.innerHTML=`
    <table class="table">
      <thead>
        <tr>
          <th>來源</th>
          <th>主域</th>
          <th>分類</th>
          <th>狀態</th>
          <th>最近成功</th>
          <th>下次</th>
        </tr>
      </thead>
      <tbody>
        ${d.sources.map(s=>`
          <tr>
            <td>${s.name}</td>
            <td>${s.domain}</td>
            <td>${s.newsBox}</td>
            <td>${statusText(s.status)}</td>
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
refreshBtn.onclick=()=>routes[document.querySelector('.nav.active').dataset.page]();
themeToggle.onclick=()=>setTheme(document.body.dataset.theme==='light'?'dark':'light');
sidebarToggle.onclick=()=>setSidebar(!document.body.classList.contains('sidebar-collapsed'));

renderMain().catch(e=>app.innerHTML=`<pre>${e.message}</pre>`);
