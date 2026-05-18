const app=document.querySelector('#app');
const title=document.querySelector('#pageTitle');
const sidebar=document.querySelector('.sidebar');
const ensureNavigation=()=>{
  const subAll=sidebar?.querySelector('[data-page="sub_all"]');
  if(subAll&&!sidebar.querySelector('[data-page="sub_72h"]')){
    const button=document.createElement('button');
    button.type='button';
    button.dataset.page='sub_72h';
    button.className='nav';
    button.innerHTML='<span class="nav-full">72 小時</span><span class="nav-short">72</span>';
    sidebar.insertBefore(button,subAll);
  }
  const all=sidebar?.querySelector('[data-page="sub_all"]');
  if(all)all.innerHTML='<span class="nav-full">全部來源</span><span class="nav-short">源</span>';
  const health=sidebar?.querySelector('[data-page="sub_health"]');
  if(health)health.innerHTML='<span class="nav-full">來源監控</span><span class="nav-short">監</span>';
};
ensureNavigation();
const navs=[...document.querySelectorAll('.nav')];
const refreshBtn=document.querySelector('#refreshBtn');
const themeToggle=document.querySelector('#themeToggle');
const sidebarToggle=document.querySelector('#sidebarToggle');
const topbarActions=document.querySelector('.topbar-actions');
const expandedSources={};
const homeTabs={A:'all',B:'all',C:'all'};
const HOME_ITEM_CAP=50;
const HOME_DOMAIN_CAPS={A:50,B:35,C:35};
const RECENT_72H_MAX=50;
const RECENT_WINDOW_HOURS=73;
const HEALTH_SOURCE_CARD_CAP=22;
let currentPage='sub_main';
let recentFilter='all';
let recentSort='priority';
let recentCategory='all';
let recentTag='all';
let healthStatusFilter='all';
let healthDomainFilter='all';

const statusLabels={success:'正常',normal:'正常',planned:'待接入',disabled:'暫停',failed:'異常',stale:'過期',fallback:'備援',empty:'無資料'};
const pageTitles={sub_main:'總覽',sub_72h:'72 小時新聞',sub_all:'全部來源',sub_health:'來源監控',sub_settings:'設定',recent_72h:'72 小時新聞'};
const domainTitles={A:'政府政策',B:'AS Roma',C:'財經市場'};
const domainClass=domain=>`domain-${String(domain).toLowerCase()}`;

const getJson=async path=>{
  const response=await fetch(path,{cache:'no-store'});
  if(!response.ok)throw new Error(`${path} ${response.status}`);
  const text=await response.text();
  return JSON.parse(text.replace(/^\uFEFF/,''));
};
const getOptionalJson=async(path,fallback)=>{
  try{return await getJson(path)}
  catch{return fallback}
};

const h=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const linkAttrs=item=>item?.url?` role="link" tabindex="0" data-url="${h(item.url)}"`:'';
const normalizePage=page=>page==='recent_72h'?'sub_72h':page;
const setActive=page=>navs.forEach(nav=>nav.classList.toggle('active',nav.dataset.page===normalizePage(page)));
const getActivePage=()=>currentPage;
const getExpanded=domain=>expandedSources[domain]??[];
const sourceCountText=count=>`${count??1} 個來源`;
const statusText=status=>statusLabels[status]??status??'待接入';
const badgeText=source=>String(source.badge??source.label?.slice(0,2)??source.name?.slice(0,2)??'SRC').toUpperCase();
const isLocalSourceIconPath=path=>typeof path==='string'
  && !/^https?:\/\//i.test(path)
  && /^(?:\.\/)?\/?assets\/icons\/sources\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:svg|webp)$/i.test(path);
const getSourceIcon=source=>{
  const icon=source.icon??{};
  const fallbackText=String(icon.fallbackText??source.fallbackText??badgeText(source)).trim()||'SRC';
  const alt=String(icon.alt??source.label??source.name??fallbackText).trim()||fallbackText;
  const type=['svg','webp'].includes(icon.type)?icon.type:'fallback';
  const src=isLocalSourceIconPath(icon.src)?icon.src:'';
  return src&&type!=='fallback'
    ? {type,src,alt,fallbackText}
    : {type:'fallback',src:'',alt,fallbackText};
};
const renderSourceIcon=(source,options={})=>{
  const icon=getSourceIcon(source);
  const sizeClass=options.size==='sm'||options.size==='compact'
    ? ' source-icon-sm'
    : options.size==='lg'||options.size==='large'
      ? ' source-icon-lg'
      : '';
  if(icon.src){
    return `<span class="source-icon${sizeClass} source-icon-has-img">
      <span class="source-icon-fallback">${h(icon.fallbackText)}</span>
      <img class="source-icon-img" src="${h(icon.src)}" alt="${h(icon.alt)}" loading="lazy" onerror="this.parentElement.classList.remove('source-icon-has-img');this.remove()">
    </span>`;
  }
  return `<span class="source-icon${sizeClass} source-icon-fallback">${h(icon.fallbackText)}</span>`;
};
const boolText=value=>value===true?'是':value===false?'否':'-';
const themeLabel=value=>value==='dark'?'深色':value==='light'?'明亮':value;
const sidebarLabel=value=>value===true?'已收合':value===false?'已展開':'-';
const densityLabel=value=>value==='compact'?'緊湊':value??'-';
const fontScaleLabel=value=>value==='normal'?'標準':value??'-';
const fakeTimes=['10 分鐘前','28 分鐘前','45 分鐘前'];
const fakeTitles=['最新消息一','最新消息二','最新消息三'];
const SOURCE_CARD_CAP=22;
const fontScaleLabels={0:'最小',1:'偏小',2:'標準',3:'偏大',4:'最大'};
const fontScaleKey='novaLotus.fontScale';

