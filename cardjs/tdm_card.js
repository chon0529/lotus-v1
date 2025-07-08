// tdm_card.js - Lotus 1 專用
import dayjs from 'dayjs';

// ====== 卡片參數區 ======
const CARD_KEY = 'tdm_ws_cb';
const CARD_TITLE = '澳廣視 圖片新聞';
const FETCH_JSON = './data/fetch_tdm_ws_cb.json';
const BG_COLOR = '#224d27';    // 你可改深綠
const REFRESH_MINS = 60;       // 自動刷新間隔
const MAX_NEWS = 30;

// ====== 載入資料 ======
async function fetchNews() {
  const res = await fetch(FETCH_JSON + `?t=${Date.now()}`);
  return await res.json();
}

// ====== 日期格式處理 ======
function fmtDate(str) {
  if (!str) return '';
  // pubDate 格式為 2025-07-06 19:40 或 07-06
  const today = dayjs().format('YYYY-MM-DD');
  if (str.startsWith(today)) {
    // 取 HH:MM
    return str.slice(11, 16);
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(5, 10); // MM-DD
  }
  return str;
}

// ====== 渲染卡片 ======
export async function cardInit(root) {
  root.innerHTML = `
    <div style="background:${BG_COLOR};color:#fff;border-radius:18px;box-shadow:0 2px 10px #0002; padding:18px 16px; font-family:'HanaMin','Noto Sans TC',sans-serif; min-width:320px; max-width:420px;">
      <div style="font-size:1.3em;font-weight:bold; letter-spacing:1px;margin-bottom:4px;">
        ${CARD_TITLE}
        <span id="${CARD_KEY}-count" style="font-size:.85em;font-weight:400;opacity:.7"></span>
      </div>
      <div id="${CARD_KEY}-time" style="font-size:0.9em;color:#c2efc6;margin-bottom:6px;"></div>
      <ul id="${CARD_KEY}-news" style="list-style:none;padding:0;margin:0"></ul>
      <div style="font-size:.8em;opacity:.5;margin-top:4px;">自動每${REFRESH_MINS}分鐘更新</div>
    </div>
  `;
  await render();
  let left = REFRESH_MINS * 60;
  setInterval(() => {
    left -= 1;
    const t = document.getElementById(`${CARD_KEY}-time`);
    if (t) t.innerText = `下次自動刷新：${Math.floor(left/60)}分${left%60}秒`;
    if (left <= 0) { render(); left = REFRESH_MINS * 30; }
  }, 1000);
  async function render() {
    const news = await fetchNews();
    const ul = document.getElementById(`${CARD_KEY}-news`);
    const t = document.getElementById(`${CARD_KEY}-time`);
    ul.innerHTML = '';
    t.innerText = `上次更新：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`;
    document.getElementById(`${CARD_KEY}-count`).innerText = `（${news.length}則）`;
    news.slice(0, MAX_NEWS).forEach(item => {
      const li = document.createElement('li');
      li.style = 'margin-bottom:7px;line-height:1.45;';
      li.innerHTML = `
        <a href="${item.link}" target="_blank" style="color:#fff;text-decoration:none;font-weight:bold;">
          ${item.title}
        </a>
        <span style="font-size:.9em;font-weight:400;opacity:.6;margin-left:7px">${fmtDate(item.pubDate)}</span>
      `;
      ul.appendChild(li);
    });
  }
}