import {absoluteUrl,decodeHtml,fetchText,stripTags} from './lib/fetchFoundation.js';
import {macauDate} from './lib/time.js';

const markdownLinks=text=>[...String(text??'').matchAll(/\[([^\]\n]{4,220})\]\((https?:\/\/[^)\s]+)[^)]*\)/g)]
  .map(match=>({title:decodeHtml(match[1]),url:match[2]}));

const uniqueCandidates=items=>{
  const seen=new Set();
  return items.filter(item=>{
    const title=String(item.title??'').trim();
    const url=String(item.url??'').trim();
    if(!title||!url||title.length<4)return false;
    if(/\.(?:jpg|jpeg|png|gif|webp|svg)$/i.test(url))return false;
    const key=`${title}|${url}`.toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
};

const dateFromText=text=>{
  const raw=String(text??'');
  const match=raw.match(/(\d{4}[-/.年]\d{1,2}[-/.月]\d{1,2})/);
  return match?.[1]??macauDate();
};

const parseHtmlAnchors=(html,base,patterns=[])=>{
  const items=[];
  const anchorRe=/<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while((match=anchorRe.exec(html))){
    const attrs=match[1]??'';
    const body=match[2]??'';
    const href=attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]??'';
    const url=absoluteUrl(href,base);
    const title=stripTags(body);
    if(!url||!title)continue;
    if(patterns.length&&!patterns.some(pattern=>pattern.test(url)||pattern.test(title)))continue;
    const chunk=html.slice(Math.max(0,match.index-320),Math.min(html.length,anchorRe.lastIndex+320));
    items.push({title,url,publishedAt:dateFromText(chunk)});
  }
  return uniqueCandidates(items);
};

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
    const date=block.match(/[A-Z][a-z]+ \d{1,2}, \d{4}/)?.[0]??macauDate();
    const title=block.split(/[A-Z][a-z]+ \d{1,2}, \d{4}/)[0]
      .replace(/\s+(BEIJING|MACAU|HONG KONG|Analysis|Commentary)\b[\s\S]*$/,'')
      .slice(0,180)
      .trim();
    items.push({title:title||block.slice(0,140).trim(),url:match[1]?match[2]:'',publishedAt:date});
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
  const json=await (await fetch('https://www.hengqin.gov.cn/postmeta/i/24471.json',{
    headers:{'user-agent':'Nova-Lotus/2.0 local health monitor','accept':'application/json,text/plain,*/*'}
  })).json();
  const articles=Array.isArray(json?.articles)?json.articles:[];
  const seen=new Set();
  const items=[];
  for(const article of articles){
    if(items.length>=Math.min(source.maxItems??30,30))break;
    const title=decodeHtml(article.title);
    const url=absoluteUrl(article.url,'https://www.hengqin.gov.cn/macao_zh_hans/zwgk/tzgg/gg/');
    const seconds=Number(article.publish_time);
    const publishedAt=Number.isFinite(seconds)&&seconds>0
      ? new Date(seconds*1000).toISOString()
      : '';
    const key=`${title}|${url}|${publishedAt}`;
    if(!title||!url||!publishedAt||seen.has(key))continue;
    if(!url.includes('/macao_zh_hans/zwgk/tzgg/gg/content/post_'))continue;
    seen.add(key);
    items.push({title,url,publishedAt,tags:['橫琴','通知公告']});
  }
  return uniqueCandidates(items).slice(0,Math.min(source.maxItems??30,30));
};

export const sources=[
  {
    sourceId:'a_tdm',
    shortId:'tdm',
    sourceName:'TDM',
    domain:'A',
    category:'A2',
    refreshMinutes:15,
    maxItems:30,
    fetcher:parseTdm
  },
  {
    sourceId:'a_macaupostdaily',
    shortId:'macaupostdaily',
    sourceName:'Macau Post Daily',
    domain:'A',
    category:'A3',
    refreshMinutes:30,
    maxItems:30,
    fetcher:parseMacauPostDaily
  },
  {
    sourceId:'a_macaubusiness',
    shortId:'macaubusiness',
    sourceName:'Macao Business',
    domain:'A',
    category:'A3',
    refreshMinutes:30,
    maxItems:30,
    fetcher:parseMacaoBusiness
  },
  {
    sourceId:'a_caeu',
    shortId:'caeu',
    sourceName:'CAEU',
    domain:'A',
    category:'A5',
    refreshMinutes:30,
    maxItems:22,
    fetcher:parseCaeu
  },
  {
    sourceId:'a_govmo_cepa_search',
    shortId:'govmo_cepa_search',
    sourceName:'gov.mo CEPA',
    domain:'A',
    category:'A4',
    refreshMinutes:30,
    maxItems:20,
    fetcher:parseCepa
  },
  {
    sourceId:'a_hengqin_gov',
    shortId:'hengqin_gov',
    sourceName:'橫琴官網',
    domain:'A',
    category:'A4',
    refreshMinutes:30,
    maxItems:30,
    fetcher:parseHengqin
  }
];

export const sourceById=id=>sources.find(source=>source.sourceId===id||source.shortId===id);