const fontControl=document.createElement('div');
const fontMinus=document.createElement('button');
const fontPlus=document.createElement('button');
const fontSlider=document.createElement('div');
const fontSteps=Object.entries(fontScaleLabels).map(([level,label])=>{
  const step=document.createElement('button');
  step.type='button';
  step.className='font-scale-step';
  step.dataset.level=level;
  step.setAttribute('aria-label',`設定字體大小：${label}`);
  step.title=label;
  step.innerHTML='<span></span>';
  return step;
});
fontControl.className='font-scale-control';
fontMinus.type='button';
fontPlus.type='button';
fontMinus.className='font-scale-btn';
fontPlus.className='font-scale-btn';
fontMinus.textContent='T−';
fontPlus.textContent='T+';
fontMinus.setAttribute('aria-label','縮小字體');
fontPlus.setAttribute('aria-label','放大字體');
fontMinus.title='縮小字體';
fontPlus.title='放大字體';
fontSlider.className='font-scale-slider';
fontSlider.setAttribute('role','group');
fontSlider.setAttribute('aria-label','設定字體大小：最小 / 偏小 / 標準 / 偏大 / 最大');
fontSteps.forEach(step=>fontSlider.append(step));
fontControl.append(fontMinus,fontSlider,fontPlus);
topbarActions?.insertBefore(fontControl,themeToggle);

const normalizeFontScale=value=>{
  const scale=Number.parseInt(value,10);
  return Number.isFinite(scale)?Math.min(4,Math.max(0,scale)):2;
};
const getFontScale=()=>normalizeFontScale(document.body.dataset.fontScale??localStorage.getItem(fontScaleKey));
const updateFontScaleControls=scale=>{
  fontMinus.hidden=scale<=0;
  fontPlus.hidden=scale>=4;
  fontSlider.style.setProperty('--font-step',scale);
  fontSteps.forEach(step=>{
    const stepLevel=Number.parseInt(step.dataset.level,10);
    step.classList.toggle('active',stepLevel===scale);
    step.classList.toggle('filled',stepLevel<=scale);
    step.setAttribute('aria-current',stepLevel===scale?'true':'false');
  });
};
const setFontScale=value=>{
  const scale=normalizeFontScale(value);
  document.body.dataset.fontScale=String(scale);
  localStorage.setItem(fontScaleKey,String(scale));
  updateFontScaleControls(scale);
  if(currentPage==='sub_settings')renderSettings();
};

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
setFontScale(localStorage.getItem(fontScaleKey)??2);

