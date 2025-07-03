// logger.js

const logger = {
  log: (status, action, desc) => {
    const now = new Date();
    const date =
      now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    const time =
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');
    console.log(`[${date} ${time}] [${status}] [${action}] ${desc}`);
  },

  info: (desc)    => logger.log('啟動', '🚀', desc),
  success: (desc) => logger.log('成功', '✅', desc),
  error: (desc)   => logger.log('錯誤', '❌', desc),
  preview: (desc) => logger.log('預覽', '🔎', desc),

  savedMain: (scriptName, total, filename) => {
    console.log(`${scriptName} 的結果，共 ${total} 條新聞已存至於 ${filename}`);
  },
  savedHis: (scriptName, filename, newCount) => {
    console.log(`${scriptName} 的結果已存至於 ${filename}，共新增 ${newCount} 條新聞`);
  }
};

export { logger };
