import {absoluteUrl,decodeHtml,fetchText,stripTags} from './lib/fetchFoundation.js';
import {macauDate} from './lib/time.js';

const uniqueCandidates=items=>{
  const seen=new Set();
  return items.filter(item=>{
    const title=String(item.title??'').replace(/\s+/g,' ').trim();
    const url=String(item.url??'').trim();
    if(!title||!url||title.length<4)return false;
    if(/\.(?:jpg|jpeg|png|gif|webp|svg)$/i.test(url))return false;
    const key=`${title}|${url}|${String(item.publishedAt??'').slice(0,10)}`.toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);
    item.title=title;
    item.url=url;
    return true;
  });
};

const dateFromText=text=>{
  const raw=String(text??'');
  const numeric=raw.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if(numeric){
    const [,year,month,day,hour='09',minute='00']=numeric;
    return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute}:00+08:00`;
  }
  const slash=raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(slash){
    const [,day,month,year]=slash;
    return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T09:00:00+08:00`;
  }
  const english=raw.match(/([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if(english)return english[0];
  return '';
};

const markdownLinks=text=>[...String(text??'').matchAll(/\[([^\]\n]{4,260})\]\((https?:\/\/[^)\s]+)[^)]*\)/g)]
  .map(match=>({title:decodeHtml(match[1]),url:match[2]}));

const nearbyDate=(text,title)=>{
  const index=String(text).indexOf(String(title));
  const chunk=index>=0?String(text).slice(Math.max(0,index-240),index+520):String(text);
  return dateFromText(chunk);
};

const parseMarkdownByHost=(text,host,maxItems,extra={})=>uniqueCandidates(markdownLinks(text)
  .filter(item=>item.url.includes(host))
  .map(item=>({
    ...item,
    publishedAt:nearbyDate(text,item.title),
    tags:extra.tags??[]
  }))).slice(0,maxItems);