const domainBadge=domain=>`<span class="domain-badge ${h(domainClass(domain))}">${h(domain)}</span>`;
const timeText=value=>{
  if(!value)return '--:--';
  try{
    return new Intl.DateTimeFormat('zh-HK',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Macau'}).format(new Date(value));
  }catch(error){
    return String(value).slice(11,16);
  }
};
const refreshMeta=meta=>`更新於 ${h(timeText(meta?.lastUpdatedAt))}｜下次 ${h(timeText(meta?.nextRefreshAt))}`;
const itemTag=item=>item.tag??'';
const ageMinutes=time=>{
  const text=String(time??'');
  const minute=text.match(/^(\d+)\s*分鐘前$/);
  if(minute)return Number(minute[1]);
  const hour=text.match(/^(\d+)\s*小時前$/);
  if(hour)return Number(hour[1])*60;
  const minuteZh=text.match(/^(\d+)\s*分鐘前$/);
  if(minuteZh)return Number(minuteZh[1]);
  const hourZh=text.match(/^(\d+)\s*小時前$/);
  if(hourZh)return Number(hourZh[1])*60;
  return 9999;
};
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
  icon:source.icon,
  iconPath:source.iconPath??null,
  newsBoxIds:source.newsBoxIds??[],
  sourceType:source.sourceType,
  status:source.status,
  sourceCount:registrySourceCount(source),
  refreshMin:source.refreshMin,
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
  const tabs=data.focusGrid?.tabs??{};
  const refreshMap=data.focusGrid?.refreshStatus??{};
  const sectionMeta=data.focusGrid?.sections??{};
  const system=data.systemStatus??{};
  const domains=(data.domains??[]).map(domain=>({
    ...domain,
    items:(domain.items??[]).map(item=>({...item,domain:domain.domain}))
  }));
  const hotItems=(data.hotItems?.length?data.hotItems:domains.flatMap(domain=>domain.items))
    .map(item=>({...item,domain:item.domain??''}));
  const tabMap=Object.fromEntries(Object.entries(tabs).map(([domain,list])=>[
    domain,
    Object.fromEntries(list.map(tab=>[tab.id,tab.label]))
  ]));
  const categoryName=item=>tabMap[item.domain]?.[item.newsBox]??item.categoryName??item.newsBox??'';
  const sectionSubtitle=domain=>sectionMeta[domain]?.subtitle??'';
  const countsFor=(domain,items)=>Object.fromEntries((tabs[domain]??[]).map(tab=>[
    tab.id,
    tab.id==='all'?items.length:items.filter(item=>item.newsBox===tab.id).length
  ]));
  const metaFor=(domain,tab)=>refreshMap[domain]?.[tab]??refreshMap[domain]?.all??{};
  const capForDomain=domain=>HOME_DOMAIN_CAPS[domain]??HOME_ITEM_CAP;
  const listMarker=(rows,cap)=>rows.length===0
    ? '<p class="list-empty">沒有資料</p>'
    : rows.length<cap
      ? '<p class="list-end">沒有更多了</p>'
      : '';

  const tabButton=(domain,tab,counts)=>`
    <button
      type="button"
      class="news-tab ${homeTabs[domain]===tab.id?'active':''}"
      data-domain="${h(domain)}"
      data-tab="${h(tab.id)}"
      ${tab.disabled?'disabled aria-disabled="true"':''}
    ><span>${h(tab.label)}</span><b>${h(counts[tab.id]??0)}</b></button>
  `;

  const newsRow=(item,index)=>`
    <div class="news-row"${linkAttrs(item)}>
      <span class="news-row-no">${h(String(index+1).padStart(2,'0'))}</span>
      <div class="news-row-body">
        <strong>${itemTag(item)?`<em>${h(itemTag(item))}</em>`:''}${h(item.title)}</strong>
        <small>${h(item.source)} · ${h(categoryName(item))} · ${h(item.time)}</small>
      </div>
    </div>
  `;

  const newsBox=domain=>{
    const activeTab=homeTabs[domain.domain]??'all';
    const items=activeTab==='all'
      ? domain.items
      : domain.items.filter(item=>item.newsBox===activeTab);
    const cap=capForDomain(domain.domain);
    const shownItems=items.slice(0,cap);
    const listBody=`${shownItems.map(newsRow).join('')}${listMarker(shownItems,cap)}`;
    const counts=countsFor(domain.domain,domain.items);
    const meta=metaFor(domain.domain,activeTab);
    return `
      <article class="newsbox-card ${h(domainClass(domain.domain))} newsbox-${h(domain.domain.toLowerCase())}">
        <div class="newsbox-head">
          <div>
            <div class="section-titleline">
              ${domainBadge(domain.domain)}
              <h2>${h(domain.title)}</h2>
              <button type="button" class="view-72h" data-filter="${h(domain.domain)}">72h 全部 →</button>
            </div>
            <p>${h(sectionSubtitle(domain.domain))}</p>
          </div>
          <div class="newsbox-tools">
            <div class="newsbox-time-row">
              <span>${refreshMeta(meta)}</span>
              <button type="button" class="newsbox-refresh" aria-label="${h(domain.title)} 立即刷新">⭮</button>
            </div>
          </div>
        </div>
        <div class="news-tabs" aria-label="${h(domain.title)} 分類">
          ${(tabs[domain.domain]??[{id:'all',label:'全部'}]).filter(tab=>!tab.disabled).map(tab=>tabButton(domain.domain,tab,counts)).join('')}
        </div>
        <div class="newsbox-list soft-scroll">
          ${listBody}
        </div>
      </article>
    `;
  };
  const cappedHotItems=hotItems.slice(0,HOME_ITEM_CAP);
  const hotTop=cappedHotItems[0];
  const hotMedium=cappedHotItems.slice(1,5);
  const hotRest=cappedHotItems.slice(5);
  const hotMeta=refreshMap.hot??{};
  const hotTiers=sectionMeta.hot?.tiers??['優先閱讀','正在升溫','全站最新'];
  const hotRow=(item,index)=>`
    <div class="hot-row"${linkAttrs(item)}>
      <span class="news-row-no">${h(String(index+6).padStart(2,'0'))}</span>
      ${domainBadge(item.domain)}
      <div>
        <strong>${itemTag(item)?`<em>${h(itemTag(item))}</em>`:''}${h(item.title)}</strong>
        <small>${h(item.source)} · ${h(item.time)}</small>
      </div>
    </div>
  `;
  const hotMarker=listMarker(cappedHotItems,HOME_ITEM_CAP);
  const hotRestBody=`${hotRest.map(hotRow).join('')}${hotMarker}`;

  app.innerHTML=`
    <div class="home-dashboard">
      <section class="opsbar">
        <div class="ops-main">
          <b>今日情報</b>
          <span><strong>${h(data.stats.todayNew)}</strong> 新增</span>
          <span><strong>${h(data.stats.within15)}</strong> 條 15 分鐘內</span>
          <span><strong>${h(data.stats.normal)}</strong> 正常源</span>
          <span class="warn-dot"><strong>${h(data.stats.abnormal??0)}</strong> 異常</span>
          <span>最後更新 ${h(timeText(system.lastUpdatedAt))}</span>
        </div>
        <div class="ops-actions">
          <button type="button" class="ops-refresh">全局刷新</button>
          <details class="ops-debug">
            <summary aria-label="開發狀態">···</summary>
            <div>${(system.debug??[]).map(text=>`<span>${h(text)}</span>`).join('')}</div>
          </details>
        </div>
      </section>

      <section class="focus-grid">
        <div class="focus-left">
          ${newsBox(domains.find(domain=>domain.domain==='A')??{domain:'A',title:'政府政策',items:[]})}
          <div class="focus-lower">
            ${newsBox(domains.find(domain=>domain.domain==='B')??{domain:'B',title:'AS Roma',items:[]})}
            ${newsBox(domains.find(domain=>domain.domain==='C')??{domain:'C',title:'財經市場',items:[]})}
          </div>
        </div>
        <article class="newsbox-card hot-news-card">
          <div class="newsbox-head">
            <div>
              <div class="section-titleline hot-titleline">
                <h2>熱點新聞</h2>
                <button type="button" class="view-72h" data-filter="hot">72h 全部 →</button>
              </div>
              <p>${h(sectionMeta.hot?.subtitle??'跨域重要消息｜最新異動｜優先閱讀')}</p>
            </div>
            <div class="newsbox-tools">
              <div class="newsbox-time-row">
                <span>${refreshMeta(hotMeta)}</span>
                <button type="button" class="newsbox-refresh" aria-label="熱點新聞立即刷新">⭮</button>
              </div>
            </div>
          </div>
          <div class="hot-tier-label">${h(hotTiers[0])}</div>
          ${hotTop?`
            <div class="hot-lead">
              ${domainBadge(hotTop.domain)}
              <div>
                <div class="hot-lead-kicker">重點｜優先閱讀</div>
                <h3>${itemTag(hotTop)?`<em>${h(itemTag(hotTop))}</em>`:''}${h(hotTop.title)}</h3>
                <p>${h(hotTop.whyImportant??'涉及公共服務與民生安排；建議先讀原文，再跟進公共建設局相關更新。')}</p>
                <small>${h(hotTop.source)} · ${h(hotTop.time)}</small>
              </div>
            </div>
          `:'<p class="news-empty">暫無熱點消息</p>'}
          <div class="hot-tier-label">${h(hotTiers[1])}</div>
          <div class="hot-medium">
            ${hotMedium.map((item,index)=>`
              <div>
                <span>${h(String(index+2).padStart(2,'0'))}</span>
                ${domainBadge(item.domain)}
                <div><strong>${itemTag(item)?`<em>${h(itemTag(item))}</em>`:''}${h(item.title)}</strong><small>${h(item.source)} · ${h(item.time)}</small></div>
              </div>
            `).join('')}
          </div>
          <div class="hot-tier-label">${h(hotTiers[2])}</div>
          <div class="hot-rest soft-scroll">
            ${hotRestBody}
          </div>
        </article>
      </section>
    </div>
  `;

  app.querySelectorAll('.news-tab:not(:disabled)').forEach(button=>{
    button.onclick=()=>{
      homeTabs[button.dataset.domain]=button.dataset.tab;
      renderMain();
    };
  });
  app.querySelectorAll('.newsbox-refresh').forEach(button=>{
    button.onclick=()=>{
      button.classList.add('refreshing');
      button.textContent='更新中';
      setTimeout(()=>renderMain(),800);
    };
  });
  app.addEventListener('click',event=>{
    const row=event.target.closest('[data-url]');
    if(!row)return;
    const url=row.dataset.url;
    if(url)window.open(url,'_blank','noopener,noreferrer');
  });
  app.addEventListener('keydown',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    const row=event.target.closest('[data-url]');
    if(!row)return;
    event.preventDefault();
    const url=row.dataset.url;
    if(url)window.open(url,'_blank','noopener,noreferrer');
  });

  app.querySelector('.ops-refresh')?.addEventListener('click',()=>renderMain());
  app.querySelectorAll('.view-72h').forEach(button=>{
    button.onclick=()=>{
      recentFilter=button.dataset.filter??'all';
      recentCategory='all';
      recentTag='all';
      recentSort='priority';
      runRoute('sub_72h');
    };
  });
};

