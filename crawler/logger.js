// logger.js
// [中英文說明] 統一的爬蟲提示訊息模組，含時間戳、狀態標籤與顏色

import chalk from 'chalk'; // 顏色化輸出，請先執行：npm i chalk

/**
 * 取得目前時間字串
 * @returns {string} 例如 [2025-07-02 22:45:03]
 */
function getTime() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `[${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
}

/**
 * 顯示爬蟲啟動訊息
 * @param {string} name - 爬蟲名稱
 */
export function logStart(name) {
  console.log(chalk.blueBright(`\n${getTime()} [啟動] 🚀 ${name} 開始執行...\n`));
}

/**
 * 顯示成功訊息
 * @param {string} message - 成功說明內容
 */
export function logSuccess(message) {
  console.log(chalk.green(`${getTime()} [成功] ✅ ${message}`));
}

/**
 * 顯示錯誤訊息
 * @param {string} message - 錯誤說明內容
 */
export function logError(message) {
  console.error(chalk.red(`${getTime()} [錯誤] ❌ ${message}`));
}

/**
 * 顯示警告訊息
 * @param {string} message - 警告說明內容
 */
export function logWarning(message) {
  console.warn(chalk.yellow(`${getTime()} [警告] ⚠️ ${message}`));
}

/**
 * 顯示一般訊息
 * @param {string} message - 說明內容
 */
export function logInfo(message) {
  console.log(chalk.cyan(`${getTime()} [訊息] ℹ️ ${message}`));
}