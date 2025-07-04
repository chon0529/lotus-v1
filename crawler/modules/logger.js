// crawler/modules/logger.js
import dayjs from 'dayjs';

// 取得標準時間字串
function getTime() {
  // 2025/07/03 20:34:05
  return `[${dayjs().format('YYYY/MM/DD HH:mm:ss')}]`;
}

// Info
function logInfo(msg) {
  console.log(`${getTime()} [INFO] ℹ️ ${msg}`);
}

// 成功
function logSuccess(msg) {
  console.log(`${getTime()} [成功] ✅ ${msg}`);
}

// 錯誤
function logError(msg) {
  console.log(`${getTime()} [錯誤] ❌ ${msg}`);
}

// 預覽（推薦直接印物件，無 undefined）
function logPreview(obj) {
  console.log(`${getTime()} [預覽] 🔍`);
  console.dir(obj, { depth: null, colors: true });
}

// 你如果要 "一行" 顯示可用：
// function logPreview(obj) {
//   console.log(`${getTime()} [預覽] 🔍 ${JSON.stringify(obj, null, 2)}`);
// }

export { logInfo, logSuccess, logError, logPreview };