const renderAll=async()=>{
  const data=await getJson('./data/view/view_sub_all.json');
  const aRegistry=await loadARegistry();
  const domains=data.domains.map(domain=>domain.domain==='A'
    ? {...domain,title:'政府政策',sources:aRegistry.sources,registryError:aRegistry.error}
    : {...domain,title:domainTitles[domain.domain]??domain.title});
  const addMinutes=(value,minutes)=>{
    const base=new Date(value||data.generatedAt||Date.now());
    base.setMinutes(base.getMinutes()+(Number(minutes)||30));
    return base.toISOString();
  };
  const sourceRefresh=source=>{
    const lastUpdatedAt=source.lastUpdatedAt??data.generatedAt;
    return {
      lastUpdatedAt,
      nextRefreshAt:source.nextRefreshAt??addMinutes(lastUpdatedAt,source.refreshMin)
    };
  };
  const sourceListMarker=(rows,cap)=>rows.length===0
    ? '<p class="source-list-empty">沒有資料</p>'
    : rows.length<cap
      ? '<p class="source-list-end">沒有更多了</p>'
      : '';
  const sourceRows=source=>{
    const rows=(source.items??[]).slice(0,SOURCE_CARD_CAP);
    const stripSourceTitle=title=>{
      const raw=String(title??'');
      const label=String(source.label??'').trim();
      return label&&raw.startsWith(`${label} `)?raw.slice(label.length+1):raw;
    };
    return `${rows.map((item,index)=>`
      <div class="source-news-row"${linkAttrs(item)}>
        <span>${h(index+1)}.</span>
        <div><strong>${h(stripSourceTitle(item.title))}</strong><small> - ${h(item.time)}</small></div>
      </div>
    `).join('')}${sourceListMarker(rows,SOURCE_CARD_CAP)}`;
  };
  const sourceCard=source=>`
    <article class="expanded-source-card">
      <div class="source-card-head">
        <div class="source-card-title">
          ${renderSourceIcon(source,{size:'sm'})}
          <h3>${h(source.label)}</h3>
          <div class="source-card-tags">
            ${(source.newsBoxIds??[]).map(id=>`<span>${h(id)}</span>`).join('')}
          </div>
        </div>
        <div class="source-card-tools">
          <span class="source-status-chip">${h(statusText(source.status))}</span>
          <span>${refreshMeta(sourceRefresh(source))}</span>
          <button type="button" class="source-card-refresh" aria-label="${h(source.label)} 立即刷新">⭮</button>
        </div>
      </div>
      <p class="source-card-desc">${h(source.description)}</p>
      <div class="source-news-list soft-scroll">
        ${sourceRows(source)}
      </div>
    </article>
  `;

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
                <div class="source-icon-grid" aria-label="${h(domain.title)} 來源">
                  ${domain.registryError?`<p class="meta">${h(domain.registryError)}</p>`:''}
                  ${!domain.registryError&&!sources.length?'<p class="meta">目前沒有可顯示的來源。</p>':''}
                  ${sources.map(source=>`
                    <button
                      type="button"
                      class="source-button ${activeKeys.includes(source.sourceKey)?'active':''}"
                      data-domain="${h(domain.domain)}"
                      data-source-key="${h(source.sourceKey)}"
                      title="${h(source.label)}"
                      aria-label="${h(source.label)}"
                      ${source.disabled?'disabled aria-disabled="true"':''}
                    >
                      ${renderSourceIcon(source,{size:'lg'})}
                    </button>
                  `).join('')}
                </div>
                ${activeSources.length?`<div class="expanded-source-grid">
                  ${activeSources.map(sourceCard).join('')}
                </div>`:''}
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
    app.querySelectorAll('.source-card-refresh').forEach(button=>{
      button.onclick=()=>{
        button.classList.add('refreshing');
        button.textContent='更新中';
        setTimeout(draw,800);
      };
    });
  };

  draw();
};

