// crawler/modules/logger.js
import { nowMacau } from '../../utils/time.js';

export function logInfo(msg) {
  console.log(`[${nowMacau()}] [INFO] ℹ️ ${msg}`);
}
export function logSuccess(msg) {
  console.log(`[${nowMacau()}] [成功] ✅ ${msg}`);
}
export function logError(msg) {
  console.log(`[${nowMacau()}] [錯誤] ❌ ${msg}`);
}
export function logPreview(obj) {
  console.log(`[${nowMacau()}] [預覽] 🔍\n${JSON.stringify(obj, null, 2)}`);
}
///// the end of logger.js
