# 00_terms.md — Lotus News Station 術語表

版本：v0.1  
日期：2026-05-15  
時區：Asia/Macau  
用途：統一 Lotus News Station 後續討論、Source Registry、NewsBox、fetch 結果、UI 頁面與檔案命名。

---

## 0. 基本定位

Lotus News Station 是「My News List Station」：

- A：政府政策 / 澳門及區域合作新聞
- B：AS Roma / 體育新聞
- C：財經市場 / 股票與財經新聞

第一版重點：

- 本機優先
- A 機跑 server，B/C 機與手機透過內網瀏覽
- 暫不做登入
- Source Registry 先行
- UI 先以假資料跑通，再逐個接 real fetch

---

## 1. Domain

**Domain = 主域。**

最高層分類。

| Domain | 名稱 | 內容 |
|---|---|---|
| A | 政府政策 | 政府公布、中文新聞、外語新聞、區域合作、委員會工作 |
| B | AS Roma / 體育 | X 記者、意媒、官方、轉會、市場、比賽日 |
| C | 財經市場 | 美股、港股、財經新聞、股價、Watchlist、商品價格 |

程式使用小寫：

```txt
a
b
c
```

---

## 2. Source

**Source = 真正被抓取的來源。**

例如：

```txt
a_gcs
a_tdm
a_macau_daily
a_macaubusiness
b_laroma24
c_yahoo_finance
```

規則：

- Source 是資料來源，不是 UI 盒子。
- Source 不應帶 NewsBox ID。
- 同一 Source 可被多個 NewsBox 引用。
- 同一 Source 只應有一個 fetch 結果檔。

檔名：

```txt
fetch_{sourceKey}.json
his_{sourceKey}.json
```

例：

```txt
fetch_a_gcs.json
his_a_gcs.json
```

---

## 3. Endpoint

**Endpoint = 同一 Source 下的入口。**

例如：

```txt
a_gcs / web
a_gcs / rss
a_tdm / jina
a_tdm / web
a_al / written
a_al / oral
```

規則：

- Endpoint 不生成獨立 fetch 檔。
- 同一 Source 的不同 endpoint 最終合併到同一 `fetch_{sourceKey}.json`。
- RSS、Jina、Puppeteer backup 都應作 endpoint，不應另起 source。

例：

```txt
a_gcs / web
a_gcs / rss
→ fetch_a_gcs.json
```

---

## 4. SubSource

**SubSource = 同一 Source 內部的子分類。**

例：

```txt
a_cbaoverall / highlevel
a_cbaoverall / dynamic
a_cbaoverall / policy
```

規則：

- SubSource 不是獨立 Source。
- SubSource 不生成獨立 fetch 檔。
- UI Tab 可用 SubSource 過濾。

例：

```txt
a_cbaoverall / highlevel
a_cbaoverall / dynamic
a_cbaoverall / policy
→ fetch_a_cbaoverall.json
```

---

## 5. NewsItem

**NewsItem = 標準化後的一條新聞。**

通用欄位：

```json
{
  "articleId": "a_gcs_20260515_abcd1234",
  "domain": "a",
  "sourceKey": "a_gcs",
  "endpointKey": "web",
  "subSourceKey": "",
  "newsBoxIds": ["a1"],
  "title": "",
  "originalTitle": "",
  "translatedTitle": "",
  "url": "",
  "dateTime": "2026-05-15T10:00:00+08:00",
  "fetchedAt": "2026-05-15T10:05:00+08:00",
  "timezone": "Asia/Macau",
  "tags": [],
  "summary": "",
  "hash": "abcd1234"
}
```

規則：

- 所有時間使用 Asia/Macau。
- 不使用 UTC 作輸出。
- `articleId` 建議格式：`{sourceKey}_{YYYYMMDD}_{hash8}`。

---

## 6. NewsBox

**NewsBox = UI 上的一個新聞盒。**

正式取代舊稱 `CardBox`。

A 類目前固定：

| NewsBox ID | UI 短名 | 內容 |
|---|---|---|
| A1 | 政府公布 | 政府主源與官方公布 |
| A2 | 中文新聞 | 本地中文媒體 |
| A3 | 外語新聞 | 英文、葡文、中葡媒體 |
| A4 | 區域合作 | CEPA、橫琴、大灣區 |
| A5 | 委員會工作 | 城規、都更、公共建設、委員會相關 |

程式檔案仍用簡短 box 名：

```txt
box_a1.json
box_a2.json
box_a3.json
```

---

## 7. Source NewsBox

**Source NewsBox = 單來源新聞盒。**

只顯示一個 source。

例：

```txt
GCS 新聞局
TDM 澳廣視
Macao Business
LaRoma24
Yahoo Finance
```

用途：

- `sub_all` 點 source icon 後展開。
- 顯示該 source 最新新聞、狀態、更新時間。

---

## 8. Multi-Source NewsBox / MultiBox

**Multi-Source NewsBox = 多來源新聞盒。**

一個 NewsBox 包含多個 Source，內部有 Tabs。

例：

```txt
A2 中文新聞
- 全部
- TDM
- 澳門日報
- 力報
- 澳門有線
```

規則：

- UI 顯示一盒，不是每個 source 一盒。
- NewsBox 內可用 Tab 過濾 source / subsource / topic / ticker。
- 多來源新聞先按時間排序；權重排序稍後再議。

