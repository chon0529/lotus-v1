// macaubusiness_card.js - Lotus v1.0.0
// 澳門商報新聞卡片元件
// BG: #FC9F4D

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

const DATA_URL = './data/fetch_macaubusiness_ws_cb.json'
const CARD_ID = 'card-macaubusiness'
const INTERVAL_MINUTES = 120 // 兩小時
const BG_COLOR = '#FC9F4D'
const MAX = 22

// 讀取JSON
async function loadNews() {
  const res = await fetch(DATA_URL + '?_t=' + Date.now())
  return res.json()
}

// 倒數計時顯示
function getCountdownText(lastTime) {
  const diff = INTERVAL_MINUTES * 60 - dayjs().diff(dayjs(lastTime), 'second')
  if (diff <= 0) return '即將自動更新'
  const dur = dayjs.duration(diff, 'seconds')
  if (dur.asMinutes() < 1) return `${dur.seconds()}秒後自動更新`
  if (dur.asHours() < 1) return `${dur.minutes()}分鐘後自動更新`
  return `${dur.hours()}小時${dur.minutes()}分鐘後自動更新`
}

// 卡片渲染
export async function cardInit() {
  const container = document.getElementById(CARD_ID)
  if (!container) return

  // 加背景色
  container.style.background = BG_COLOR
  container.style.borderRadius = '1.5rem'
  container.style.boxShadow = '0 2px 10px #0001'
  container.style.color = '#fff'
  container.style.fontFamily = 'HanaMin, 微軟正黑體, PMingLiU, sans-serif'

  // 卡片內容載入
  async function render() {
    container.innerHTML = `<div class="card-title" style="font-size:1.2rem;font-weight:bold;">澳門商報 Macau Business</div>
    <div id="mb-time" style="font-size:.95rem;margin:0.5em 0 0.7em 0;">資料載入中...</div>
    <ol id="mb-list" style="padding-left:1.4em;"></ol>`

    let news = []
    let lastTime = dayjs()
    try {
      news = await loadNews()
      news = news.slice(0, MAX)
    } catch (e) {
      document.getElementById('mb-time').innerText = '載入失敗'
      return
    }

    // lastTime from last_updated.json
    let lastSuccess = null
    try {
      const lastMeta = await fetch('./data/last_updated.json?_t=' + Date.now()).then(r => r.json())
      lastSuccess = lastMeta && lastMeta.macaubusiness && lastMeta.macaubusiness.lastSuccess
    } catch {}
    document.getElementById('mb-time').innerText =
      '上次更新：' + (lastSuccess ? dayjs(lastSuccess).format('YYYY-MM-DD HH:mm') : '無資料') +
      '｜' + getCountdownText(lastSuccess)

    // List
    const ol = document.getElementById('mb-list')
    ol.innerHTML = news.map(
      n => `<li style="margin-bottom:.4em;">
        <a href="${n.link}" target="_blank" style="color:#fff;text-decoration:underline;font-weight:600">${n.title}</a>
        <span style="font-size:.93em;font-weight:normal;margin-left:.5em;">${formatDate(n.date)}</span>
      </li>`
    ).join('')
  }

  // 格式化日期
  function formatDate(d) {
    if (!d) return ''
    if (dayjs(d).isSame(dayjs(), 'day')) return '今日'
    return dayjs(d).format('MM-DD')
  }

  // 初始渲染
  await render()

  // 自動倒數更新
  let timer = setInterval(render, INTERVAL_MINUTES * 60 * 1000)
  // 手動刷新
  container.addEventListener('dblclick', async () => {
    await render()
  })
}