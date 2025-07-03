// logger.js
import dayjs from 'dayjs';

function getTime() {
  return `[${dayjs().format('YYYY/MM/DD HH:mm:ss')}]`;
}

function logInfo(msg) {
  console.log(`${getTime()} [INFO] ℹ️ ${msg}`);
}

function logSuccess(msg) {
  console.log(`${getTime()} [成功] ✅ ${msg}`);
}

function logError(msg) {
  console.log(`${getTime()} [錯誤] ❌ ${msg}`);
}

function logPreview(msg, data) {
  console.log(`${getTime()} [預覽] 🔍 ${msg}`);
  console.dir(data, { depth: null, colors: true });
}

export { logInfo, logSuccess, logError, logPreview };
