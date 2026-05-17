import {dataPath,safeWriteNonEmptyJson} from './io.js';
import {appendHistory,logOverall,updateLastUpdated,updateSourceHealth} from './state.js';
import {macauTimestamp,normalizeMacauDate} from './time.js';

const ABSOLUTE_URL=/^https?:\/\//i;

const normalizeWhitespace=value=>String(value??'').replace(/\s+/g,' ').trim();

const stableId=(sourceId,item,index)=>{
  const base=normalizeWhitespace(item.url||`${item.title}-${item.publishedAt}-${index}`)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,70);
  return `${sourceId}_${base||index+1}`;
};

const dedupeAndSort=items=>{
  const seen=new Set();
  const out=[];
  for(const item of items){
    const title=normalizeWhitespace(item.title);
    const url=normalizeWhitespace(item.url||item.link||item.address);
    if(!title||!url)continue;
    const key=`${url}|${title}|${String(item.publishedAt??item.pubDate??item.date??'').slice(0,10)}`.toLowerCase();
    if(seen.has(key))continue;
    seen.add(key);
    out.push({...item,title,url});
  }
  return out.sort((a,b)=>(Date.parse(b.publishedAt??'')||0)-(Date.parse(a.publishedAt??'')||0));
};

const ageDays=item=>{
  const value=Date.parse(item.publishedAt??'');
  return Number.isNaN(value)?Infinity:Math.max(0,(Date.now()-value)/86400000);
};

const itemText=item=>[
  item.title,
  item.snippet,
  item.summary,
  item.abstract
].filter(Boolean).join(' ');

const evaluateQuality=(source,items)=>{
  const quality=source.quality??{};
  const keywords=Array.isArray(quality.requiredKeywords)?quality.requiredKeywords:[];
  let accepted=items;
  if(keywords.length){
    accepted=accepted.filter(item=>{
      const text=itemText(item);
      return keywords.some(keyword=>text.includes(keyword));
    });
    if(accepted.length===0){
      return {
        status:'empty',
        items:[],
        relevanceStatus:'mismatched',
        message:`No relevant items matched: ${keywords.join(', ')}`
      };
    }
  }
  const maxNewestAgeDays=Number(quality.maxNewestAgeDays);
  const staleRatioDays=Number(quality.staleRatioDays);
  const staleRatioLimit=Number(quality.staleRatioLimit??0.75);
  const newestAge=Math.min(...accepted.map(ageDays));
  const staleRatio=Number.isFinite(staleRatioDays)&&accepted.length
    ? accepted.filter(item=>ageDays(item)>staleRatioDays).length/accepted.length
    : 0;
  const relevanceStatus=keywords.length?'matched':quality.relevanceStatus??'unchecked';
  if(relevanceStatus==='unchecked'){
    return {
      status:'stale',
      items:accepted,
      relevanceStatus,
      message:'relevance unchecked'
    };
  }
  if(relevanceStatus==='mismatched'){
    return {
      status:'empty',
      items:[],
      relevanceStatus,
      message:'relevance mismatched'
    };
  }
  if(Number.isFinite(maxNewestAgeDays)&&newestAge>maxNewestAgeDays){
    return {
      status:'stale',
      items:accepted,
      relevanceStatus,
      message:`Newest item is ${Math.round(newestAge)} days old; threshold is ${maxNewestAgeDays} days.`
    };
  }
  if(Number.isFinite(staleRatioDays)&&staleRatio>=staleRatioLimit){
    return {
      status:'stale',
      items:accepted,
      relevanceStatus,
      message:`${Math.round(staleRatio*100)}% of items are older than ${staleRatioDays} days.`
    };
  }
  return {
    status:'normal',
    items:accepted,
    relevanceStatus,
    message:`${accepted.length} items passed quality gates.`
  };
};

