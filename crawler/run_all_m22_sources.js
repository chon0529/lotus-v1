/**
 * Version: M2.4A
 * Date: 2026-05-20
 * Author: GPT / Nova-Lotus
 * Purpose: Run all M2.2 normal health fetch sources sequentially.
 * Input: none
 * Output: per-source fetch JSON/history/health/log updates through fetchFoundation.
 */

import {spawn} from 'node:child_process';

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
  'fetch_aamacau.js',
  'fetch_allinmedia.js',
  'fetch_chengpou.js',
  'fetch_exmoo.js',
  'fetch_macaucabletv.js',
  'fetch_plataforma.js',
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

const summary=[];
console.log('\n=== Nova-Lotus M2.4A run_all_m22_sources start ===');
console.log(`jobs=${jobs.length}`);

for(const file of jobs){
  console.log(`\n=== RUN ${file} ===`);
  const result=await runJob(file);
  summary.push(result);
  console.log(`=== DONE ${file} code=${result.code} ms=${result.ms}${result.error?` error=${result.error}`:''} ===`);
  await sleep(1500);
}

const ok=summary.filter(x=>x.code===0);
const failed=summary.filter(x=>x.code!==0);

console.log('\n=== SUMMARY ===');
console.log(`success=${ok.length}`);
console.log(`failed=${failed.length}`);
for(const item of summary){
  console.log(`${item.code===0?'OK':'FAIL'} ${item.file} ${item.ms}ms${item.error?` ${item.error}`:''}`);
}

if(failed.length)process.exitCode=1;

// GPT-M2.4A
