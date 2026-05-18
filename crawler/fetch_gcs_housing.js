import {runSource} from './lib/fetchFoundation.js';
import {sourceById} from './sources.js';

await runSource({...sourceById('a_gcs_housing'),quality:{relevanceStatus:'matched'}});