const renderRecent72h=async()=>{
  const data=await getJson('./data/view/view_sub_main.json');
  const recentItems=Array.isArray(data.recent72h)?data.recent72h:(data.recent72h?.items??[]);
  const recentMeta=data.recent72hMeta??(Array.isArray(data.recent72h)?{}:data.recent72h??{});
  const topicSource=data.recent72hTopicTags??recentMeta.topicTags??{};
  const tabs=data.focusGrid?.tabs??{};
  const tabMap=Object.fromEntries(Object.entries(tabs).map(([domain,list])=>[
    domain,
    Object.fromEntries(list.map(tab=>[tab.id,tab.label]))
  ]));
  const domainItems=(data.domains??[]).flatMap(domain=>(domain.items??[]).map((item,index)=>({
    id:`${domain.domain.toLowerCase()}_${String(index+1).padStart(3,'0')}`,
    domain:domain.domain,
    title:item.title,
    source:item.source,
    category:tabMap[domain.domain]?.[item.newsBox]??item.newsBox??'',
    timeText:item.time,
    publishedAt:data.generatedAt,
    priority:60-index,
    stateTag:item.tag??'',
    topicTags:[],
    hot:false
  })));
  const allItems=(recentItems.length?recentItems:domainItems).map(item=>({
    ...item,
    topicTags:item.topicTags??[],
    hot:item.hot===true||item.priority>=88
  }));
  const recentCutoff=Date.now()-(RECENT_WINDOW_HOURS*60*60*1000);
  const allNews=allItems.filter(item=>{
    const value=Date.parse(item.publishedAt??'');
    return !Number.isFinite(value)||value===0||value>=recentCutoff;
  });
  const counts={
    all:allNews.length,
    A:allNews.filter(item=>item.domain==='A').length,
    B:allNews.filter(item=>item.domain==='B').length,
    C:allNews.filter(item=>item.domain==='C').length,
    hot:allNews.filter(item=>item.hot).length
  };
  const filters=[
    ['all',recentMeta.filters?.[0]??'全部'],
    ['A',recentMeta.filters?.[1]??'政府政策'],
    ['B',recentMeta.filters?.[2]??'AS Roma'],
    ['C',recentMeta.filters?.[3]??'財經市場'],
    ['hot',recentMeta.filters?.[4]??'熱點']
  ];
  const sortOptions=[
    ['priority','重要'],
    ['newest','最新'],
    ['oldest','最舊']
  ];
  const categoryOptions={
    all:[['all','全部']],
    A:[['all','全部'],['政府公布','政府公布'],['中文新聞','中文新聞'],['外語新聞','外語新聞'],['區域合作','區域合作'],['委員會工作','委員會工作']],
    B:[['all','全部'],['新聞消息','新聞消息'],['官方','官方'],['比賽列表','比賽列表']],
    C:[['all','全部'],['股價 Watchlist','股價 Watchlist'],['財經新聞','財經新聞'],['AI / 半導體','AI / 半導體']],
    hot:[['all','全部'],['重點','重點'],['新','新'],['追蹤','追蹤'],['異常','異常']]
  };
  const baseFiltered=recentFilter==='hot'
    ? allNews.filter(item=>item.hot)
    : recentFilter==='all'
      ? allNews
      : allNews.filter(item=>item.domain===recentFilter);
  const categoryFiltered=recentCategory==='all'
    ? baseFiltered
    : recentFilter==='hot'
      ? baseFiltered.filter(item=>item.stateTag===recentCategory)
      : baseFiltered.filter(item=>item.category===recentCategory);
  const categoryCounts=Object.fromEntries((categoryOptions[recentFilter]??categoryOptions.all).map(([key])=>[
    key,
    key==='all'?baseFiltered.length:(recentFilter==='hot'
      ? baseFiltered.filter(item=>item.stateTag===key).length
      : baseFiltered.filter(item=>item.category===key).length)
  ]));
  const topicPool=[...new Set(((recentFilter==='all'||recentFilter==='hot')
    ? topicSource.all??Object.values(topicSource).flat()
    : topicSource[recentFilter]??[])
    .filter(Boolean))];
  const tagFiltered=recentTag==='all'
    ? categoryFiltered
    : categoryFiltered.filter(item=>(item.topicTags??[]).includes(recentTag));
  const timeValue=item=>Date.parse(item.publishedAt??'')||0;
  const filtered=[...tagFiltered].sort((a,b)=>{
    if(recentSort==='newest')return timeValue(b)-timeValue(a);
    if(recentSort==='oldest')return timeValue(a)-timeValue(b);
    return (b.priority??0)-(a.priority??0)||timeValue(b)-timeValue(a);
  });
  const tagCounts=Object.fromEntries(topicPool.map(tag=>[
    tag,
    categoryFiltered.filter(item=>(item.topicTags??[]).includes(tag)).length
  ]));
  const recentVisibleRows=filtered.length>0&&filtered.length<RECENT_72H_MAX
    ? filtered.length+1
    : Math.min(Math.max(filtered.length,1),RECENT_72H_MAX);
  const recentEndMarker=filtered.length===0
    ? '<p class="recent-list-empty">沒有資料</p>'
    : '<p class="recent-list-end">沒有更多了</p>';
  const topicBase=topicPool.slice(0,6);
  const visibleTopicPool=recentTag!=='all'&&!topicBase.includes(recentTag)
    ? [...topicBase,recentTag]
    : topicBase;
  const hiddenTopicCount=Math.max(0,topicPool.length-topicBase.length);
  const recentMetaText=item=>[
    item.source,
    item.timeText,
    item.topicTags?.[0]??item.category
  ].filter(Boolean).join(' · ');
  const recentStateTag=item=>['重點','異常','追蹤'].includes(item.stateTag)?item.stateTag:'';

  app.innerHTML=`
    <div class="recent-page">
      <section class="recent-head">
        <p class="recent-summary-line">
          最近 73 小時：<b>${h(counts.all)}</b> 條｜政府政策 <b>${h(counts.A)}</b>｜AS Roma <b>${h(counts.B)}</b>｜財經市場 <b>${h(counts.C)}</b>｜熱點 <b>${h(counts.hot)}</b>
        </p>
      </section>
      <section class="recent-panel">
        <div class="recent-toolbar">
          <div class="recent-filters" aria-label="72 小時篩選">
            ${filters.map(([key,label])=>`
              <button type="button" class="recent-chip ${recentFilter===key?'active':''}" data-filter="${h(key)}">
                ${h(label)} <b>${h(counts[key]??0)}</b>
              </button>
            `).join('')}
          </div>
          <div class="recent-sort" aria-label="排序">
            <span class="recent-sort-label">排序：</span>
            ${sortOptions.map(([key,label])=>`
              <button type="button" class="${recentSort===key?'active':''}" data-sort="${h(key)}">${h(label)}</button>
            `).join('')}
          </div>
        </div>
        <div class="recent-categorybar" aria-label="分類">
          ${(categoryOptions[recentFilter]??categoryOptions.all).map(([key,label])=>`
            <button type="button" class="recent-category ${recentCategory===key?'active':''}" data-category="${h(key)}">
              ${h(label)} <b>${h(categoryCounts[key]??0)}</b>
            </button>
          `).join('')}
        </div>
        <div class="recent-topicbar" aria-label="主題標籤">
          <button type="button" class="recent-tag ${recentTag==='all'?'active':''}" data-tag="all">全部主題</button>
          ${visibleTopicPool.map(tag=>`
            <button type="button" class="recent-tag ${recentTag===tag?'active':''}" data-tag="${h(tag)}">
              ${h(tag)}${tagCounts[tag]?` <b>${h(tagCounts[tag])}</b>`:''}
            </button>
          `).join('')}
          ${hiddenTopicCount?`<span class="recent-topic-more">更多主題 ${h(hiddenTopicCount)} →</span>`:''}
        </div>
        <div class="recent-list soft-scroll" style="--recent-visible-rows:${recentVisibleRows}">
          ${filtered.map((item,index)=>`
            <article class="recent-row">
              <span class="recent-row-no">${h(String(index+1).padStart(2,'0'))}</span>
              <span class="recent-domain-mark ${h(domainClass(item.domain))}">${h(item.domain)}</span>
              <div class="recent-row-main">
                <div class="recent-row-title">
                  ${recentStateTag(item)?`<em class="recent-state-tag">${h(recentStateTag(item))}</em>`:''}
                  <strong>${h(item.title)}</strong>
                </div>
                <div class="recent-row-meta">${h(recentMetaText(item))}</div>
              </div>
            </article>
          `).join('')}${recentEndMarker}
        </div>
      </section>
    </div>
  `;

  app.querySelectorAll('.recent-chip').forEach(button=>{
    button.onclick=()=>{
      recentFilter=button.dataset.filter??'all';
      recentCategory='all';
      recentTag='all';
      renderRecent72h();
    };
  });
  app.querySelectorAll('.recent-sort button').forEach(button=>{
    button.onclick=()=>{
      recentSort=button.dataset.sort??'priority';
      renderRecent72h();
    };
  });
  app.querySelectorAll('.recent-category').forEach(button=>{
    button.onclick=()=>{
      recentCategory=button.dataset.category??'all';
      recentTag='all';
      renderRecent72h();
    };
  });
  app.querySelectorAll('.recent-tag').forEach(button=>{
    button.onclick=()=>{
      const tag=button.dataset.tag??'all';
      recentTag=recentTag===tag?'all':tag;
      renderRecent72h();
    };
  });
};

