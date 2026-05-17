import {runSource} from './lib/fetchFoundation.js';
import {sourceById} from './sources.js';

const source={
  ...sourceById('a_hengqin_gov'),
  quality:{
    relevanceStatus:'matched',
    maxNewestAgeDays:45,
    staleRatioDays:120,
    staleRatioLimit:0.85
  }
};

await runSource(source);
