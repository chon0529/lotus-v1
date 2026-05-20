/**
 * Version: M2.4A-1
 * Date: 2026-05-20
 * Author: GPT / Nova-Lotus
 * Purpose: Run all M2.2 normal health fetch sources sequentially.
 * Input: none
 * Output: per-source fetch JSON/history/health/log updates through fetchFoundation.
 */

import {spawn} from 'node:child_process';
import fs from 'node:fs';

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

const jobs=[
  'fetch_tdm.js',
  'fetch_gcs.js',
  'fetch_gcs_housing.js',
  'fetch_dsop.js',
  'fetch_dsscu.js',
  'fetch_cru.js',
  'fetch_cpu.js',
  'fetch_macaupostdaily.js',
  'fetch_macaubusiness.js',
  'fetch_caeu.js',
  'fetch_govmo_cepa_search.js',
  'fetch_hengqin_gov.js',
  'fetch_gcshq.js',
  'fetch_gcsgba.js',
  'fetch_cbaaction.js',
  'fetch_cbaoverall.js',
  'fetch_chengpou.js',
  'fetch_exmoo.js',
  'fetch_macaucabletv.js',
  'fetch_macaudailytimes.js',
  'fetch_jtm.js',
  'fetch_hojemacau.js',
  'fetch_macaodaily.js'
];

const runJob=file=>new Promise(resolve=>{
  const started=Date.now();
  const child=spawn(process.execPath,[`crawler/${file}`],{stdio:'inherit'});
  child.on('close',code=>resolve({file,code,ms:Date.now()-started}));
  child.on('error',err=>resolve({file,code:1,error:err.message,ms:Date.now()-started}));
});

const jobSourceId=file=>`a_${file.replace(/^fetch_/,'').replace(/\.js$/,'')}`;
const readHealth=()=>{
  try{
    const data=JSON.parse(fs.readFileSync('public/data/system/source_health.json','utf8'));
    const arr=Array.isArray(data)?data:data.sources??[];
    return new Map(arr.map(item=>[item.sourceId??item.id??item.sourceKey,item]));
  }catch{
    return new Map();
  }
};

const summary=[];
console.log('\n=== Nova-Lotus M2.4A run_all_m22_sources start ===');
console.log(`jobs=${jobs.length}`);

for(const file of jobs){
  console.log(`\n=== RUN ${file} ===`);
  const result=await runJob(file);
  const health=readHealth().get(jobSourceId(file));
  result.healthStatus=health?.status??'missing';
  result.healthCount=health?.latestCount??0;
  result.healthRel=health?.relevanceStatus??'';
  result.healthError=health?.lastError??'';
  result.healthOk=result.code===0&&result.healthStatus==='normal'&&result.healthRel==='matched';
  summary.push(result);
  console.log(`=== DONE ${file} code=${result.code} health=${result.healthStatus} count=${result.healthCount} rel=${result.healthRel} ms=${result.ms}${result.error?` error=${result.error}`:''} ===`);
  await sleep(6000);
}

const ok=summary.filter(x=>x.healthOk);
const failed=summary.filter(x=>!x.healthOk);

console.log('\n=== SUMMARY ===');
console.log(`success=${ok.length}`);
console.log(`failed=${failed.length}`);
for(const item of summary){
  console.log(`${item.healthOk?'OK':'HEALTH_FAIL'} ${item.file} code=${item.code} health=${item.healthStatus} count=${item.healthCount} rel=${item.healthRel} ${item.ms}ms${item.healthError?` err=${item.healthError}`:''}${item.error?` ${item.error}`:''}`);
}

if(failed.length)process.exitCode=1;

// GPT-M2.4A-1
