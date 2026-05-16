const app=document.querySelector('#app');
const title=document.querySelector('#pageTitle');
const navs=[...document.querySelectorAll('.nav')];
const refreshBtn=document.querySelector('#refreshBtn');
const themeToggle=document.querySelector('#themeToggle');
const sidebarToggle=document.querySelector('#sidebarToggle');
const expandedSources={};
const maxExpandedSources=3;

const statusLabels={
  success:'正常',
  normal:'正常',
  planned:'待接入',
  disabled:'暫停',
  failed:'異常',
  stale:'過期',
  fallback:'備援',
  empty:'無資料'
};

const pageTitles={
  sub_main:'總覽',
  sub_all:'全部新聞',
  sub_health:'來源健康',
  sub_settings:'設定'
};

const getJson=async path=>{
  const response=await fetch(path,{cache:'no-store'});
  if(!response.ok)throw new Error(`${path} ${response.status}`);
  const text=await response.text();
  return JSON.parse(text.replace(/^\uFEFF/,''));
};

const h=value=>String(value??'').replace(/[&<>"']/g,char=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[char]));

const setActive=page=>navs.forEach(nav=>nav.classList.toggle('active',nav.dataset.page===page));
const getActivePage=()=>document.querySelector('.nav.active')?.dataset.page??'sub_main';
const getExpanded=domain=>expandedSources[domain]??[];
const sourceCountText=count=>`${count??1} 個來源`;
const statusText=status=>statusLabels[status]??status??'待接入';
const badgeText=source=>(source.badge??source.label?.slice(0,2)??'?').toUpperCase();
const boolText=value=>value===true?'是':value===false?'否':'-';
const settingText=value=>typeof value==='boolean'?boolText(value):h(value);
const fakeTimes=['10 分鐘前','28 分鐘前','45 分鐘前'];
const fakeTitles=['最新消息一','最新消息二','最新消息三'];

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

const fakeItemsForSource=source=>fakeTitles.map((text,index)=>({
  title:`${source.label} ${text}`,
  source:source.label,
  time:fakeTimes[index],
  newsBox:(source.newsBoxIds??[])[0]??''
}));

const registrySourceCount=source=>{
  if(source.sourceType!=='source_group')return 1;
  const endpoints=source.endpoints??[];
  const subSources=endpoints.filter(endpoint=>endpoint.kind==='subsource');
  return subSources.length||endpoints.length||1;
};

const mapRegistrySource=source=>({
  sourceKey:source.sourceKey,
  label:source.label,
  badge:source.badge,
  newsBoxIds:source.newsBoxIds??[],
  sourceType:source.sourceType,
  status:source.status,
  sourceCount:registrySourceCount(source),
  disabled:source.disabled===true,
  description:source.description,
  items:fakeItemsForSource(source)
});

const getRegistrySources=registry=>registry.sources
  .filter(source=>source.enabled===true)
  .filter(source=>source.uiVisible===true)
  .filter(source=>source.sourceRole!=='backup')
  .filter(source=>source.sourceKey&&source.label)
  .map(mapRegistrySource);

const loadARegistry=async()=>{
  try{
    return {sources:getRegistrySources(await getJson('./data/registry/source_registry_a.json'))};
  }catch(error){
    return {sources:[],error:'A 來源登記檔暫時無法載入；B / C 仍可顯示。'};
  }
};

const renderMain=async()=>{
  const data=await getJson('./data/view/view_sub_main.json');
  app.innerHTML=`
    <div class="statusbar">
      <div class="tile"><b>${h(data.stats.sources)}</b><span>來源</span></div>
      <div class="tile"><b>${h(data.stats.todayNew)}</b><span>今日新增</span></div>
      <div class="tile"><b>${h(data.stats.within15)}</b><span>15 分鐘內</span></div>
      <div class="tile"><b>${h(data.stats.normal)}</b><span>正常來源</span></div>
    </div>
    <div class="grid">
      ${data.domains.map(domain=>`
        <section class="card ${h(domain.domain.toLowerCase())}">
          <h2>${h(domain.domain)}. ${h(domain.title)}</h2>
          ${domain.items.map((item,index)=>`
            <div class="item">
              <div>${index+1}. [${h(item.newsBox)}] ${h(item.title)}</div>
              <div class="meta">${h(item.source)} · ${h(item.time)}</div>
            </div>
          `).join('')}
        </section>
      `).join('')}
    </div>
  `;
};

const renderAll=async()=>{
  const data=await getJson('./data/view/view_sub_all.json');
  const aRegistry=await loadARegistry();
  const domains=data.domains.map(domain=>domain.domain==='A'
    ? {...domain,title:'政府政策',sources:aRegistry.sources,registryError:aRegistry.error}
    : domain);

  const draw=()=>{
    app.innerHTML=`
      <div class="sourcewall">
        ${domains.map(domain=>{
          const sources=domain.sources??[];
          const activeKeys=getExpanded(domain.domain);
          const activeSources=activeKeys.map(key=>sources.find(source=>source.sourceKey===key)).filter(Boolean);
          return `
            <section class="card ${h(domain.domain.toLowerCase())} sourcewall-domain">
              <h2>${h(domain.domain)}. ${h(domain.title)}</h2>
              <div class="sourcewall-layout">
                <div class="source-list">
                  ${domain.registryError?`<p class="meta">${h(domain.registryError)}</p>`:''}
                  ${!domain.registryError&&!sources.length?'<p class="meta">目前沒有可顯示的來源。</p>':''}
                  ${sources.map(source=>`
                    <button
                      class="source-button ${activeKeys.includes(source.sourceKey)?'active':''}"
                      data-domain="${h(domain.domain)}"
                      data-source-key="${h(source.sourceKey)}"
                      ${source.disabled?'disabled aria-disabled="true"':''}
                    >
                      <span class="source-badge">${h(badgeText(source))}</span>
                      <span class="source-label">${h(source.label)}</span>
                    </button>
                  `).join('')}
                </div>
                <div class="expanded-source-grid">
                  ${activeSources.map(source=>`
                    <article class="expanded-source-card">
                      <h3>${h(source.label)}</h3>
                      <p>${h(source.description)}</p>
                      <div class="newsbox-tags">
                        ${(source.newsBoxIds??[]).map(id=>`<span>${h(id)}</span>`).join('')}
                      </div>
                      <div class="meta">${h(sourceCountText(source.sourceCount))} · ${h(statusText(source.status))}</div>
                      ${(source.items??[]).slice(0,3).map((item,index)=>`
                        <div class="item">
                          <div>${index+1}. ${h(item.title)}</div>
                          <div class="meta">${h(item.source)} · ${h(item.time)} · ${h(item.newsBox)}</div>
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

    app.querySelectorAll('.source-button:not(:disabled)').forEach(button=>{
      button.onclick=()=>{
        const domain=button.dataset.domain;
        const sourceKey=button.dataset.sourceKey;
        const expanded=getExpanded(domain);
        expandedSources[domain]=expanded.includes(sourceKey)
          ? expanded.filter(key=>key!==sourceKey)
          : [sourceKey,...expanded.filter(key=>key!==sourceKey)].slice(0,maxExpandedSources);
        draw();
      };
    });
  };

  draw();
};

const renderHealth=async()=>{
  const data=await getJson('./data/system/source_health.json');
  app.innerHTML=`
    <table class="table">
      <thead>
        <tr>
          <th>來源</th>
          <th>主域</th>
          <th>分類</th>
          <th>狀態</th>
          <th>上次成功</th>
          <th>下次刷新</th>
        </tr>
      </thead>
      <tbody>
        ${data.sources.map(source=>`
          <tr>
            <td>${h(source.name)}</td>
            <td>${h(source.domain)}</td>
            <td>${h(source.newsBox)}</td>
            <td>${h(statusText(source.status))}</td>
            <td>${h(source.lastSuccess)}</td>
            <td>${h(source.nextRefresh)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

const renderKeyValue=(entries)=>`
  <div class="settings-kv">
    ${entries.map(([key,value])=>`
      <div>
        <span>${h(key)}</span>
        <b>${settingText(value)}</b>
      </div>
    `).join('')}
  </div>
`;

const renderSettings=async()=>{
  let settings;
  try{
    settings=await getJson('./data/system/settings.json');
  }catch(error){
    app.innerHTML=`<section class="card"><h2>設定</h2><p class="error-text">設定檔無法載入：${h(error.message)}</p></section>`;
    return;
  }

  let registry;
  let registryError='';
  try{
    registry=await getJson('./data/registry/source_registry_a.json');
  }catch(error){
    registryError=`A Registry 暫時無法載入：${error.message}`;
  }

  const domains=Object.entries(settings.domains??{});
  const overrides=Object.entries(settings.sourceOverrides??{});
  const sources=registry?.sources??[];
  const enabledSources=sources.filter(source=>source.enabled===true);
  const visibleSources=sources.filter(source=>source.uiVisible===true);
  const sourceGroups=sources.filter(source=>source.sourceType==='source_group');
  const visibleChips=visibleSources.slice(0,8);
  const domainRows=domains.map(([domain,config])=>`
    <tr>
      <td>${h(domain)}</td>
      <td>${h(config.title)}</td>
      <td><span class="color-swatch" style="--swatch:${h(config.color)}"></span>${h(config.color)}</td>
      <td>${h(config.desktopTopLimit)}</td>
      <td>${h(config.mobileTopLimit)}</td>
      <td>${h(config.defaultRefreshMin)}</td>
    </tr>
  `).join('');
  const overrideRows=overrides.map(([sourceKey,config])=>`
    <tr>
      <td>${h(sourceKey)}</td>
      <td>${h(config.refreshMin??'-')}</td>
      <td>${h(config.priority??'-')}</td>
      <td>${h(config.enabled===undefined?'-':boolText(config.enabled))}</td>
      <td>${h(config.uiVisible===undefined?'-':boolText(config.uiVisible))}</td>
    </tr>
  `).join('');

  app.innerHTML=`
    <div class="settings-grid">
      <section class="settings-card">
        <h2>UI 設定</h2>
        ${renderKeyValue([
          ['theme',settings.ui?.theme],
          ['sidebarCollapsed',settings.ui?.sidebarCollapsed],
          ['fontScale',settings.ui?.fontScale],
          ['layoutDensity',settings.ui?.layoutDensity],
          ['maxExpandedSourcesPerDomain',settings.ui?.maxExpandedSourcesPerDomain]
        ])}
      </section>

      <section class="settings-card settings-wide">
        <h2>主域設定</h2>
        <table class="settings-table">
          <thead>
            <tr>
              <th>domain</th>
              <th>title</th>
              <th>color</th>
              <th>desktopTopLimit</th>
              <th>mobileTopLimit</th>
              <th>defaultRefreshMin</th>
            </tr>
          </thead>
          <tbody>${domainRows}</tbody>
        </table>
      </section>

      <section class="settings-card">
        <h2>特殊設定</h2>
        ${renderKeyValue([
          ['B translateTitle',settings.domains?.B?.translateTitle],
          ['B keepOriginalTitle',settings.domains?.B?.keepOriginalTitle],
          ['B blockOnTranslationFail',settings.domains?.B?.blockOnTranslationFail],
          ['C priceRefreshMinOpen',settings.domains?.C?.priceRefreshMinOpen],
          ['C priceRefreshMinClosed',settings.domains?.C?.priceRefreshMinClosed]
        ])}
      </section>

      <section class="settings-card settings-wide">
        <h2>來源覆寫</h2>
        <table class="settings-table">
          <thead>
            <tr>
              <th>sourceKey</th>
              <th>refreshMin</th>
              <th>priority</th>
              <th>enabled</th>
              <th>uiVisible</th>
            </tr>
          </thead>
          <tbody>${overrideRows}</tbody>
        </table>
      </section>

      <section class="settings-card settings-wide">
        <h2>A Registry 摘要</h2>
        ${registryError
          ? `<p class="error-text">${h(registryError)}</p>`
          : `
            <div class="settings-stats">
              <div class="stat-tile"><b>${sources.length}</b><span>total sources</span></div>
              <div class="stat-tile"><b>${enabledSources.length}</b><span>enabled sources</span></div>
              <div class="stat-tile"><b>${visibleSources.length}</b><span>uiVisible sources</span></div>
              <div class="stat-tile"><b>${sourceGroups.length}</b><span>source groups</span></div>
            </div>
            <div class="source-chips">
              ${visibleChips.map(source=>`<span>${h(source.badge??'')} ${h(source.label)}</span>`).join('')}
            </div>
          `}
      </section>
    </div>
  `;
};

const routes={
  sub_main:renderMain,
  sub_all:renderAll,
  sub_health:renderHealth,
  sub_settings:renderSettings
};

const runRoute=async page=>{
  setActive(page);
  title.textContent=pageTitles[page]??'Nova-Lotus';
  try{
    await routes[page]();
  }catch(error){
    app.innerHTML=`<section class="card"><h2>${h(title.textContent)}</h2><p class="error-text">頁面無法載入：${h(error.message)}</p></section>`;
  }
};

navs.forEach(nav=>nav.onclick=()=>runRoute(nav.dataset.page));
refreshBtn.onclick=()=>runRoute(getActivePage());
themeToggle.onclick=()=>setTheme(document.body.dataset.theme==='light'?'dark':'light');
sidebarToggle.onclick=()=>setSidebar(!document.body.classList.contains('sidebar-collapsed'));

runRoute('sub_main');