const parseTdm=async source=>{
  const url=`https://r.jina.ai/http://www.tdm.com.mo/zh-hant/news-list?type=image&category=all&page=1&date=${macauDate()}`;
  const text=await fetchText(url);
  const items=[];
  const re=/\[\s*!\[[^\]]*\]\([^)]*\)\s*#{2,4}\s*([\s\S]*?)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})[^\]]*?\]\((http:\/\/www\.tdm\.com\.mo\/zh-hant\/news-detail\/[^)]*)\)/g;
  let match;
  while((match=re.exec(text))&&items.length<source.maxItems){
    items.push({title:decodeHtml(match[1]),url:match[3],publishedAt:match[2]});
  }
  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseMacauPostDaily=async source=>{
  const text=await fetchText('https://r.jina.ai/https://www.macaupostdaily.com/news/list?tab=LATEST');
  const items=[];
  const re=/#####\s*\[([\s\S]*?)!\[[^\]]*\]\((?:[^)]+)\)\]\((https?:\/\/(?:www\.)?macaupostdaily\.com\/news\/\d+)\)/g;
  let match;
  while((match=re.exec(text))&&items.length<source.maxItems){
    const block=decodeHtml(match[1]);
    const date=block.match(/[A-Z][a-z]+ \d{1,2}, \d{4}/)?.[0]??'';
    const title=block.split(/[A-Z][a-z]+ \d{1,2}, \d{4}/)[0]
      .replace(/\s+(BEIJING|MACAU|HONG KONG|Analysis|Commentary)\b[\s\S]*$/,'')
      .slice(0,180)
      .trim();
    items.push({title:title||block.slice(0,140).trim(),url:match[2],publishedAt:date});
  }
  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseMacaoBusiness=async source=>{
  const text=await fetchText('https://r.jina.ai/http://www.macaubusiness.com/category/mna/mna-macau/');
  const items=[];
  const re=/###\s+\[([^\]]+)\]\((https?:\/\/macaubusiness\.com\/[^)]+)\)\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})/g;
  let match;
  while((match=re.exec(text))&&items.length<source.maxItems){
    items.push({title:decodeHtml(match[1]),url:match[2],publishedAt:match[3]});
  }
  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseCaeu=async source=>{
  const text=await fetchText('https://r.jina.ai/http://www.caeu.gov.mo/news/');
  const items=[];
  const re=/(\d{4}\/\d{2}\/\d{2})\s+上載日期：\s*\d{4}\/\d{2}\/\d{2}\s+\*\s+\[([^\]]+)\]\((http:\/\/www\.caeu\.gov\.mo\/news\/info\/[^)]+)\)/g;
  let match;
  while((match=re.exec(text))&&items.length<source.maxItems){
    items.push({title:decodeHtml(match[2]),url:match[3],publishedAt:match[1]});
  }
  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseCepa=async source=>{
  const text=await fetchText('https://r.jina.ai/http://www.dsedt.gov.mo/zh_MO/web/public/pg_cepa_news?_refresh=true');
  const start=text.indexOf('# 【緊貿安排快訊】');
  const body=start>=0?text.slice(start):text;
  const items=[];
  const re=/\[\s*!\[[^\]]*\]\([^)]*\)\s+\*\*([^*]+)\*\*\s*([\s\S]*?)\]\((https?:\/\/(?:www\.)?(?:dsedt\.gov\.mo|gcs\.gov\.mo)[^)]+)\)/g;
  let match;
  while((match=re.exec(body))&&items.length<source.maxItems){
    const title=decodeHtml(match[1]);
    const snippet=decodeHtml(match[2]).slice(0,320);
    const url=match[3];
    if(!title||/澳門特別行政區政府經濟及科技發展局|搜尋|語言|用戶登入|主頁/.test(title))continue;
    items.push({title,url,snippet,tags:['CEPA','DSEDT']});
  }
  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseHengqin=async source=>{
  const response=await fetch('https://www.hengqin.gov.cn/postmeta/i/24471.json',{
    headers:{'user-agent':'Nova-Lotus/2.0 local health monitor','accept':'application/json,text/plain,*/*'}
  });
  if(!response.ok)throw new Error(`Hengqin JSON ${response.status}`);
  const json=await response.json();
  const articles=Array.isArray(json?.articles)?json.articles:[];
  const items=articles.slice(0,Math.min(source.maxItems??30,30)).map(article=>({
    title:decodeHtml(article.title),
    url:absoluteUrl(article.url,'https://www.hengqin.gov.cn/macao_zh_hans/zwgk/tzgg/gg/'),
    publishedAt:Number(article.publish_time)?new Date(Number(article.publish_time)*1000).toISOString():'',
    tags:['橫琴','通知公告']
  })).filter(item=>item.url.includes('/macao_zh_hans/zwgk/tzgg/gg/content/post_'));
  return uniqueCandidates(items).slice(0,Math.min(source.maxItems??30,30));
};

const parseAamacau=async source=>{
  const text=await fetchText('https://r.jina.ai/https://aamacau.com/topics/breakingnews/');
  return parseMarkdownByHost(text,'aamacau.com',source.maxItems,{tags:['論盡媒體']})
    .filter(item=>/aamacau\.com\/\?p=\d+/.test(item.url)||/aamacau\.com\/.+/.test(item.url));
};

const parseAllinMedia=async source=>{
  const text=await fetchText('https://r.jina.ai/https://www.allinmedia.com.hk/category/%e5%8d%9a%e5%bd%a9%e6%96%b0%e8%81%9e/');
  return parseMarkdownByHost(text,'allinmedia.com.hk',source.maxItems,{tags:['AllinMedia']})
    .filter(item=>!/category|tag|author|wp-content|uploads/i.test(item.url));
};

const parseChengpou=async source=>{
  const text=await fetchText('https://r.jina.ai/https://chengpou.com.mo/newstag/Macao.html');
  return parseMarkdownByHost(text,'chengpou.com.mo',source.maxItems,{tags:['正報']})
    .filter(item=>/chengpou\.com\.mo\/.+/.test(item.url)&&!/newstag\/Macao\.html$/.test(item.url));
};

