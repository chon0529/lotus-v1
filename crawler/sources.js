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
  const lines=text.split('\n');
  const items=[];
  const seen=new Set();

  const toDate=value=>{
    const m=String(value??'').match(/(\d{1,2})\s+(\d{1,2})\s+月,\s*(20\d{2})/);
    if(!m)return '';
    return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}T09:00:00+08:00`;
  };

  const clean=value=>decodeHtml(String(value??'')
    .replace(/[#*_`>]/g,' ')
    .replace(/\s+/g,' ')
    .trim());

  const readPost=line=>{
    const key='### [';
    const a=line.indexOf(key);
    if(a<0)return null;

    const titleStart=a+key.length;
    const titleEnd=line.indexOf('](',titleStart);
    if(titleEnd<0)return null;

    const urlStart=titleEnd+2;
    let urlEnd=line.indexOf(' ',urlStart);
    const closeEnd=line.indexOf(')',urlStart);
    if(urlEnd<0||(closeEnd>=0&&closeEnd<urlEnd))urlEnd=closeEnd;
    if(urlEnd<0)return null;

    const title=clean(line.slice(titleStart,titleEnd)).slice(0,160);
    const url=line.slice(urlStart,urlEnd).replace(/^['"]|['"]$/g,'');

    if(!title||!url.includes('allinmedia.com.hk/20'))return null;
    return {title,url};
  };

  for(let i=0;i<lines.length&&items.length<source.maxItems;i++){
    const line=lines[i];
    if(!line.includes('### [')||!line.includes('allinmedia.com.hk/20'))continue;

    const post=readPost(line);
    if(!post)continue;

    const near=[lines[i],lines[i+1]??'',lines[i+2]??'',lines[i+3]??'',lines[i+4]??''].join(' ');
    const publishedAt=toDate(near);
    if(!publishedAt)continue;

    if(/^博彩新聞$/.test(post.title)||/^Gambling News$/i.test(post.title))continue;

    const key=`${post.title}|${post.url}|${publishedAt}`;
    if(seen.has(key))continue;
    seen.add(key);

    items.push({
      title:post.title,
      url:post.url,
      publishedAt,
      tags:['AllinMedia','博彩新聞']
    });
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
};


const parseChengpou=async source=>{
  const text=await fetchText('https://r.jina.ai/http://chengpou.com.mo/news.html');
  const items=[];
  const seen=new Set();
  const toDate=value=>{
    const m=String(value??'').match(/20\d{2}-\d{2}-\d{2}/);
    return m?`${m[0]}T09:00:00+08:00`:'';
  };
  const clean=value=>decodeHtml(String(value??'')
    .replace(/[#*_`>]/g,' ')
    .replace(/\s+/g,' ')
    .trim());

  for(const line of text.split(/\n+/)){
    if(items.length>=source.maxItems)break;
    if(!line.includes('chengpou.com.mo/dailynews/'))continue;

    const date=toDate(line);
    const urlMatch=line.match(/https?:\/\/(?:www\.)?chengpou\.com\.mo\/dailynews\/\d+\.html/);
    if(!date||!urlMatch)continue;

    let title=line;
    const imageEnd=title.indexOf(') ');
    if(title.startsWith('[![')&&imageEnd>0)title=title.slice(imageEnd+2);
    title=title.split(date.slice(0,10))[0];
    title=title.split('【本報訊】')[0];
    title=title.split('【特訊】')[0];
    title=title.split('【正視聽】')[0];
    title=title.split('【特稿】')[0];
    title=title
      .replace(/\s+△[\s\S]*$/,'')
      .replace(/\s+▲[\s\S]*$/,'')
      .replace(/\s+【[\s\S]*$/,'')
      .replace(/\s+（圖文包）[\s\S]*$/,'')
      .replace(/\s*\.\.\.$/,'')
      .replace(/\s+/g,' ');
    title=clean(title).slice(0,90).trim();

    if(!title||/^\d+$/.test(title)||title.length<4)continue;
    if(/^(首頁|主頁|新聞|正報|廣告)$/.test(title))continue;

    const url=urlMatch[0];
    const key=`${title}|${url}|${date}`;
    if(seen.has(key))continue;
    seen.add(key);
    items.push({title,url,publishedAt:date,tags:['正報']});
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
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
  const items=[];
  const seen=new Set();
  const pad=n=>String(n).padStart(2,'0');
  const parseDate=value=>{
    const match=String(value??'').match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
    return match?`${match[1]}-${pad(match[2])}-${pad(match[3])}T09:00:00+08:00`:'';
  };
  const clean=value=>decodeHtml(String(value??'')
    .replace(/!\[[^\]]*\]\([^)]+\)/g,' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g,' ')
    .replace(/[#*_`>]/g,' ')
    .replace(/\s+/g,' ')
    .trim());

  const patterns=[
    /\[!\[[^\]]*\]\([^)]+\)\s*([\s\S]*?)(\d{4}年\s*\d{1,2}月\s*\d{1,2}日)[\s\S]*?\]\((https?:\/\/(?:www\.)?macaucabletv\.com\/(?:video|news)\/[^)\s]+)\)/g,
    /\[([\s\S]{4,260}?)(\d{4}年\s*\d{1,2}月\s*\d{1,2}日)[\s\S]*?\]\((https?:\/\/(?:www\.)?macaucabletv\.com\/(?:video|news)\/[^)\s]+)\)/g
  ];

  for(const re of patterns){
    let match;
    while((match=re.exec(text))&&items.length<source.maxItems){
      const title=clean(match[1])
        .replace(/^.*?\.jpg\)\s*/i,'')
        .replace(/^影片\s+/,'')
        .split(/\s+(?:由|為|作為|本澳|澳門|珠海|橫琴|銀河娛樂|郵電局|5月\d{1,2}日|\d{1,2}月\d{1,2}日)[，,]/)[0]
        .split(/\s+(?:由|為|作為|5月\d{1,2}日|\d{1,2}月\d{1,2}日)/)[0]
        .replace(/＆middot;/g,'·')
        .slice(0,70)
        .trim();
      const publishedAt=parseDate(match[2]);
      const url=absoluteUrl(match[3],'https://www.macaucabletv.com/');
      if(!title||!publishedAt||!url)continue;
      if(/^(首頁|主頁|關於我們|更多|ALL|Image)$/i.test(title))continue;
      const key=`${title}|${url}|${publishedAt}`;
      if(seen.has(key))continue;
      seen.add(key);
      items.push({title,url,publishedAt,tags:['澳門有線']});
    }
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
};


const parsePlataforma=async source=>{
  const text=await fetchText('https://r.jina.ai/https://www.plataformamedia.com/seccao/marcas-plataforma/');
  const section=(text.split('# Marcas Plataforma')[1]??'').split('### Últimas Notícias')[0]??'';
  const lines=section.split('\n');
  const items=[];
  const seen=new Set();

  const toDate=value=>{
    const m=String(value??'').match(/20\d{2}-\d{2}-\d{2}/);
    return m?`${m[0]}T09:00:00+08:00`:'';
  };

  const clean=value=>decodeHtml(String(value??'')
    .replace(/[#*_`>]/g,' ')
    .replace(/\s+/g,' ')
    .trim());

  const linkFromLine=line=>{
    const key='## [';
    const a=line.indexOf(key);
    if(a<0)return null;
    const titleStart=a+key.length;
    const titleEnd=line.indexOf('](',titleStart);
    if(titleEnd<0)return null;
    const urlStart=titleEnd+2;
    const urlEnd=line.indexOf(')',urlStart);
    if(urlEnd<0)return null;
    return {
      title:clean(line.slice(titleStart,titleEnd)).slice(0,160),
      url:line.slice(urlStart,urlEnd)
    };
  };

  for(let i=0;i<lines.length&&items.length<source.maxItems;i++){
    const line=lines[i];
    if(!line.includes('## [')||!line.includes('plataformamedia.com/20'))continue;

    const link=linkFromLine(line);
    if(!link||!link.title||!link.url)continue;
    if(!link.url.startsWith('https://www.plataformamedia.com/20'))continue;

    const near=[line,lines[i+1]??'',lines[i+2]??'',lines[i+3]??''].join(' ');
    const publishedAt=toDate(near);
    if(!publishedAt)continue;

    const key=`${link.title}|${link.url}|${publishedAt}`;
    if(seen.has(key))continue;
    seen.add(key);

    items.push({
      title:link.title,
      url:link.url,
      publishedAt,
      tags:['Marcas Plataforma']
    });
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseGcshq=async source=>{
  const topic='%E6%A9%AB%E7%90%B4%E7%B2%B5%E6%BE%B3%E6%B7%B1%E5%BA%A6%E5%90%88%E4%BD%9C%E5%8D%80';
  const base=`https://r.jina.ai/https://www.gcs.gov.mo/list/zh-hant/topics/${topic}`;
  const pages=[base,`${base}?page=2`,`${base}?page=3`,`${base}?page=4`,`${base}?page=5`];
  const items=[];
  const seen=new Set();
  const month=' ABCDEFGHIJKL';
  const day=' ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const dateFromUrl=url=>{
    const n=url.indexOf('/N');
    if(n<0||n+5>=url.length)return '';
    const yy=url.slice(n+2,n+4);
    const mo=month.indexOf(url[n+4]);
    const dd=day.indexOf(url[n+5]);
    if(mo<1||dd<1)return '';
    return `20${yy}-${String(mo).padStart(2,'0')}-${String(dd).padStart(2,'0')}T09:00:00+08:00`;
  };

  const clean=value=>decodeHtml(String(value??''))
    .replaceAll('#',' ')
    .replaceAll('*',' ')
    .replaceAll('_',' ')
    .replaceAll('`',' ')
    .replaceAll('>',' ')
    .split(/\s+/)
    .join(' ')
    .trim();

  const urlFromLine=line=>{
    const key='https://www.gcs.gov.mo/detail/zh-hant/N';
    const a=line.indexOf(key);
    if(a<0)return '';
    let b=line.indexOf(')',a);
    const c=line.indexOf(' ',a);
    if(c>0&&(b<0||c<b))b=c;
    if(b<0)b=line.length;
    return line.slice(a,b);
  };

  const titleFromLine=line=>{
    if(line.startsWith('[![')){
      const a=line.indexOf(': ');
      const b=line.indexOf(']',a+2);
      if(a>=0&&b>a)return line.slice(a+2,b);
    }
    const a=line.indexOf('[');
    const b=line.indexOf('](',a+1);
    if(a>=0&&b>a)return line.slice(a+1,b);
    return '';
  };

  const pushLine=line=>{
    if(items.length>=source.maxItems)return;
    if(!line.includes(`topic=${topic}`))return;
    if(!line.includes('https://www.gcs.gov.mo/detail/zh-hant/N'))return;
    if(line.includes('/list/'))return;

    const rawUrl=urlFromLine(line);
    const baseUrl=rawUrl.split('?')[0];
    const url=`${baseUrl}?topic=${topic}`;
    let title=clean(titleFromLine(line));

    const cutWords=[' 橫琴粵澳深度合作區',' 行政事務局',' 民生事務局',' 勞工事務局',' 教育及青年發展局',' 藥物監督管理局',' 7月前',' 6月前',' 5月前'];
    for(const w of cutWords){
      const i=title.indexOf(w);
      if(i>0)title=title.slice(0,i).trim();
    }

    const publishedAt=dateFromUrl(url);
    if(!title||!url||!publishedAt)return;
    if(title.includes('+ 更多'))return;
    if(title.includes('施政特寫'))return;
    if(title.includes('施政報告'))return;
    if(title.includes('保安司'))return;
    if(title.includes('審計署'))return;
    if(title.includes('警情通告'))return;
    if(title.includes('行政會'))return;

    const key=`${title}|${url}|${publishedAt}`;
    if(seen.has(key))return;
    seen.add(key);
    items.push({title:title.slice(0,160),url,publishedAt,tags:['GCS','橫琴合作區']});
  };

  for(const page of pages){
    if(items.length>=source.maxItems)break;
    const text=await fetchText(page);
    for(const line of text.split('\n'))pushLine(line);
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseGcs=async source=>{
  const xml=await fetchText('https://govinfohub.gcs.gov.mo/api/rss/n/zh-hant');
  const items=[];
  const seen=new Set();
  const getTag=(block,tag)=>{
    const a=block.indexOf(`<${tag}>`);
    const b=block.indexOf(`</${tag}>`,a);
    if(a<0||b<0)return '';
    return decodeHtml(block.slice(a+tag.length+2,b).replace(/<!\[CDATA\[|\]\]>/g,'').trim());
  };
  const toDate=value=>{
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return '';
    const parts=new Intl.DateTimeFormat('en-CA',{
      timeZone:'Asia/Macau',
      year:'numeric',
      month:'2-digit',
      day:'2-digit',
      hour:'2-digit',
      minute:'2-digit',
      hour12:false
    }).formatToParts(d).reduce((a,p)=>(a[p.type]=p.value,a),{});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00+08:00`;
  };

  for(const m of xml.matchAll(/<item>[\s\S]*?<\/item>/g)){
    if(items.length>=source.maxItems)break;
    const block=m[0];
    const title=getTag(block,'title');
    const url=getTag(block,'link');
    const publishedAt=toDate(getTag(block,'pubDate'));
    const summary=getTag(block,'description');
    if(!title||!url||!publishedAt)continue;
    const key=`${title}|${url}|${publishedAt}`;
    if(seen.has(key))continue;
    seen.add(key);
    items.push({title,url,publishedAt,summary,tags:['GCS']});
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseGcsHousing=async source=>{
  const category='%E5%B7%A5%E7%A8%8B%E6%88%BF%E5%B1%8B';
  const base=`https://r.jina.ai/https://www.gcs.gov.mo/list/zh-hant/news/${category}`;
  const pages=[base,`${base}?page=2`,`${base}?page=3`];
  const items=[];
  const seen=new Set();
  const month=' ABCDEFGHIJKL';
  const day=' ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const dateFromUrl=url=>{
    const n=url.indexOf('/N');
    if(n<0||n+5>=url.length)return '';
    const yy=url.slice(n+2,n+4);
    const mo=month.indexOf(url[n+4]);
    const dd=day.indexOf(url[n+5]);
    if(mo<1||dd<1)return '';
    return `20${yy}-${String(mo).padStart(2,'0')}-${String(dd).padStart(2,'0')}T09:00:00+08:00`;
  };

  const clean=value=>decodeHtml(String(value??''))
    .replaceAll('#',' ')
    .replaceAll('*',' ')
    .replaceAll('_',' ')
    .replaceAll('`',' ')
    .replaceAll('>',' ')
    .split(/\s+/)
    .join(' ')
    .trim();

  const urlFromLine=line=>{
    const key='https://www.gcs.gov.mo/detail/zh-hant/N';
    const a=line.indexOf(key);
    if(a<0)return '';
    let b=line.indexOf(')',a);
    const c=line.indexOf(' ',a);
    if(c>0&&(b<0||c<b))b=c;
    if(b<0)b=line.length;
    return line.slice(a,b);
  };

  const titleFromLine=line=>{
    if(line.startsWith('[![')){
      const a=line.indexOf(': ');
      const b=line.indexOf(']',a+2);
      if(a>=0&&b>a)return line.slice(a+2,b);
    }
    const a=line.indexOf('[');
    const b=line.indexOf('](',a+1);
    if(a>=0&&b>a)return line.slice(a+1,b);
    return '';
  };

  const pushLine=line=>{
    if(items.length>=source.maxItems)return;
    if(!line.includes(`category=${category}`))return;
    if(!line.includes('https://www.gcs.gov.mo/detail/zh-hant/N'))return;
    if(line.includes('/list/'))return;

    const rawUrl=urlFromLine(line);
    const baseUrl=rawUrl.split('?')[0];
    const url=`${baseUrl}?category=${category}`;
    let title=clean(titleFromLine(line));

    const cutWords=[
      ' 公共建設局',
      ' 交通事務局',
      ' 房屋局',
      ' 土地工務局',
      ' 統計暨普查局',
      ' 澳門金融管理局',
      ' 運輸工務司司長辦公室',
      ' 5小時前',
      ' 6小時前',
      ' 2天前',
      ' 3天前',
      ' 1周前',
      ' 2周前',
      ' 3周前'
    ];
    for(const w of cutWords){
      const i=title.indexOf(w);
      if(i>0)title=title.slice(0,i).trim();
    }

    const publishedAt=dateFromUrl(url);
    if(!title||!url||!publishedAt)return;
    if(title.includes('+ 更多'))return;
    if(title.includes('施政特寫'))return;
    if(title.includes('施政報告'))return;
    if(title.includes('全民國家安全教育展'))return;
    if(title.includes('澳門名片集'))return;

    const key=`${title}|${url}|${publishedAt}`;
    if(seen.has(key))return;
    seen.add(key);
    items.push({title:title.slice(0,160),url,publishedAt,tags:['GCS','工程房屋']});
  };

  for(const page of pages){
    if(items.length>=source.maxItems)break;
    const text=await fetchText(page);
    for(const line of text.split('\n'))pushLine(line);
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseGcsgba=async source=>{
  const topic='%E7%B2%B5%E6%B8%AF%E6%BE%B3%E5%A4%A7%E7%81%A3%E5%8D%80';
  const base=`https://r.jina.ai/https://www.gcs.gov.mo/list/zh-hant/topics/${topic}`;
  const pages=[base,`${base}?page=2`,`${base}?page=3`,`${base}?page=4`,`${base}?page=5`];
  const items=[];
  const seen=new Set();
  const month=' ABCDEFGHIJKL';
  const day=' ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const dateFromUrl=url=>{
    const n=url.indexOf('/N');
    if(n<0||n+5>=url.length)return '';
    const yy=url.slice(n+2,n+4);
    const mo=month.indexOf(url[n+4]);
    const dd=day.indexOf(url[n+5]);
    if(mo<1||dd<1)return '';
    return `20${yy}-${String(mo).padStart(2,'0')}-${String(dd).padStart(2,'0')}T09:00:00+08:00`;
  };

  const clean=value=>decodeHtml(String(value??''))
    .replaceAll('#',' ')
    .replaceAll('*',' ')
    .replaceAll('_',' ')
    .replaceAll('`',' ')
    .replaceAll('>',' ')
    .split(/\s+/)
    .join(' ')
    .trim();

  const urlFromLine=line=>{
    const key='https://www.gcs.gov.mo/detail/zh-hant/N';
    const a=line.indexOf(key);
    if(a<0)return '';
    let b=line.indexOf(')',a);
    const c=line.indexOf(' ',a);
    if(c>0&&(b<0||c<b))b=c;
    if(b<0)b=line.length;
    return line.slice(a,b);
  };

  const titleFromLine=line=>{
    if(line.startsWith('[![')){
      const a=line.indexOf(': ');
      const b=line.indexOf(']',a+2);
      if(a>=0&&b>a)return line.slice(a+2,b);
    }
    const a=line.indexOf('[');
    const b=line.indexOf('](',a+1);
    if(a>=0&&b>a)return line.slice(a+1,b);
    return '';
  };

  const pushLine=line=>{
    if(items.length>=source.maxItems)return;
    if(!line.includes(`topic=${topic}`))return;
    if(!line.includes('https://www.gcs.gov.mo/detail/zh-hant/N'))return;
    if(line.includes('/list/'))return;

    const rawUrl=urlFromLine(line);
    const baseUrl=rawUrl.split('?')[0];
    const url=`${baseUrl}?topic=${topic}`;
    let title=clean(titleFromLine(line));

    const cutWords=[
      ' 衛生局',
      ' 澳門大學',
      ' 招商投資促進局',
      ' 教育及青年發展局',
      ' 環境保護局',
      ' 勞工事務局',
      ' 新聞局',
      ' 市政署',
      ' 4天前',
      ' 1周前',
      ' 2周前',
      ' 4周前',
      ' 1月前'
    ];
    for(const w of cutWords){
      const i=title.indexOf(w);
      if(i>0)title=title.slice(0,i).trim();
    }

    const publishedAt=dateFromUrl(url);
    if(!title||!url||!publishedAt)return;
    if(title.includes('+ 更多'))return;
    if(title.includes('施政特寫'))return;
    if(title.includes('施政報告'))return;
    if(title.includes('全民國家安全教育展'))return;
    if(title.includes('澳門名片集'))return;

    const key=`${title}|${url}|${publishedAt}`;
    if(seen.has(key))return;
    seen.add(key);
    items.push({title:title.slice(0,160),url,publishedAt,tags:['GCS','粵港澳大灣區']});
  };

  for(const page of pages){
    if(items.length>=source.maxItems)break;
    const text=await fetchText(page);
    for(const line of text.split('\n'))pushLine(line);
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseCbaAction=async source=>{
  const text=await fetchText('https://r.jina.ai/https://www.cnbayarea.org.cn/news/action/index.html');
  const lines=text.split('\n');
  const items=[];
  const seen=new Set();

  const clean=value=>decodeHtml(String(value??''))
    .replaceAll('#',' ')
    .replaceAll('*',' ')
    .replaceAll('_',' ')
    .replaceAll('`',' ')
    .replaceAll('>',' ')
    .split(/\s+/)
    .join(' ')
    .trim();

  const toDate=value=>{
    const s=String(value??'');
    for(const part of s.split(/\s+/)){
      if(/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(part))return `${part}T09:00:00+08:00`;
    }
    return '';
  };

  const readLink=line=>{
    const key='### [';
    const a=line.indexOf(key);
    if(a<0)return null;
    const titleStart=a+key.length;
    const titleEnd=line.indexOf('](',titleStart);
    if(titleEnd<0)return null;
    const urlStart=titleEnd+2;
    const urlEnd=line.indexOf(')',urlStart);
    if(urlEnd<0)return null;
    return {
      title:clean(line.slice(titleStart,titleEnd)).slice(0,160),
      url:absoluteUrl(line.slice(urlStart,urlEnd).trim(),'https://www.cnbayarea.org.cn/')
    };
  };

  for(let i=0;i<lines.length&&items.length<source.maxItems;i++){
    const line=lines[i];
    if(!line.includes('### [')||!line.includes(']('))continue;
    const link=readLink(line);
    if(!link||!link.title||!link.url)continue;
    if(!link.url.includes('cnbayarea.org.cn'))continue;
    if(link.url.includes('/news/action/index.html'))continue;

    const near=[lines[i],lines[i+1]??'',lines[i+2]??'',lines[i+3]??''].join(' ');
    const publishedAt=toDate(near);
    if(!publishedAt)continue;

    const key=`${link.title}|${link.url}|${publishedAt}`;
    if(seen.has(key))continue;
    seen.add(key);

    items.push({title:link.title,url:link.url,publishedAt,tags:['灣區行動','CBA']});
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseCbaOverall=async source=>{
  const pages=[
    ['高層關注','https://r.jina.ai/https://www.cnbayarea.org.cn/news/news1/index.html'],
    ['最新動態','https://r.jina.ai/https://www.cnbayarea.org.cn/news/focus/index.html'],
    ['最新政策','https://r.jina.ai/https://www.cnbayarea.org.cn/policy/policy%20release/policies/index.html']
  ];
  const items=[];
  const seen=new Set();

  const clean=value=>decodeHtml(String(value??''))
    .replaceAll('#',' ')
    .replaceAll('*',' ')
    .replaceAll('_',' ')
    .replaceAll('`',' ')
    .replaceAll('>',' ')
    .split(/\s+/)
    .join(' ')
    .trim();

  const toDate=value=>{
    const s=String(value??'');
    for(const part of s.split(/\s+/)){
      if(/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(part))return `${part}T09:00:00+08:00`;
    }
    return '';
  };

  const readLink=line=>{
    const mark=line.indexOf('[');
    if(mark<0)return null;
    const titleEnd=line.indexOf('](',mark+1);
    if(titleEnd<0)return null;
    const urlStart=titleEnd+2;
    let urlEnd=line.indexOf(')',urlStart);
    const quote=line.indexOf(' "',urlStart);
    if(quote>0&&(urlEnd<0||quote<urlEnd))urlEnd=quote;
    if(urlEnd<0)return null;
    return {
      title:clean(line.slice(mark+1,titleEnd)).slice(0,160),
      url:absoluteUrl(line.slice(urlStart,urlEnd).trim(),'https://www.cnbayarea.org.cn/')
    };
  };

  for(const [label,page] of pages){
    if(items.length>=source.maxItems)break;
    const text=await fetchText(page);
    const lines=text.split('\n');

    for(let i=0;i<lines.length&&items.length<source.maxItems;i++){
      const line=lines[i];
      if(!line.includes('](')||!line.includes('cnbayarea.org.cn'))continue;

      const link=readLink(line);
      if(!link||!link.title||!link.url)continue;
      if(!link.url.includes('cnbayarea.org.cn'))continue;
      if(link.url.includes('/index.html'))continue;

      const near=[lines[i],lines[i+1]??'',lines[i+2]??'',lines[i+3]??''].join(' ');
      const publishedAt=toDate(near);
      if(!publishedAt)continue;

      const title=`(${label}) ${link.title}`;
      const key=`${title}|${link.url}|${publishedAt}`;
      if(seen.has(key))continue;
      seen.add(key);

      items.push({title,url:link.url,publishedAt,tags:['CBA',label]});
    }
  }

  return uniqueCandidates(items)
    .sort((a,b)=>String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .slice(0,source.maxItems);
};

const parseDsop=async source=>{
  const pages=[
    'https://r.jina.ai/https://www.dsop.gov.mo/newslist/',
    'https://r.jina.ai/https://www.dsop.gov.mo/newslist/index_2.html',
    'https://r.jina.ai/https://www.dsop.gov.mo/newslist/index_3.html'
  ];
  const items=[];
  const seen=new Set();

  const clean=value=>decodeHtml(String(value??''))
    .replaceAll('#',' ')
    .replaceAll('*',' ')
    .replaceAll('_',' ')
    .replaceAll('`',' ')
    .replaceAll('>',' ')
    .split(/\s+/)
    .join(' ')
    .trim();

  const dayFromLine=line=>{
    const m=String(line??'').match(/\b(\d{1,2})\b/);
    return m?String(m[1]).padStart(2,'0'):'';
  };

  const monthYearFromLine=line=>{
    const m=String(line??'').match(/(\d{2})-(20\d{2})/);
    return m?{month:m[1],year:m[2]}:null;
  };

  const readLink=line=>{
    const a=line.indexOf('[');
    const b=line.indexOf('](',a+1);
    const c=line.indexOf(')',b+2);
    if(a<0||b<0||c<0)return null;
    return {
      title:clean(line.slice(a+1,b)).slice(0,180),
      url:absoluteUrl(line.slice(b+2,c).trim(),'https://www.dsop.gov.mo/')
    };
  };

  for(const page of pages){
    if(items.length>=source.maxItems)break;
    const lines=(await fetchText(page)).split('\n');

    for(let i=0;i<lines.length&&items.length<source.maxItems;i++){
      const line=lines[i];
      if(!line.includes('dsop.gov.mo/')||!line.includes(']('))continue;
      if(!line.includes('/news/news/')&&!line.includes('/public/traffic/'))continue;

      const link=readLink(line);
      if(!link||!link.title||!link.url)continue;

      const my=monthYearFromLine(line);
      if(!my)continue;

      let day='';
      for(let j=i-1;j>=Math.max(0,i-8);j--){
        day=dayFromLine(lines[j]);
        if(day)break;
      }
      if(!day)continue;

      const publishedAt=`${my.year}-${my.month}-${day}T09:00:00+08:00`;

      const key=`${link.title}|${link.url}|${publishedAt}`;
      if(seen.has(key))continue;
      seen.add(key);

      items.push({
        title:link.title,
        url:link.url,
        publishedAt,
        tags:['公共建設局','DSOP']
      });
    }
  }

  return uniqueCandidates(items).slice(0,source.maxItems);
};

const parseDsscu=async source=>{
  const pages=[
    ['新聞','https://r.jina.ai/https://www.dsscu.gov.mo/zh/latestnews/newslist?page=1&termSlug=news'],
    ['工務資訊站','https://r.jina.ai/https://www.dsscu.gov.mo/zh/latestnews/newslist?page=1&termSlug=information-news']
  ];
  const items=[];
  const seen=new Set();

  const clean=value=>decodeHtml(String(value??''))
    .replaceAll('#',' ')
    .replaceAll('*',' ')
    .replaceAll('_',' ')
    .replaceAll('`',' ')
    .replaceAll('>',' ')
    .split(/\s+/)
    .join(' ')
    .trim();

  const readItems=(line,label)=>{
    const out=[];
    let pos=0;
    while(pos<line.length){
      const a=line.indexOf('[20',pos);
      if(a<0)break;
      const b=line.indexOf('](',a);
      const c=line.indexOf(')',b+2);
      if(b<0||c<0)break;

      const raw=line.slice(a+1,b);
      const href=line.slice(b+2,c).split(' ')[0].trim();

      const date=raw.slice(0,10);
      let title=raw;
      const marker='上載日期:'+date;
      const mi=title.indexOf(marker);
      if(mi>=0)title=title.slice(mi+marker.length);
      title=clean(title);

      if(/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(date)&&title){
        out.push({
          title:title.slice(0,180),
          url:absoluteUrl(href,'https://www.dsscu.gov.mo/'),
          publishedAt:`${date}T09:00:00+08:00`,
          tags:['土地工務局',label]
        });
      }

      pos=c+1;
    }
    return out;
  };

  for(const [label,page] of pages){
    if(items.length>=source.maxItems)break;
    const text=await fetchText(page);
    for(const line of text.split('\n')){
      if(items.length>=source.maxItems)break;
      if(!line.includes('上載日期:'))continue;
      for(const item of readItems(line,label)){
        if(items.length>=source.maxItems)break;
        const key=`${item.title}|${item.publishedAt}|${item.tags.join(',')}`;
        if(seen.has(key))continue;
        seen.add(key);
        items.push(item);
      }
    }
  }

  return uniqueCandidates(items)
    .sort((a,b)=>String(b.publishedAt).localeCompare(String(a.publishedAt)))
    .slice(0,source.maxItems);
};


export const sources=[
  {sourceId:'a_tdm',shortId:'tdm',sourceName:'TDM',domain:'A',category:'A2',refreshMinutes:15,maxItems:30,fetcher:parseTdm},
  {sourceId:'a_gcs',shortId:'gcs',sourceName:'GCS',domain:'A',category:'A1',refreshMinutes:15,maxItems:35,fetcher:parseGcs},
  {sourceId:'a_gcs_housing',shortId:'gcs_housing',sourceName:'GCS 工程房屋',domain:'A',category:'A4',refreshMinutes:30,maxItems:30,fetcher:parseGcsHousing},
  {sourceId:'a_dsop',shortId:'dsop',sourceName:'公共建設局',domain:'A',category:'A4',refreshMinutes:30,maxItems:30,fetcher:parseDsop},
  {sourceId:'a_dsscu',shortId:'dsscu',sourceName:'土地工務局',domain:'A',category:'A4',refreshMinutes:30,maxItems:30,fetcher:parseDsscu},
  {sourceId:'a_macaupostdaily',shortId:'macaupostdaily',sourceName:'Macau Post Daily',domain:'A',category:'A3',refreshMinutes:30,maxItems:30,fetcher:parseMacauPostDaily},
  {sourceId:'a_macaubusiness',shortId:'macaubusiness',sourceName:'Macao Business',domain:'A',category:'A3',refreshMinutes:30,maxItems:30,fetcher:parseMacaoBusiness},
  {sourceId:'a_caeu',shortId:'caeu',sourceName:'CAEU',domain:'A',category:'A5',refreshMinutes:30,maxItems:22,fetcher:parseCaeu},
  {sourceId:'a_govmo_cepa_search',shortId:'govmo_cepa_search',sourceName:'DSEDT CEPA news',domain:'A',category:'A4',refreshMinutes:30,maxItems:20,fetcher:parseCepa},
  {sourceId:'a_hengqin_gov',shortId:'hengqin_gov',sourceName:'橫琴官網',domain:'A',category:'A4',refreshMinutes:30,maxItems:30,fetcher:parseHengqin},
  {sourceId:'a_gcshq',shortId:'gcshq',sourceName:'GCS 橫琴合作區',domain:'A',category:'A4',refreshMinutes:30,maxItems:30,fetcher:parseGcshq},
  {sourceId:'a_gcsgba',shortId:'gcsgba',sourceName:'GCS 粵港澳大灣區',domain:'A',category:'A4',refreshMinutes:30,maxItems:30,fetcher:parseGcsgba},
  {sourceId:'a_cbaaction',shortId:'cbaaction',sourceName:'CBA 灣區行動',domain:'A',category:'A4',refreshMinutes:30,maxItems:30,fetcher:parseCbaAction},
  {sourceId:'a_cbaoverall',shortId:'cbaoverall',sourceName:'CBA 綜合',domain:'A',category:'A4',refreshMinutes:30,maxItems:30,fetcher:parseCbaOverall},
  {sourceId:'a_aamacau',shortId:'aamacau',sourceName:'論盡媒體',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseAamacau},
  {sourceId:'a_allinmedia',shortId:'allinmedia',sourceName:'AllinMedia',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseAllinMedia},
  {sourceId:'a_chengpou',shortId:'chengpou',sourceName:'正報',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseChengpou},
  {sourceId:'a_exmoo',shortId:'exmoo',sourceName:'力報',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseExmoo},
  {sourceId:'a_macaucabletv',shortId:'macaucabletv',sourceName:'澳門有線',domain:'A',category:'A2',refreshMinutes:30,maxItems:30,fetcher:parseMacauCableTv},
  {sourceId:'a_plataforma',shortId:'plataforma',sourceName:'Plataforma',domain:'A',category:'A3',refreshMinutes:30,maxItems:30,fetcher:parsePlataforma}
];

export const sourceById=id=>sources.find(source=>source.sourceId===id||source.shortId===id);
