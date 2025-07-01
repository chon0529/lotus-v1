// fetch_mopostd_ws.js
import fs from 'fs'
import fetch from 'node-fetch'

const url = 'https://r.jina.ai/https://www.macaupostdaily.com/news/list?tab=LATEST'
const outputPath = './data/fetch_mopostd_ws.json'

console.log('[爬蟲] fetch_mopostd_ws 啟動')

function extractTitleAndAbstract(fullText) {
  const words = fullText.split(/\s+/)
  const prepositions = [
    'A', 'An', 'The', 'To', 'Of', 'On', 'At', 'In', 'Is', 'As', 'By', 'For', 'From', 'With',
    'Raising', 'Launching', 'Opening', 'Boosting', 'Proposing', 'Building', 'Increasing'
  ]

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const prev = words[i - 1] || ''
    const next = words[i + 1] || ''
    const isSurroundedBySpace = prev && next && !prev.endsWith('.') && !next.endsWith('.')

    if (prepositions.includes(word) && isSurroundedBySpace) {
      const title = words.slice(0, i).join(' ')
      const abstract = words.slice(i).join(' ')
      return { title, abstract }
    }
  }

  return { title: fullText, abstract: '' }
}

function extractArticles(markdown) {
  const regex = /\[#####\s*([^\]]+?)\s*!\[[^\]]*\]\(([^)]+)\)\]\(([^)]+)\)/g
  const results = []
  let match

  while ((match = regex.exec(markdown)) !== null) {
    const fullText = match[1].trim()
    const imageUrl = match[2].trim()
    const link = match[3].trim()
    const { title, abstract } = extractTitleAndAbstract(fullText)

    results.push({ title, abstract, link, image: imageUrl })
  }

  return results
}

try {
  const res = await fetch(url)
  const text = await res.text()

  const articles = extractArticles(text)

  if (articles.length > 0) {
    fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2))
    console.log(`[完成] 共儲存 ${articles.length} 則新聞 → ${outputPath}`)
  } else {
    console.log('[警告] 未擷取到任何新聞，請檢查來源與選擇器')
  }
} catch (err) {
  console.error('[錯誤] 無法擷取資料:', err)
}