export const absoluteUrl=(url,base)=>{
  const raw=normalizeWhitespace(url);
  if(!raw)return '';
  if(ABSOLUTE_URL.test(raw))return raw;
  try{return new URL(raw,base).toString()}
  catch{return ''}
};

export const decodeHtml=value=>normalizeWhitespace(value)
  .replace(/&amp;/g,'&')
  .replace(/&quot;/g,'"')
  .replace(/&#39;/g,"'")
  .replace(/&lt;/g,'<')
  .replace(/&gt;/g,'>');

export const stripTags=value=>decodeHtml(String(value??'').replace(/<[^>]+>/g,' '));

export const fetchText=async(url,timeoutMs=25000)=>{
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(url,{
      signal:controller.signal,
      headers:{
        'user-agent':'Nova-Lotus/2.0 local health monitor',
        'accept':'text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8'
      }
    });
    if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  }finally{
    clearTimeout(timeout);
  }
};

export const normalizeItems=(source,rawItems)=>{
  const fetchedAt=macauTimestamp();
  return dedupeAndSort(rawItems).map((item,index)=>({
    id:stableId(source.sourceId,item,index),
    sourceId:source.sourceId,
    sourceName:source.sourceName,
    domain:source.domain,
    category:source.category,
    title:item.title,
    url:item.url,
    publishedAt:normalizeMacauDate(item.publishedAt??item.pubDate??item.date??item.rawDate),
    fetchedAt,
    tags:Array.isArray(item.tags)?item.tags:[],
    status:'normal'
  }));
};

export const runSource=async source=>{
  const now=macauTimestamp();
  await logOverall(source.sourceId,'running',`Starting ${source.sourceName}`);
  try{
    const rawItems=await source.fetcher(source);
    const items=normalizeItems(source,rawItems).slice(0,source.maxItems??30);
    if(items.length===0){
      const message='No valid items parsed; existing fetch output preserved.';
      await updateLastUpdated(source,'empty',message,now);
      await updateSourceHealth(source,'empty',items,message,now,{relevanceStatus:'empty'});
      await logOverall(source.sourceId,'empty',message);
      return {sourceId:source.sourceId,status:'empty',count:0,message};
    }
    const quality=evaluateQuality(source,items);
    if(quality.status!=='normal'){
      await updateLastUpdated(source,quality.status,quality.message,now);
      await updateSourceHealth(source,quality.status,quality.items,quality.message,now,{relevanceStatus:quality.relevanceStatus});
      await logOverall(source.sourceId,quality.status,quality.message,{relevanceStatus:quality.relevanceStatus});
      return {sourceId:source.sourceId,status:quality.status,count:quality.items.length,message:quality.message};
    }
    const output={
      schema:'nova.fetch.v1',
      sourceId:source.sourceId,
      sourceName:source.sourceName,
      domain:source.domain,
      category:source.category,
      generatedAt:now,
      fetchedAt:now,
      status:'normal',
      count:quality.items.length,
      items:quality.items
    };
    const fetchFile=dataPath('fetch',`fetch_${source.shortId}.json`);
    await safeWriteNonEmptyJson(fetchFile,output,quality.items);
    await appendHistory(source.shortId,quality.items);
    await updateLastUpdated(source,'normal',`${quality.items.length} items fetched`,now);
    await updateSourceHealth(source,'normal',quality.items,`${quality.items.length} items fetched`,now,{relevanceStatus:quality.relevanceStatus});
    await logOverall(source.sourceId,'normal',`${quality.items.length} items fetched`,{relevanceStatus:quality.relevanceStatus});
    return {sourceId:source.sourceId,status:'normal',count:quality.items.length,message:'ok'};
  }catch(error){
    const message=error instanceof Error?error.message:String(error);
    await updateLastUpdated(source,'failed',message,now);
    await updateSourceHealth(source,'failed',[],message,now,{relevanceStatus:'failed'});
    await logOverall(source.sourceId,'failed',message);
    return {sourceId:source.sourceId,status:'failed',count:0,message};
  }
};