const renderHealth=async()=>{
  const [registry,health,auditSummary,auditDetail,viewAll]=await Promise.all([
    getOptionalJson('./data/registry/source_registry_a.json',{sources:[]}),
    getOptionalJson('./data/system/source_health.json',{sources:[],generatedAt:null}),
    getOptionalJson('./data/audit/fetch_audit_summary.json',{}),
    getOptionalJson('./data/audit/fetch_audit_detail.json',[]),
    getOptionalJson('./data/view/view_sub_all.json',{domains:[],generatedAt:null})
  ]);
  const nowIso=new Date().toISOString();
  const addMinutes=(value,minutes)=>{
    const base=new Date(value||health.generatedAt||viewAll.generatedAt||nowIso);
    base.setMinutes(base.getMinutes()+(Number(minutes)||30));
    return base.toISOString();
  };
  const healthMap=Object.fromEntries((health.sources??[]).map(source=>[source.sourceKey,source]));
  const sourceRowsFromView=new Map();
  (viewAll.domains??[]).forEach(domain=>{
    (domain.sources??[]).forEach(source=>{
      if(source.sourceKey)sourceRowsFromView.set(source.sourceKey,source.items??[]);
    });
  });
  const sourceShortId=sourceKey=>String(sourceKey??'').replace(/^[abc]_?/,'');
  const fetchOutputEntries=await Promise.all((registry.sources??[]).map(async source=>{
    const key=source.sourceKey;
    if(!key)return [key,null];
    return [key,await getOptionalJson(`./data/fetch/fetch_${sourceShortId(key)}.json`,null)];
  }));
  const fetchOutputMap=new Map(fetchOutputEntries);
  const macauDateKey=date=>{
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Macau',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
    const data=Object.fromEntries(parts.map(part=>[part.type,part.value]));
    return `${data.year}-${data.month}-${data.day}`;
  };
  const dayDistance=(fromKey,toKey)=>{
    const f=Date.UTC(Number(fromKey.slice(0,4)),Number(fromKey.slice(5,7))-1,Number(fromKey.slice(8,10)));
    const t=Date.UTC(Number(toKey.slice(0,4)),Number(toKey.slice(5,7))-1,Number(toKey.slice(8,10)));
    return Math.floor((t-f)/86400000);
  };
  const dateOnlyDisplayTime=publishedAt=>{
    const text=String(publishedAt??'');
    const match=text.match(/^(\d{4}-\d{2}-\d{2})T(00:00|09:00)(?::00)?(?:\.\d+)?(?:\+08:00|Z)?$/);
    if(!match)return '';
    const days=dayDistance(match[1],macauDateKey(new Date(nowIso)));
    if(days<=0)return '今日';
    if(days<=6)return `${days} 日前`;
    return match[1];
  };
  const healthDisplayTime=item=>item.timeText||dateOnlyDisplayTime(item.publishedAt)||(item.publishedAt?timeText(item.publishedAt):'');
  const rowsFromFetchOutput=output=>Array.isArray(output?.items)
    ? output.items.map(item=>({
      ...item,
      time:healthDisplayTime(item),
      newsBox:item.category??''
    }))
    : [];
  const normalizeHealthStatus=source=>{
    const status=source.status??'planned';
    if(status==='normal')return 'success';
    return status;
  };
  const statusOrder={failed:0,stale:1,empty:2,fallback:3,planned:4,disabled:5,success:6,normal:6};
  const statusGroups=[
    ['success','正常'],
    ['failed','異常'],
    ['stale','過期'],
    ['empty','無資料'],
    ['planned','待接入'],
    ['fallback','備援'],
    ['disabled','暫停']
  ];
  const healthSources=(registry.sources??[]).map(source=>{
    const healthInfo=healthMap[source.sourceKey]??{};
    const status=normalizeHealthStatus({
      status:healthInfo.status??(source.enabled===false?'disabled':source.status??'planned')
    });
    const fetchRows=rowsFromFetchOutput(fetchOutputMap.get(source.sourceKey));
    const rows=fetchRows.length?fetchRows:(sourceRowsFromView.get(source.sourceKey)??fakeItemsForSource(source));
    const lastUpdatedAt=healthInfo.lastSuccess??healthInfo.lastUpdatedAt??source.lastUpdatedAt??health.generatedAt??viewAll.generatedAt??nowIso;
    return {
      ...source,
      domain:source.domain??'A',
      label:source.label??source.name??source.sourceKey,
      status,
      healthInfo,
      newsBoxIds:source.newsBoxIds?.length?source.newsBoxIds:(healthInfo.newsBox?[healthInfo.newsBox]:[]),
      lastUpdatedAt,
      nextRefreshAt:healthInfo.nextRefresh??healthInfo.nextRefreshAt??source.nextRefreshAt??addMinutes(lastUpdatedAt,source.refreshMin),
      items:rows
    };
  });
  (health.sources??[]).forEach(source=>{
    if(!healthSources.some(item=>item.sourceKey===source.sourceKey)){
      healthSources.push({
        sourceKey:source.sourceKey,
        label:source.name??source.sourceKey,
        badge:String(source.domain??'?'),
        domain:source.domain??'unknown',
        newsBoxIds:source.newsBox?[source.newsBox]:[],
        status:normalizeHealthStatus(source),
        enabled:source.status!=='disabled',
        uiVisible:true,
        description:'待接入 real fetch。',
        lastUpdatedAt:health.generatedAt??nowIso,
        nextRefreshAt:addMinutes(health.generatedAt??nowIso,30),
        items:sourceRowsFromView.get(source.sourceKey)??[]
      });
    }
  });
  const statusCount=status=>healthSources.filter(source=>source.status===status||(status==='success'&&source.status==='normal')).length;
  const total=healthSources.length;
  const enabled=healthSources.filter(source=>source.enabled!==false).length;
  const latestSuccess=health.generatedAt??auditSummary.generatedAt??'';
  const nextRefresh=addMinutes(latestSuccess||nowIso,30);
  const statTiles=[
    ['異常',statusCount('failed')],
    ['過期',statusCount('stale')],
    ['無資料',statusCount('empty')],
    ['待接入',statusCount('planned')],
    ['正常',statusCount('success')],
    ['備援中',statusCount('fallback')],
    ['來源總數',total],
    ['已啟用',enabled],
    ['最後全局成功',latestSuccess?timeText(latestSuccess):'待接入'],
    ['下一輪刷新',nextRefresh?timeText(nextRefresh):'—']
  ];
  const healthRows=statusGroups.map(([status,label])=>{
    const members=healthSources.filter(source=>source.status===status||(status==='success'&&source.status==='normal'));
    const recent=members[0];
    return {status,label,members,representative:recent?.label??'—'};
  });
  const filteredSources=healthSources
    .filter(source=>healthDomainFilter==='all'||source.domain===healthDomainFilter)
    .filter(source=>healthStatusFilter==='all'||source.status===healthStatusFilter||(healthStatusFilter==='success'&&source.status==='normal'))
    .sort((a,b)=>(statusOrder[a.status]??9)-(statusOrder[b.status]??9)
      ||(Date.parse(a.lastUpdatedAt??'')||0)-(Date.parse(b.lastUpdatedAt??'')||0)
      ||String(a.sourceKey).localeCompare(String(b.sourceKey)));
  const sourceStatusLine=source=>'';
  const sourceStatusLineDisabled=source=>{
    if(source.status==='planned')return '待接入｜等待 real fetch';
    const info=source.healthInfo??{};
    if(Number.isFinite(Number(info.latestCount))){
      return `${info.latestCount}條｜重${info.duplicateCount??0}｜缺${info.missingDateCount??0}｜空${info.emptyTitleCount??0}｜最舊${info.oldestItemAgeText??'—'}`;
    }
    const rows=source.items??[];
    const titles=rows.map(item=>String(item.title??'').trim()).filter(Boolean);
    const duplicateCount=titles.length-new Set(titles).size;
    const missingDate=rows.filter(item=>!item.time&&!item.publishedAt).length;
    const emptyTitle=rows.filter(item=>!String(item.title??'').trim()).length;
    const oldest=rows.reduce((max,item)=>Math.max(max,ageMinutes(item.time)),0);
    return `${rows.length} 條｜重複 ${duplicateCount}｜缺日期 ${missingDate}｜空標題 ${emptyTitle}｜最舊 ${oldest>=9999?'—':`${Math.max(1,Math.round(oldest/60))} 小時前`}`;
  };
  const sourceListMarker=(rows,cap)=>rows.length===0
    ? '<p class="monitor-list-empty">沒有資料</p>'
    : rows.length<cap
      ? '<p class="monitor-list-end">沒有更多了</p>'
      : '';
  const stripSourceTitle=(source,title)=>{
    const raw=String(title??'');
    const label=String(source.label??'').trim();
    return label&&raw.startsWith(`${label} `)?raw.slice(label.length+1):raw;
  };
  const monitorRows=source=>{
    const rows=(source.items??[]).slice(0,HEALTH_SOURCE_CARD_CAP);
    return `${rows.map((item,index)=>`
      <div class="monitor-news-row"${linkAttrs(item)}>
        <span>${h(String(index+1).padStart(2,'0'))}.</span>
        <strong>${h(stripSourceTitle(source,item.title))}</strong>
        <small> - ${h(item.time??item.timeText??'待接入')}</small>
      </div>
    `).join('')}${sourceListMarker(rows,HEALTH_SOURCE_CARD_CAP)}`;
  };
  const monitorCard=source=>`
    <article class="monitor-card status-${h(source.status)} ${h(domainClass(source.domain))}">
      <div class="monitor-card-head">
        <div class="monitor-title">
          ${renderSourceIcon(source,{size:'sm'})}
          <h3>${h(source.label)}</h3>
          <div class="source-card-tags">${(source.newsBoxIds??[]).slice(0,2).map(id=>`<span>${h(id)}</span>`).join('')}</div>
        </div>
        <div class="monitor-tools">
          <span class="monitor-status">${h(statusText(source.status))}</span>
          <span>${refreshMeta(source)}</span>
          <button type="button" class="source-card-refresh" aria-label="${h(source.label)} 刷新">⟳</button>
        </div>
      </div>
      <p class="monitor-quality">${h(sourceStatusLine(source))}</p>
      <div class="monitor-news-list soft-scroll">${monitorRows(source)}</div>
    </article>
  `;
  app.innerHTML=`
    <div class="health-monitor">
      <section class="health-hero">
        <div>
          <h2>健康總覽</h2>
          <p>Source Health Monitor</p>
          <small>目前狀態以 registry / audit / fake health data 推算；real fetch 接入後將由 last_updated 與 fetch output 驅動。</small>
        </div>
        <span>Audit READY ${h(auditSummary.ready??'—')}｜High risk ${h(auditSummary.highRisk??'—')}</span>
      </section>
      <section class="health-stats">
        ${statTiles.map(([label,value])=>`<div><span>${h(label)}</span><b>${h(value)}</b></div>`).join('')}
      </section>
      <section class="health-table-card">
        <table class="health-summary-table">
          <thead><tr><th>狀態</th><th>數量</th><th>佔比</th><th>最近成功</th><th>最近錯誤</th><th>代表 source</th><th>操作</th></tr></thead>
          <tbody>${healthRows.map(row=>`
            <tr>
              <td><span class="monitor-status status-${h(row.status)}">${h(row.label)}</span></td>
              <td>${h(row.members.length)}</td>
              <td>${h(total?`${Math.round(row.members.length/total*100)}%`:'—')}</td>
              <td>${h(row.status==='success'&&latestSuccess?timeText(latestSuccess):'—')}</td>
              <td>${h(row.status==='failed'?'待接入':'—')}</td>
              <td>${h(row.representative)}</td>
              <td>檢視</td>
            </tr>
          `).join('')}</tbody>
        </table>
      </section>
      <section class="health-controls">
        <div>${[['all','全部'],['failed','異常'],['stale','過期'],['empty','無資料'],['fallback','備援'],['planned','待接入'],['success','正常'],['disabled','暫停']].map(([key,label])=>`
          <button type="button" class="health-filter ${healthStatusFilter===key?'active':''}" data-health-status="${h(key)}">${h(label)}</button>
        `).join('')}</div>
        <div>${[['all','全部'],['A','A'],['B','B'],['C','C']].map(([key,label])=>`
          <button type="button" class="health-filter ${healthDomainFilter===key?'active':''}" data-health-domain="${h(key)}">${h(label)}</button>
        `).join('')}</div>
      </section>
      <section class="monitor-grid">
        ${filteredSources.map(monitorCard).join('')||'<p class="news-empty">沒有資料</p>'}
      </section>
    </div>
  `;
  app.querySelectorAll('[data-health-status]').forEach(button=>{
    button.onclick=()=>{
      healthStatusFilter=button.dataset.healthStatus??'all';
      renderHealth();
    };
  });
  app.querySelectorAll('[data-health-domain]').forEach(button=>{
    button.onclick=()=>{
      healthDomainFilter=button.dataset.healthDomain??'all';
      renderHealth();
    };
  });
  app.querySelectorAll('.monitor-card .source-card-refresh').forEach(button=>{
    button.onclick=()=>{
      button.classList.add('refreshing');
      button.textContent='更新中';
      setTimeout(renderHealth,800);
    };
  });
};

