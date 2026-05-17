import {dataPath,readJson,safeWriteJson} from './io.js';
import {addMacauMinutes,ageText,macauTimestamp} from './time.js';

const MAX_LOG=500;
const MAX_HISTORY=1000;

const dedupeKey=item=>[
  String(item.url??'').trim(),
  String(item.title??'').trim(),
  String(item.publishedAt??'').slice(0,10)
].join('|').toLowerCase();

export const logOverall=async(sourceId,status,message,extra={})=>{
  const file=dataPath('overalllog.json');
  const rows=await readJson(file,[]);
  rows.unshift({
    timestamp:macauTimestamp(),
    sourceId,
    status,
    message,
    ...extra
  });
  await safeWriteJson(file,rows.slice(0,MAX_LOG));
};

export const appendHistory=async(shortId,items)=>{
  const file=dataPath('history',`his_${shortId}.json`);
  const existing=await readJson(file,[]);
  const seen=new Set();
  const merged=[];
  for(const item of [...items,...existing]){
    const key=dedupeKey(item);
    if(!key.replace(/\|/g,'')||seen.has(key))continue;
    seen.add(key);
    merged.push(item);
    if(merged.length>=MAX_HISTORY)break;
  }
  await safeWriteJson(file,merged);
  return {file,newCount:Math.max(0,merged.length-existing.length)};
};

export const updateLastUpdated=async(source,status,message,now=macauTimestamp())=>{
  const file=dataPath('last_updated.json');
  const data=await readJson(file,{schema:'nova.last_updated.v1',timezone:'Asia/Macau',sources:{}});
  data.schema=data.schema??'nova.last_updated.v1';
  data.timezone='Asia/Macau';
  data.generatedAt=now;
  data.sources=data.sources??{};
  const previous=data.sources[source.sourceId]??{};
  data.sources[source.sourceId]={
    sourceId:source.sourceId,
    sourceName:source.sourceName,
    domain:source.domain,
    category:source.category,
    lastRun:now,
    lastSuccess:status==='normal'?now:previous.lastSuccess??null,
    lastFailure:status==='normal'?previous.lastFailure??null:now,
    nextRun:addMacauMinutes(now,source.refreshMinutes??30),
    status,
    message
  };
  await safeWriteJson(file,data);
};

export const updateSourceHealth=async(source,status,items,message,now=macauTimestamp(),quality={})=>{
  const file=dataPath('system','source_health.json');
  const data=await readJson(file,{schema:'lotus.health.v1',timezone:'Asia/Macau',sources:[]});
  data.schema=data.schema??'lotus.health.v1';
  data.timezone='Asia/Macau';
  data.generatedAt=now;
  data.sources=Array.isArray(data.sources)?data.sources:[];
  const index=data.sources.findIndex(item=>(item.sourceId??item.sourceKey)===source.sourceId);
  const rows=Array.isArray(items)?items:[];
  const titles=rows.map(item=>String(item.title??'').trim()).filter(Boolean);
  const duplicateCount=titles.length-new Set(titles).size;
  const missingDateCount=rows.filter(item=>!item.publishedAt).length;
  const emptyTitleCount=rows.filter(item=>!String(item.title??'').trim()).length;
  const oldest=rows.reduce((oldestItem,item)=>{
    const value=Date.parse(item.publishedAt??'');
    return Number.isNaN(value)?oldestItem:Math.min(oldestItem,value);
  },Date.now());
  const newest=rows.reduce((newestItem,item)=>{
    const value=Date.parse(item.publishedAt??'');
    return Number.isNaN(value)?newestItem:Math.max(newestItem,value);
  },0);
  const previous=index>=0?data.sources[index]:{};
  const relevanceStatus=quality.relevanceStatus??previous.relevanceStatus??'unchecked';
  const effectiveStatus=status==='normal'&&['unchecked','mismatched'].includes(relevanceStatus)?'stale':status;
  const effectiveMessage=status==='normal'&&relevanceStatus==='unchecked'
    ? 'relevance unchecked'
    : status==='normal'&&relevanceStatus==='mismatched'
      ? 'relevance mismatched'
      : message;
  const failCount=effectiveStatus==='normal'||effectiveStatus==='empty'?0:Number(previous.failCount??0)+1;
  const entry={
    ...previous,
    sourceId:source.sourceId,
    sourceKey:source.sourceId,
    name:source.sourceName,
    domain:source.domain,
    newsBox:source.category,
    status:effectiveStatus,
    lastRun:now,
    lastSuccess:effectiveStatus==='normal'?now:previous.lastSuccess??null,
    nextRefresh:addMacauMinutes(now,source.refreshMinutes??30),
    failCount,
    latestCount:rows.length,
    duplicateCount,
    missingDateCount,
    emptyTitleCount,
    newestItemAgeText:rows.length&&newest?ageText(new Date(newest).toISOString()):'沒有資料',
    oldestItemAgeText:rows.length?ageText(new Date(oldest).toISOString()):'沒有資料',
    relevanceStatus,
    lastError:effectiveStatus==='normal'?null:effectiveMessage
  };
  if(index>=0)data.sources[index]=entry;
  else data.sources.push(entry);
  await safeWriteJson(file,data);
};
