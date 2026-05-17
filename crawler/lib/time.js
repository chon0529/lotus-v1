const macauFormatter=new Intl.DateTimeFormat('en-CA',{
  timeZone:'Asia/Macau',
  year:'numeric',
  month:'2-digit',
  day:'2-digit',
  hour:'2-digit',
  minute:'2-digit',
  second:'2-digit',
  hour12:false
});

const partsOf=date=>Object.fromEntries(macauFormatter.formatToParts(date)
  .filter(part=>part.type!=='literal')
  .map(part=>[part.type,part.value]));

export const macauTimestamp=(date=new Date())=>{
  const parts=partsOf(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
};

export const macauDate=(date=new Date())=>{
  const parts=partsOf(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const addMacauMinutes=(timestamp,minutes)=>{
  const base=timestamp?new Date(timestamp):new Date();
  base.setMinutes(base.getMinutes()+minutes);
  return macauTimestamp(base);
};

export const normalizeMacauDate=value=>{
  const raw=String(value??'').trim();
  if(!raw)return macauTimestamp();
  const isoLike=raw.match(/(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if(isoLike){
    const [,year,month,day,hour='09',minute='00']=isoLike;
    return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute}:00+08:00`;
  }
  const parsed=new Date(raw);
  return Number.isNaN(parsed.valueOf())?macauTimestamp():macauTimestamp(parsed);
};

export const compactMacauTime=timestamp=>{
  if(!timestamp)return '—';
  const date=new Date(timestamp);
  if(Number.isNaN(date.valueOf()))return String(timestamp).slice(0,16);
  const parts=partsOf(date);
  return `${parts.hour}:${parts.minute}`;
};

export const ageText=timestamp=>{
  const date=new Date(timestamp);
  if(Number.isNaN(date.valueOf()))return '待接入';
  const minutes=Math.max(0,Math.round((Date.now()-date.valueOf())/60000));
  if(minutes<60)return `${Math.max(1,minutes)} 分鐘前`;
  const hours=Math.round(minutes/60);
  if(hours<48)return `${hours} 小時前`;
  return `${Math.round(hours/24)} 日前`;
};
