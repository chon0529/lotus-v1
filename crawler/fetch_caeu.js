import {runSource} from './lib/fetchFoundation.js';
import {sourceById} from './sources.js';

const source={
  ...sourceById('a_caeu'),
  quality:{
    relevanceStatus:'matched',
    maxNewestAgeDays:45,
    staleRatioDays:180,
    staleRatioLimit:0.95
  }
};

await runSource(source);