const parseExmoo=async source=>{
  const text=await fetchText('https://r.jina.ai/https://www.exmoo.com/hot');
  const items=[];
  const re=/\[(?:#{3,4}\s*)?([^\]]+)\]\((https:\/\/www\.exmoo\.com\/article\/\d+\.html)\)/g;
  let match;
  while((match=re.exec(text))&&items.length<source.maxItems){
    items.push({title:decodeHtml(match[1]),url:match[2],publishedAt:nearbyDate(text,match[1]),tags:['力報']});
  }
  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseMacauCableTv=async source=>{
  const text=await fetchText('https://r.jina.ai/https://www.macaucabletv.com/video/category/ALL');
  return parseMarkdownByHost(text,'macaucabletv.com',source.maxItems,{tags:['澳門有線']})
    .filter(item=>/\/video\//i.test(item.url)||/\/news\//i.test(item.url));
};

const parsePlataforma=async source=>{
  const pages=[
    'https://r.jina.ai/https://www.plataformamedia.com/zh-hant/seccao/%e6%be%b3%e9%96%80/',
    'https://r.jina.ai/https://www.plataformamedia.com/zh-hant/seccao/%e6%be%b3%e9%96%80/page/2/'
  ];
  const all=[];
  for(const url of pages){
    if(all.length>=source.maxItems)break;
    const text=await fetchText(url);
    all.push(...parseMarkdownByHost(text,'plataformamedia.com',source.maxItems,{tags:['Plataforma']}));
  }
  return uniqueCandidates(all)
    .filter(item=>!/seccao|category|author|tag|wp-content|uploads/i.test(item.url))
    .slice(0,source.maxItems);
};

export const sources=[
  {sourceId:'a_tdm',shortId:'tdm',sourceName:'TDM',domain:'A',category:'A2',refreshMinutes:15,maxItems:30,fetcher:parseTdm},
  {sourceId:'a_macaupostdaily',shortId:'macaupostdaily',sourceName:'Macau Post Daily',domain:'A',category:'A3',refreshMinutes:30,maxItems:30,fetcher:parseMacauPostDaily},
  {sourceId:'a_macaubusiness',shortId:'macaubusiness',sourceName:'Macao Business',domain:'A',category:'A3',refreshMinutes:30,maxItems:30,fetcher:parseMacaoBusiness},
  {sourceId:'a_caeu',shortId:'caeu',sourceName:'CAEU',domain:'A',category:'A5',refreshMinutes:30,maxItems:22,fetcher:parseCaeu},
  {sourceId:'a_govmo_cepa_search',shortId:'govmo_cepa_search',sourceName:'DSEDT CEPA news',domain:'A',category:'A4',refreshMinutes:30,maxItems:20,fetcher:parseCepa},
  {sourceId:'a_hengqin_gov',shortId:'hengqin_gov',sourceName:'橫琴官網',domain:'A',category:'A4',refreshMinutes:30,maxItems:30,fetcher:parseHengqin},
  {sourceId:'a_aamacau',shortId:'aamacau',sourceName:'論盡媒體',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseAamacau},
  {sourceId:'a_allinmedia',shortId:'allinmedia',sourceName:'AllinMedia',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseAllinMedia},
  {sourceId:'a_chengpou',shortId:'chengpou',sourceName:'正報',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseChengpou},
  {sourceId:'a_exmoo',shortId:'exmoo',sourceName:'力報',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseExmoo},
  {sourceId:'a_macaucabletv',shortId:'macaucabletv',sourceName:'澳門有線',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseMacauCableTv},
  {sourceId:'a_plataforma',shortId:'plataforma',sourceName:'Plataforma',domain:'A',category:'A3',refreshMinutes:30,maxItems:30,fetcher:parsePlataforma}
];

export const sourceById=id=>sources.find(source=>source.sourceId===id||source.shortId===id);
