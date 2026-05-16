const app=document.querySelector('#app');
const title=document.querySelector('#pageTitle');
const navs=[...document.querySelectorAll('.nav')];
const refreshBtn=document.querySelector('#refreshBtn');
const themeToggle=document.querySelector('#themeToggle');
const sidebarToggle=document.querySelector('#sidebarToggle');
const expandedSources={};

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

const domainTitles={A:'政府政策',B:'AS Roma',C:'財經市場'};
const domainClass=domain=>`domain-${String(domain).toLowerCase()}`;

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
const themeLabel=value=>value==='dark'?'深色':value==='light'?'明亮':value;
const sidebarLabel=value=>value===true?'已收合':value===false?'已展開':'-';
const densityLabel=value=>value==='compact'?'緊湊':value??'-';
const fontScaleLabel=value=>value==='normal'?'標準':value??'-';
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
        <section class="card ${h(domain.domain.toLowerCase())} ${h(domainClass(domain.domain))}">
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
    : {...domain,title:domainTitles[domain.domain]??domain.title});

  const draw=()=>{
    app.innerHTML=`
      <div class="sourcewall">
        ${domains.map(domain=>{
          const sources=domain.sources??[];
          const activeKeys=getExpanded(domain.domain);
          const activeSources=activeKeys.map(key=>sources.find(source=>source.sourceKey===key)).filter(Boolean);
          return `
            <section class="card ${h(domain.domain.toLowerCase())} ${h(domainClass(domain.domain))} sourcewall-domain">
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
          : [sourceKey,...expanded.filter(key=>key!==sourceKey)].slice(0,3);
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

const renderSettingRow=(label,value,tech='')=>`
  <div>
    <span>${h(label)}${tech?`<small>${h(tech)}</small>`:''}</span>
    <b>${h(value)}</b>
  </div>
`;

const renderDomainCard=([domain,config])=>{
  const special=[
    config.translateTitle!==undefined&&['翻譯標題',boolText(config.translateTitle)],
    config.keepOriginalTitle!==undefined&&['保留原題',boolText(config.keepOriginalTitle)],
    config.blockOnTranslationFail!==undefined&&['翻譯失敗阻擋',boolText(config.blockOnTranslationFail)],
    config.priceRefreshMinOpen!==undefined&&['開市價格刷新',`${config.priceRefreshMinOpen} 分鐘`],
    config.priceRefreshMinClosed!==undefined&&['休市價格刷新',`${config.priceRefreshMinClosed} 分鐘`]
  ].filter(Boolean);

  return `
    <article class="domain-setting-card ${h(domainClass(domain))}">
      <div class="domain-setting-head">
        <span class="color-swatch" style="--swatch:${h(config.color)}"></span>
        <div>
          <h3>${h(domain)} ${h(config.title)}</h3>
          <p>預設刷新 ${h(config.defaultRefreshMin)} 分鐘</p>
        </div>
      </div>
      <div class="domain-setting-metrics">
        <span><b>${h(config.desktopTopLimit)}</b>桌面顯示</span>
        <span><b>${h(config.mobileTopLimit)}</b>手機顯示</span>
      </div>
      ${special.length?`
        <div class="domain-specials">
          ${special.map(([label,value])=>`<span>${h(label)}：${h(value)}</span>`).join('')}
        </div>
      `:''}
    </article>
  `;
};

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
    registryError=`A 登記檔暫時無法載入：${error.message}`;
  }

  const domains=Object.entries(settings.domains??{});
  const overrides=Object.entries(settings.sourceOverrides??{});
  const sources=registry?.sources??[];
  const enabledSources=sources.filter(source=>source.enabled===true);
  const visibleSources=sources.filter(source=>source.uiVisible===true);
  const sourceGroups=sources.filter(source=>source.sourceType==='source_group');
  const visibleChips=visibleSources.slice(0,10);
  const maxExpanded=settings.ui?.maxExpandedSourcesPerDomain??3;
  const refreshValues=domains.map(([,config])=>config.defaultRefreshMin).filter(Boolean);
  const minRefresh=refreshValues.length?Math.min(...refreshValues):'-';
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
    <div class="settings-dashboard">
      <section class="settings-hero">
        <div>
          <p class="eyebrow">只讀控制中心</p>
          <h2>設定儀表板</h2>
        </div>
        <span>本階段只讀，不寫入設定檔。</span>
      </section>

      <section class="summary-row">
        <article class="summary-card">
          <span>介面模式</span>
          <b>${h(themeLabel(settings.ui?.theme))}</b>
          <small>目前預設</small>
        </article>
        <article class="summary-card">
          <span>展開來源上限</span>
          <b>${h(maxExpanded)}</b>
          <small>每個主域</small>
        </article>
        <article class="summary-card">
          <span>A 登記檔</span>
          <b>${registryError?'--':h(sources.length)}</b>
          <small>${registryError?'讀取失敗':'已登記來源'}</small>
        </article>
        <article class="summary-card">
          <span>刷新策略</span>
          <b>${h(minRefresh)}</b>
          <small>最快預設分鐘</small>
        </article>
      </section>

      <section class="settings-card">
        <h2>介面設定</h2>
        <div class="settings-kv">
          ${renderSettingRow('介面模式',themeLabel(settings.ui?.theme),'theme')}
          ${renderSettingRow('側欄狀態',sidebarLabel(settings.ui?.sidebarCollapsed),'sidebarCollapsed')}
          ${renderSettingRow('字體大小',fontScaleLabel(settings.ui?.fontScale),'fontScale')}
          ${renderSettingRow('版面密度',densityLabel(settings.ui?.layoutDensity),'layoutDensity')}
          ${renderSettingRow('每區最多展開來源',maxExpanded,'maxExpandedSourcesPerDomain')}
        </div>
      </section>

      <section class="settings-card">
        <h2>主域設定</h2>
        <div class="domain-settings-grid">
          ${domains.map(renderDomainCard).join('')}
        </div>
      </section>

      <section class="settings-card">
        <h2>登記檔摘要</h2>
        ${registryError
          ? `<p class="error-text">${h(registryError)}</p>`
          : `
            <div class="settings-stats">
              <div class="stat-tile"><b>${sources.length}</b><span>全部來源</span></div>
              <div class="stat-tile"><b>${enabledSources.length}</b><span>啟用</span></div>
              <div class="stat-tile"><b>${visibleSources.length}</b><span>顯示</span></div>
              <div class="stat-tile"><b>${sourceGroups.length}</b><span>來源組</span></div>
            </div>
            <div class="source-chips">
              ${visibleChips.map(source=>`<span>${h(source.badge??'')} ${h(source.label)}</span>`).join('')}
            </div>
          `}
      </section>

      <section class="settings-card settings-secondary">
        <h2>來源覆寫</h2>
        <table class="settings-table">
          <thead>
            <tr>
              <th>來源</th>
              <th>刷新分鐘</th>
              <th>優先級</th>
              <th>啟用</th>
              <th>顯示</th>
            </tr>
          </thead>
          <tbody>${overrideRows}</tbody>
        </table>
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
