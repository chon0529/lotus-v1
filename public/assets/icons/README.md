# Source Icons

Nova-Lotus source icons are local assets only.

- Prefer official SVG files when available.
- If an official SVG is unavailable, use a square 128x128 WebP.
- Do not convert JPG or PNG files into fake SVG files.
- Keep source icon files square.
- Use lowercase, hyphen-separated file names based on the source id.
- Store source files under `public/assets/icons/sources/`.
- Use local paths only, such as `/assets/icons/sources/gcs.svg`.
- Do not hotlink external logos or use CDN URLs.

## M1.14B Assets

| File | Source | Type | Registry binding | Notes |
| --- | --- | --- | --- | --- |
| `sources/aamacau.svg` | Official All About Macau pinned-tab SVG: `https://aamacau.com/files/themes/aamacau_com/images/favicon/safari-pinned-tab.svg` | official SVG | `a_aamacau` | Square local SVG. Fallback text remains `論`. |
| `sources/as-roma-official.svg` | Official AS Roma asset host: `https://assets.asroma.com/prod/assets/romalogo.a3468a14c24c646533aa6388117cbbcd.svg` | official SVG | collected only | B-domain sources are not registry-bound in `source_registry_a.json`; keep this local candidate for a later B registry pass. |

## Fallback Policy

Fallback text remains acceptable when a reliable official square icon is unavailable
or when the source is outside the current registry binding scope. Do not use random
search-result images, social avatars that are not clearly official, watermarked
images, remote URLs, or raster files embedded into fake SVG wrappers.
