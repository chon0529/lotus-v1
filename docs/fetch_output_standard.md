# Fetch Output Standard

## 1. Raw Fetch Output Rule

public/data/fetch/fetch_<shortId>.json must contain only the current valid items fetched from the source during the latest successful run.

It must not be padded with historical items.

Reason:
- fetch_<shortId>.json is the source-of-truth for the latest fetch.
- It must reflect the real latest source state.
- It must not fake freshness by mixing old history into current fetch output.

## 2. History Output Rule

public/data/history/his_<shortId>.json stores accumulated historical items for the same source.

History is used only for:
- display supplementation;
- deduplication reference;
- fallback reading in UI display layer.

History must not overwrite or inflate latestCount.

## 3. Display Target Count Rule

DISPLAY_TARGET_COUNT = 22

Rule:
1. Use current fetch items first.
2. If current fetch items are fewer than 22, supplement from his_<shortId>.json.
3. Historical supplement must dedupe against current items.
4. Dedupe key priority:
   - url
   - fallback: title + publishedAt
5. Insert divider row before supplemented historical rows:
   -以下為早前消息-
6. Divider row is not a news item.
7. Divider row must not be clickable.
8. Divider row must not count toward source_health.latestCount.
9. source_health.latestCount must always count current fetch items only.

## 4. Display Row Format

Current news row:
- type: news
- title: current title
- url: original URL
- publishedAt: YYYY-MM-DDTHH:mm:ss+08:00
- fromHistory: false

Divider row:
- type: divider
- title: -以下為早前消息-

Historical supplement row:
- type: news
- title: older title
- url: original URL
- publishedAt: YYYY-MM-DDTHH:mm:ss+08:00
- fromHistory: true

## 5. News Item Schema

| Field | Required | Layer | Notes |
|---|---:|---|---|
| title | yes | raw/display | Clean title. No navigation, pagination, HTML pollution. |
| url | yes | raw/display | Original URL. If no detail URL exists, use the real list URL only. Do not fake detail URLs. |
| publishedAt | yes | raw/display | YYYY-MM-DDTHH:mm:ss+08:00, Asia/Macau. |
| summary | optional | raw/display | Source-provided abstract only. Do not AI-generate inside raw fetch. |
| imageUrl | optional | raw/display | Source-provided image URL only. Do not use favicon as fake image. |
| author | optional | raw/display | Source department, author, or publisher if present. |
| tags | recommended | raw/display | Source/category tags. |
| sourceId | recommended | normalized/display | Example: a_gcs. |
| sourceName | recommended | normalized/display | Example: GCS. |
| language | optional | normalized/display | Example: zh-hant, pt, en. |
| category | optional | normalized/display | Project category, e.g. A3, A4. |
| fetchedAt | system | normalized/history | Fetch time in Asia/Macau. |
| hash | system | normalized/history | Stable dedupe hash from title + url + publishedAt. |
| fromHistory | display only | display | true only for history supplementation. |
| type | display only | display | news or divider. |

## 6. Image URL Rule

imageUrl may be stored when the source provides a real news image.

Allowed:
- article thumbnail;
- OpenGraph image if directly associated with the article;
- RSS enclosure image;
- WordPress featured media image.

Not allowed:
- site favicon;
- logo used as fake image;
- AI-generated image;
- unrelated layout image.

If no valid image is available, use empty string or omit the field.

## 7. Summary / Abstract Rule

summary may be stored when the source provides a real abstract.

Allowed:
- RSS description;
- article lead paragraph;
- source-provided excerpt;
- WordPress excerpt.

Not allowed:
- AI-generated summary inside raw fetch;
- unrelated page text;
- navigation text;
- duplicated title pretending to be summary.

If no valid abstract is available, use empty string or omit the field.

## 8. Health Standard

source_health.json must record the latest fetch status only.

latestCount must be the number of valid current fetch items.

It must not include:
- historical supplement rows;
- divider rows;
- fallback display rows.

Valid status:

| status | Meaning |
|---|---|
| normal | Latest fetch produced valid current items. |
| empty | Latest fetch produced no valid items. |
| stale | Source exists, but parser/source requires checking. |
| failed | Fetch failed. |
| skipped | Source intentionally not run or replaced. |

## 9. No Fake Normal Rule

A source must not be marked normal if:
- all items are historical only;
- parser produced navigation/pagination rows;
- title/date are fabricated;
- source URL returns unrelated content;
- topic/category page mixes unrelated topics and parser cannot filter them.

## 10. Frontend Display Adapter Rule

The frontend display layer may build a 22-row display list from:
- fetch_<shortId>.json
- his_<shortId>.json

The adapter must not write files.

It only creates display rows in memory.
