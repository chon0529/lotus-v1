import {runSource} from './lib/fetchFoundation.js';
import {sourceById} from './sources.js';

const source={
  ...sourceById('a_govmo_cepa_search'),
  quality:{
    relevanceStatus:'matched',
    maxNewestAgeDays:540,
    staleRatioDays:900,
    staleRatioLimit:0.9
  }
};

await runSource(source);