const renderSettingRow=(label,value,note='')=>`
  <div>
    <span>${h(label)}${note?`<small>${h(note)}</small>`:''}</span>
    <b>${h(value)}</b>
  </div>
`;

const renderSectionHead=(heading,body='')=>`
  <div class="section-head">
    <h2>${h(heading)}</h2>
    ${body?`<p>${h(body)}</p>`:''}
  </div>
`;

const renderDomainCard=([domain,config])=>{
  const special=[
    config.translateTitle!==undefined&&['翻譯標題',boolText(config.translateTitle)],
    config.keepOriginalTitle!==undefined&&['保留原題',boolText(config.keepOriginalTitle)],
    config.blockOnTranslationFail!==undefined&&['翻譯失敗時阻擋',boolText(config.blockOnTranslationFail)],
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
    if(settings.ui)settings.ui.fontScale=fontScaleLabels[getFontScale()]??'標準';
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
  const defaults=settings.sourceDefaults??{};
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
        <article class="summary-card"><span>介面模式</span><b>${h(themeLabel(settings.ui?.theme))}</b><small>目前預設</small></article>
        <article class="summary-card"><span>展開來源上限</span><b>${h(maxExpanded)}</b><small>每個主域</small></article>
        <article class="summary-card"><span>A 登記檔</span><b>${registryError?'--':h(sources.length)}</b><small>${registryError?'讀取失敗':'已登記來源'}</small></article>
        <article class="summary-card"><span>刷新策略</span><b>${h(minRefresh)}</b><small>最快預設分鐘</small></article>
      </section>

      <section class="settings-card">
        ${renderSectionHead('介面設定','顯示目前讀取到的本機介面偏好，這裡仍然只供查看。')}
        <div class="settings-kv">
          ${renderSettingRow('介面模式',themeLabel(settings.ui?.theme),'預設顯示色彩')}
          ${renderSettingRow('側欄狀態',sidebarLabel(settings.ui?.sidebarCollapsed),'啟動時側欄狀態')}
          ${renderSettingRow('字體大小',fontScaleLabel(settings.ui?.fontScale),'目前使用標準尺寸')}
          ${renderSettingRow('版面密度',densityLabel(settings.ui?.layoutDensity),'偏向緊湊資訊流')}
          ${renderSettingRow('每區最多展開來源',maxExpanded,'SourceWall 每個主域的卡片上限')}
        </div>
      </section>

      <section class="settings-card">
        ${renderSectionHead('主域設定','三個主域的顯示量、預設刷新節奏與特殊選項。')}
        <div class="domain-settings-grid">${domains.map(renderDomainCard).join('')}</div>
      </section>

      <section class="settings-card">
        ${renderSectionHead('登記檔摘要','A 主域來源登記檔的目前讀取狀態。')}
        ${registryError?`<p class="error-text">${h(registryError)}</p>`:`
          <div class="settings-stats">
            <div class="stat-tile"><b>${sources.length}</b><span>全部來源</span></div>
            <div class="stat-tile"><b>${enabledSources.length}</b><span>啟用</span></div>
            <div class="stat-tile"><b>${visibleSources.length}</b><span>顯示</span></div>
            <div class="stat-tile"><b>${sourceGroups.length}</b><span>來源組</span></div>
          </div>
          <div class="registry-note">
            <span>預設啟用：${h(boolText(defaults.enabled))}</span>
            <span>預設顯示：${h(boolText(defaults.uiVisible))}</span>
            <span>預設優先級：${h(defaults.priority??'-')}</span>
            <span>手動刷新：${h(boolText(defaults.manualRefreshAllowed))}</span>
          </div>
          <p class="chip-label">前 10 個顯示來源</p>
          <div class="source-chips">${visibleChips.map(source=>`<span>${renderSourceIcon(source,{size:'sm'})}${h(source.label)}</span>`).join('')}</div>
        `}
      </section>

      <section class="settings-card settings-secondary">
        ${renderSectionHead('來源覆寫','個別來源的刷新與優先級設定，放在底部作為次要資訊。')}
        <table class="settings-table">
          <thead><tr><th>來源</th><th>刷新分鐘</th><th>優先級</th><th>啟用</th><th>顯示</th></tr></thead>
          <tbody>${overrideRows}</tbody>
        </table>
      </section>
    </div>
  `;
};

const routes={sub_main:renderMain,sub_72h:renderRecent72h,sub_all:renderAll,sub_health:renderHealth,sub_settings:renderSettings,recent_72h:renderRecent72h};

const runRoute=async page=>{
  page=normalizePage(page);
  currentPage=page;
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
fontMinus.onclick=()=>setFontScale(getFontScale()-1);
fontPlus.onclick=()=>setFontScale(getFontScale()+1);
fontSteps.forEach(step=>{
  step.onclick=()=>setFontScale(step.dataset.level);
});
runRoute('sub_main');
