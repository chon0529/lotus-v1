# Codex Working Rules for Nova-Lotus

## 1. Project Identity

- Project name: Nova-Lotus.
- Nova-Lotus is a local-first personal news station.
- Current stage: fake JSON, UI structure, and no real crawler yet.
- M1 work should keep the app local, simple, and driven by fake data.

## 2. Core Terms

- Domain: top-level area of news, using A, B, and C.
- Source: the real data origin, such as `a_gcs`, `a_tdm`, or `b_laroma24`.
- Endpoint: one entry under a Source, such as `web`, `rss`, `jina`, `written`, or `oral`.
- SubSource: an internal subdivision under one Source, such as `highlevel`, `dynamic`, or `policy`.
- NewsItem: one normalized news record.
- NewsBox: a UI/news grouping category, such as A1 政府公布 or A2 中文新聞.
- SourceButton: a clickable local UI control for one Source.
- ExpandedSourceBox: the expanded UI card for one clicked Source.
- SourceGroup: one SourceButton representing multiple internal SubSource groups.
- SourceWall: the `sub_all` UI that shows SourceButtons and ExpandedSourceBox cards.
- FocusFeed: the `sub_main` overview feed.
- SourceHealth: source status data and the `sub_health` status table.
- Fetch Result: latest result for one Source, named `fetch_{sourceKey}.json`.
- Box Result: merged result for one NewsBox, named `box_{newsBoxKey}.json`.
- View Result: page-level UI data, named `view_{page}.json`.

## 3. Domain Definitions

- A = 政府政策.
- B = AS Roma / sports.
- C = 財經市場.

## 4. File Layer Rules

- `fetch_*` belongs to Source-level data.
- `box_*` belongs to NewsBox / Box Result data.
- `view_*` belongs to UI page view data.
- Registry files define sources, endpoints, subsources, and grouping rules.
- `docs/` contains project rules, terminology, and registries.

## 5. Time Rule

- All timestamps and displayed time logic assume Asia/Macau.
- Do not use UTC in user-facing UI.
- Do not display Asia/Macau repeatedly in every news item.

## 6. Hard Forbidden Actions

- Do not touch `node_modules`.
- Do not add dependencies unless explicitly requested.
- Do not run `npm install` unless explicitly requested.
- Do not modify `package.json` unless explicitly requested.
- Do not modify `server.js` unless explicitly requested.
- Do not create real crawlers before M2.
- Do not fetch real websites before M2.
- Do not use external CDN.
- Do not hotlink external logos.
- Do not commit changes.
- Do not rewrite unrelated files.

## 7. Current UI Rules

- `sub_main` = FocusFeed / overview.
- `sub_all` = SourceWall.
- `sub_health` = SourceHealth table.
- SourceWall uses SourceButtons on the left and ExpandedSourceBox cards on the right.
- Source buttons use local text badges, not real icons for now.
- Each domain may keep at most 3 expanded sources.
- Latest-clicked expanded source appears first.
- Disabled source buttons must not expand.
- Dark mode is default.
- Light mode is available through theme toggle.
- Sidebar is foldable.
- UI state may use `localStorage`.

## 8. Coding Rules

- Use ES module style.
- Keep JavaScript compact and maintainable.
- Preserve existing pages unless the task explicitly changes them.
- Use fake JSON under `public/data` during M1.
- Do not expose internal terms in UI such as Endpoint, NewsItem, Source 6, or repeated Asia/Macau.

## 9. Git Workflow

- User runs `git status --short` before task.
- Codex must not commit.
- Codex must show changed files and diff summary after task.
- User tests and commits manually.

## 10. Response Format After Each Task

- Files changed.
- Summary of changes.
- Test steps.
- Any risks / follow-up needed.
