// crawler/fetch_hengqingov_ws.js
import fs from 'fs'
import axios from 'axios'

const url = 'https://r.jina.ai/http://hengqin.gd.gov.cn/zwgk/tzgg/'
const outputPath = './data/fetch_hengqingov_ws.json'

console.log('[爬蟲] fetch_hengqingov_ws 啟動')

try {
  const res = await axios.get(url)
  const text = res.data

  const lines = text
    .split('\n')
    .filter(line => line.includes('http') && line.includes(')') && line.includes(']'))

  const items = lines.map(line => {
    const match = line.match(/\*\s*\[(.*?)\]\((.*?)\s*"(.*?)"\)\s*([\d\-]{4}-[\d\-]{2}-[\d\-]{2})/)
    if (!match) return null
    const [, title, link, , date] = match
    return {
      title: title.trim(),
      link: link.trim(),
      date: date.trim()
    }
  }).filter(Boolean)

  if (items.length === 0) {
    console.log('[錯誤] 找不到任何新聞項目')
  } else {
    fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf-8')
    console.log(`[完成] 共儲存 ${items.length} 則新聞`)
    console.log('[預覽] 第 1 則：', items[0])
  }
} catch (err) {
  console.error('[錯誤] 無法抓取：', err.message)
}