簡稱：

```txt
MultiBox
```

---

## 9. Tab

**Tab = NewsBox 內部切換。**

Tab 類型：

| 類型 | 例子 |
|---|---|
| source | TDM、澳門日報、LaRoma24 |
| subsource | highlevel、dynamic、policy |
| ticker | NOK、NVDA、AMD |
| topic | CEPA、都更、球場 |
| language | IT、EN、PT、ZH |

---

## 10. NewsWall

**NewsWall = sub_all 的主體 UI。**

結構：

```txt
A 政府政策
[source/newsbox icons...]
[expanded NewsBox 1] [expanded NewsBox 2] [expanded NewsBox 3]

B AS Roma
[source/newsbox icons...]
[expanded NewsBox 1] [expanded NewsBox 2] [expanded NewsBox 3]

C 財經
[source/newsbox icons...]
[expanded NewsBox 1] [expanded NewsBox 2] [expanded NewsBox 3]
```

規則：

- 每個 Domain 最多同時展開 3 個 NewsBox。
- 點 icon 展開；已展開再點則收起。
- 超過 3 個時，替換最舊展開的 NewsBox。

---

## 11. FocusFeed

**FocusFeed = sub_main 的今日情報流。**

桌面：

```txt
A Top 15
B Top 15
C Top 15
```

手機：

```txt
A Top 3 + 更多
B Top 3 + 更多
C Top 3 + 更多
```

第一版排序：

```txt
date_desc
```

即以時間倒序。

---

## 12. MergedNews

**MergedNews = 多來源同事件合併新聞。**

例：

```txt
GCS、TDM、澳門日報都報同一 CEPA 事件
```

UI 可顯示：

```txt
[CEPA] 服務貿易協議新一輪磋商展開
來源 3 | GCS + TDM + 澳門日報
```

第一版可先不做智能合併，但資料結構保留。

---

## 13. WatchItem

**WatchItem = 長期關注項。**

例：

```txt
CEPA
澳門都更
橫琴政策
Massara
Gasperini
NOK
NVDA
Nikon ZR
```

WatchItem 可跨 Domain。

---

## 14. SourceHealth

**SourceHealth = 來源健康狀態。**

狀態值：

| 狀態 | 意思 |
|---|---|
| success | 最近一次成功 |
| failed | 最近一次失敗 |
| stale | 資料過期 |
| fallback | 使用備援 endpoint |
| disabled | 已停用 |
| empty | 初始化後尚無資料 |

失敗規則：

- 不覆蓋上一個成功的 `fetch_*.json`
- 不寫入 `his_*.json`
- 更新 `source_health.json`
- 寫入 `overalllog.json`
- 更新 `last_updated.json.lastFail`

---

## 15. Fetch Result

**Fetch Result = 每個 Source 的最新抓取結果。**

檔名：

```txt
fetch_{sourceKey}.json
```

例：

```txt
fetch_a_gcs.json
fetch_a_tdm.json
fetch_b_laroma24.json
fetch_c_yahoo_finance.json
```

格式：

```json
{
  "schema": "lotus.fetch.v1",
  "sourceKey": "a_gcs",
  "domain": "a",
  "status": "success",
  "endpointUsed": "web",
  "generatedAt": "2026-05-15T10:00:00+08:00",
  "timezone": "Asia/Macau",
  "count": 15,
  "items": []
}
```

---

## 16. History Result

**History Result = Source 歷史檔。**

檔名：

```txt
his_{sourceKey}.json
```

只記成功資料。

---

## 17. Box Result

**Box Result = NewsBox 的整合結果。**

檔名：

```txt
box_{newsBoxKey}.json
```

例：

```txt
box_a1.json
box_a2.json
box_b2.json
box_c1.json
```

Box Result 由多個 Fetch Result 生成。

---

## 18. View Result

**View Result = 頁面級資料。**

檔名：

```txt
view_{page}.json
```

例：

```txt
view_sub_main.json
view_sub_all.json
view_sub_health.json
```

View Result 由 Box Result + SourceHealth + Watchlist 組成。

---

## 19. Registry

**Registry = 系統設定表。**

分三類：

```txt
sourceRegistry.A.js
sourceRegistry.B.js
sourceRegistry.C.js
newsboxes.js
```

A 表目前是 registry 的人工版，之後轉成 JS module。

---

## 20. 命名總則

| 類型 | 命名 |
|---|---|
| Domain | `a` / `b` / `c` |
| Source Key | `a_gcs` |
| Endpoint | `web` / `rss` / `jina` / `written` |
| SubSource | `highlevel` / `dynamic` / `policy` |
| Parser | `parse_a_gcs.js` |
| Fetch Result | `fetch_a_gcs.json` |
| History Result | `his_a_gcs.json` |
| NewsBox Key | `a1` / `a2` |
| Box Result | `box_a1.json` |
| View Result | `view_sub_main.json` |
| Batch Runner | `run_all_a.js` |

---

## 21. 禁止混用

| 不應使用 | 改用 |
|---|---|
| CardBox | NewsBox |
| fetch_A1.json | box_a1.json |
| a1_gcs | a_gcs |
| a_gcs_rss | a_gcs / rss |
| fetch_a_cba_highlevel.json | fetch_a_cbaoverall.json + subSourceKey |
| UTC 輸出時間 | Asia/Macau `+08:00` |
