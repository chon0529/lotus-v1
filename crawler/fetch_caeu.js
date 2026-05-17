import {runSource} from './lib/fetchFoundation.js';
import {sourceById} from './sources.js';

const source={
  ...sourceById('a_caeu'),
  quality:{
    relevanceStatus:'unchecked',
    maxNewestAgeDays:45,
    staleRatioDays:180,
    staleRatioLimit:0.9
  }
};

await runSource(source);
