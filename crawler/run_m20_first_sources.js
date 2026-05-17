import {runSource} from './lib/fetchFoundation.js';
import {sources} from './sources.js';

const selected=new Set(process.argv.slice(2));
const toRun=selected.size?sources.filter(source=>selected.has(source.sourceId)||selected.has(source.shortId)):sources;

for(const source of toRun){
  const result=await runSource(source);
  console.log(`${result.sourceId}: ${result.status} (${result.count}) ${result.message}`);
}
