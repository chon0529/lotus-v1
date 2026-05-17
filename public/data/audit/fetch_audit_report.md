# Fetch Audit Report

Generated: 2026-05-17T16:20:14+08:00

## 1. Executive Summary

- Total audited files: 61
- Current repo files: 0
- GitHub lotus-v1 files: 61
- READY: 15
- NEEDS_FIX: 34
- DEPRECATED: 0
- DUPLICATE: 4
- UNKNOWN: 8
- High-risk secret findings: 1

Current Nova-Lotus has no real fetch scripts in the audited patterns. The old GitHub lotus-v1 repo has a sizeable historical A-domain crawler set with reusable extraction ideas, but most scripts need standardization before M2 integration.

## 2. Scope

- Current repo: C:\Users\wings\Nova-Lotus
- GitHub repo: https://github.com/chon0529/lotus-v1.git
- Clone path: C:\Users\wings\_nova_audit\lotus-v1-github
- Audit mode: read-only inspection of old code; generated report files only.

## 3. Files Found in Current Repo

No fetch/run/logger/history files matched the audit patterns.

## 4. Files Found in GitHub lotus-v1

- crawler/fetch_aamacau_ws_cb.js
- crawler/fetch_allin_ws_cb.js
- crawler/fetch_chengpou_ws_cb.js
- crawler/fetch_exmoo_ws_cb.js
- crawler/fetch_cepa_ws_cb.js
- crawler/fetch_hengqingov_ws_cb.js
- crawler/fetch_hojemacau_ws_cb.js
- crawler/fetch_jtm_ws_cb.js
- crawler/fetch_macaodaily_ws_cb.js
- crawler/fetch_macaubusiness_ws_cb.js
- crawler/fetch_macaucabletv_ws_cb.js
- crawler/fetch_macaudailytimes_ws_cb.js
- crawler/fetch_mopostd_ws_cb.js
- crawler/fetch_plataformm_ws_cb.js
- crawler/fetch_tdm_ws_cb.js
- crawler/fetch_aamacau_ws.js
- crawler/fetch_allin_ws.js
- batch/run_all_committees.js
- crawler/fetch_caeu_ws.js
- crawler/fetch_cbaaction_ws.js
- batch/run_all_gba.js
- crawler/fetch_cbaoverall_ws_mix.js
- crawler/fetch_chengpou_ws.js
- crawler/fetch_cpu_ws.js
- crawler/fetch_cru_ws.js
- batch/run_all_dssopt.js
- crawler/fetch_dsop_ws.js
- crawler/fetch_dsscu_ws_adv3.js
- crawler/fetch_exmoo_ws.js
- crawler/fetch_gcs_rss_adv0.js
- crawler/fetch_gcseng_ws.js
- batch/run_all_gcsgba.js
- crawler/fetch_gcshq_ws_2.0.js
- crawler/fetch_gcshq_ws.js
- crawler/fetch_gcsup_ws.js
- crawler/fetch_hengqingov_ws.js
- crawler/fetch_hojemacau_ws.js
- crawler/fetch_jtm_ws.js
- crawler/fetch_macaodaily_ws_2.0.js
- fetch_macaodaily_ws_cb.js
- crawler/fetch_macaubusiness_ws.js
- crawler/fetch_macaucabletv_ws.js
- crawler/fetch_macaudailytimes_ws.js
- crawler/fetch_mopostd_ws.js
- crawler/fetch_plataformm_ws.js
- crawler/fetch_tdm_ws_adv1.js
- crawler/fetch_tdm_ws_jina.js
- crawler/fetch_tdm_ws.js
- crawler/fetch_tdm_ws2.js
- crawler/fetch_gcsgba_cb.js
- crawler/fetch_gcsgba_ws_2.0.js
- crawler/fetch_GCSGBA_ws.js
- crawler/fetch_macaodaily_ws_cb copy.js
- crawler/fetch_al_ws_cb.js
- crawler/fetch_committees_cb.js
- crawler/fetch_gba_cb.js
- crawler/fetch_dssopt_cb.js
- crawler/fetch_gcs_rss_cb.js
- crawler/modules/historyManager.js
- crawler/logger.js
- crawler/modules/logger.js

## 5. Fetch Script Status Table

| Status | Source | File | Output | Risk | Action |
|---|---|---|---|---|---|
| READY | a_aamacau | lotus-v1-github:crawler/fetch_aamacau_ws_cb.js | data/fetch_aamacau.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_allinmedia | lotus-v1-github:crawler/fetch_allin_ws_cb.js | data/fetch_allin.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_chengpou | lotus-v1-github:crawler/fetch_chengpou_ws_cb.js | data/fetch_chengpou.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_exmoo | lotus-v1-github:crawler/fetch_exmoo_ws_cb.js | data/fetch_exmoo.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_govmo_cepa_search | lotus-v1-github:crawler/fetch_cepa_ws_cb.js | data/fetch_cepa_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_hengqin_gov | lotus-v1-github:crawler/fetch_hengqingov_ws_cb.js | data/fetch_hengqingov_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_hojemacau | lotus-v1-github:crawler/fetch_hojemacau_ws_cb.js | data/fetch_hojemacau_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_jtm | lotus-v1-github:crawler/fetch_jtm_ws_cb.js | data/fetch_jtm.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macau_daily | lotus-v1-github:crawler/fetch_macaodaily_ws_cb.js | data/fetch_macaodaily_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macaubusiness | lotus-v1-github:crawler/fetch_macaubusiness_ws_cb.js | data/fetch_macaubusiness_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macaucabletv | lotus-v1-github:crawler/fetch_macaucabletv_ws_cb.js | data/fetch_macaucabletv_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macaudailytimes | lotus-v1-github:crawler/fetch_macaudailytimes_ws_cb.js | data/fetch_macaudailytimes_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macaupostdaily | lotus-v1-github:crawler/fetch_mopostd_ws_cb.js | data/fetch_mopostd.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_plataforma | lotus-v1-github:crawler/fetch_plataformm_ws_cb.js | data/fetch_plataformm_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws_cb.js | data/fetch_tdm_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| NEEDS_FIX | a_aamacau | lotus-v1-github:crawler/fetch_aamacau_ws.js | data/fetch_aamacau_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_allinmedia | lotus-v1-github:crawler/fetch_allin_ws.js | data/fetch_allin_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_caeu | lotus-v1-github:batch/run_all_committees.js | data/fetch_committees.json | medium | Rebuild batch orchestration after individual fetchers are standardized. |
| NEEDS_FIX | a_caeu | lotus-v1-github:crawler/fetch_caeu_ws.js | data/fetch_caeu_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_cbaaction | lotus-v1-github:crawler/fetch_cbaaction_ws.js | data/fetch_cbaaction_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_cbaoverall | lotus-v1-github:batch/run_all_gba.js | data/fetch_gba.json | medium | Rebuild batch orchestration after individual fetchers are standardized. |
| NEEDS_FIX | a_cbaoverall | lotus-v1-github:crawler/fetch_cbaoverall_ws_mix.js | data/fetch_cbaoverall_ws_mix.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_chengpou | lotus-v1-github:crawler/fetch_chengpou_ws.js | data/fetch_chengpou_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_cpu | lotus-v1-github:crawler/fetch_cpu_ws.js | data/fetch_cpu_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_cru | lotus-v1-github:crawler/fetch_cru_ws.js | data/fetch_cru_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_dsop | lotus-v1-github:batch/run_all_dssopt.js | data/fetch_dssopt.json | medium | Rebuild batch orchestration after individual fetchers are standardized. |
| NEEDS_FIX | a_dsop | lotus-v1-github:crawler/fetch_dsop_ws.js | data/fetch_dsop_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_dsscu | lotus-v1-github:crawler/fetch_dsscu_ws_adv3.js | data/fetch_dsscu_ws_adv3.json | high | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_exmoo | lotus-v1-github:crawler/fetch_exmoo_ws.js | data/fetch_exmoo_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_gcs | lotus-v1-github:crawler/fetch_gcs_rss_adv0.js | - | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_gcseng | lotus-v1-github:crawler/fetch_gcseng_ws.js | data/fetch_gcseng_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_gcsgba | lotus-v1-github:batch/run_all_gcsgba.js | data/fetch_gcsgba.json | medium | Rebuild batch orchestration after individual fetchers are standardized. |
| NEEDS_FIX | a_gcshq | lotus-v1-github:crawler/fetch_gcshq_ws_2.0.js | data/fetch_gcshq_ws_2.0.json | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_gcshq | lotus-v1-github:crawler/fetch_gcshq_ws.js | data/fetch_gcshq_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_gcsup | lotus-v1-github:crawler/fetch_gcsup_ws.js | data/fetch_gcsup_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_hengqin_gov | lotus-v1-github:crawler/fetch_hengqingov_ws.js | data/fetch_hengqingov_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_hojemacau | lotus-v1-github:crawler/fetch_hojemacau_ws.js | data/fetch_hojemacau_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_jtm | lotus-v1-github:crawler/fetch_jtm_ws.js | data/fetch_jtm_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macau_daily | lotus-v1-github:crawler/fetch_macaodaily_ws_2.0.js | - | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_macau_daily | lotus-v1-github:fetch_macaodaily_ws_cb.js | data/fetch_macaodaily_ws_cb.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macaubusiness | lotus-v1-github:crawler/fetch_macaubusiness_ws.js | data/fetch_macaubusiness_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macaucabletv | lotus-v1-github:crawler/fetch_macaucabletv_ws.js | data/fetch_macaucabletv_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macaudailytimes | lotus-v1-github:crawler/fetch_macaudailytimes_ws.js | data/fetch_macaudailytimes_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macaupostdaily | lotus-v1-github:crawler/fetch_mopostd_ws.js | data/fetch_mopostd_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_plataforma | lotus-v1-github:crawler/fetch_plataformm_ws.js | data/fetch_plataformm_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws_adv1.js | data/fetch_tdm_ws_adv1.json | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws_jina.js | data/fetch_tdm_ws_jina.json | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws.js | data/fetch_tdm_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws2.js | data/fetch_tdm_ws2.json | medium | Keep as reference only until primary/backup role is decided. |
| DUPLICATE | a_gcsgba | lotus-v1-github:crawler/fetch_gcsgba_cb.js | - | medium | Keep as reference only until primary/backup role is decided. |
| DUPLICATE | a_gcsgba | lotus-v1-github:crawler/fetch_gcsgba_ws_2.0.js | data/fetch_gcsgba_ws_2.0.json | medium | Keep as reference only until primary/backup role is decided. |
| DUPLICATE | a_gcsgba | lotus-v1-github:crawler/fetch_GCSGBA_ws.js | data/fetch_gcsgba_ws.json | medium | Keep as reference only until primary/backup role is decided. |
| DUPLICATE | a_macau_daily | lotus-v1-github:crawler/fetch_macaodaily_ws_cb copy.js | data/fetch_macaodaily_ws_cb.json | medium | Keep as reference only until primary/backup role is decided. |
| UNKNOWN | a_al | lotus-v1-github:crawler/fetch_al_ws_cb.js | - | medium | Inspect manually; behavior or target source is unclear. |
| UNKNOWN | a_caeu | lotus-v1-github:crawler/fetch_committees_cb.js | - | medium | Inspect manually; behavior or target source is unclear. |
| UNKNOWN | a_cbaoverall | lotus-v1-github:crawler/fetch_gba_cb.js | - | medium | Inspect manually; behavior or target source is unclear. |
| UNKNOWN | a_dsop | lotus-v1-github:crawler/fetch_dssopt_cb.js | - | medium | Inspect manually; behavior or target source is unclear. |
| UNKNOWN | a_gcs | lotus-v1-github:crawler/fetch_gcs_rss_cb.js | - | medium | Inspect manually; behavior or target source is unclear. |
| UNKNOWN | historymanager | lotus-v1-github:crawler/modules/historyManager.js | - | medium | Review as shared infrastructure before M2 integration. |
| UNKNOWN | logger | lotus-v1-github:crawler/logger.js | - | medium | Review as shared infrastructure before M2 integration. |
| UNKNOWN | logger | lotus-v1-github:crawler/modules/logger.js | - | medium | Review as shared infrastructure before M2 integration. |


## 6. READY Scripts

| Status | Source | File | Output | Risk | Action |
|---|---|---|---|---|---|
| READY | a_aamacau | lotus-v1-github:crawler/fetch_aamacau_ws_cb.js | data/fetch_aamacau.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_allinmedia | lotus-v1-github:crawler/fetch_allin_ws_cb.js | data/fetch_allin.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_chengpou | lotus-v1-github:crawler/fetch_chengpou_ws_cb.js | data/fetch_chengpou.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_exmoo | lotus-v1-github:crawler/fetch_exmoo_ws_cb.js | data/fetch_exmoo.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_govmo_cepa_search | lotus-v1-github:crawler/fetch_cepa_ws_cb.js | data/fetch_cepa_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_hengqin_gov | lotus-v1-github:crawler/fetch_hengqingov_ws_cb.js | data/fetch_hengqingov_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_hojemacau | lotus-v1-github:crawler/fetch_hojemacau_ws_cb.js | data/fetch_hojemacau_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_jtm | lotus-v1-github:crawler/fetch_jtm_ws_cb.js | data/fetch_jtm.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macau_daily | lotus-v1-github:crawler/fetch_macaodaily_ws_cb.js | data/fetch_macaodaily_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macaubusiness | lotus-v1-github:crawler/fetch_macaubusiness_ws_cb.js | data/fetch_macaubusiness_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macaucabletv | lotus-v1-github:crawler/fetch_macaucabletv_ws_cb.js | data/fetch_macaucabletv_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macaudailytimes | lotus-v1-github:crawler/fetch_macaudailytimes_ws_cb.js | data/fetch_macaudailytimes_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_macaupostdaily | lotus-v1-github:crawler/fetch_mopostd_ws_cb.js | data/fetch_mopostd.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_plataforma | lotus-v1-github:crawler/fetch_plataformm_ws_cb.js | data/fetch_plataformm_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |
| READY | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws_cb.js | data/fetch_tdm_ws_cb.json | low | Copy/adapt into M2 fetch module with schema adapter and dry-run test. |


## 7. NEEDS_FIX Scripts

| Status | Source | File | Output | Risk | Action |
|---|---|---|---|---|---|
| NEEDS_FIX | a_aamacau | lotus-v1-github:crawler/fetch_aamacau_ws.js | data/fetch_aamacau_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_allinmedia | lotus-v1-github:crawler/fetch_allin_ws.js | data/fetch_allin_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_caeu | lotus-v1-github:batch/run_all_committees.js | data/fetch_committees.json | medium | Rebuild batch orchestration after individual fetchers are standardized. |
| NEEDS_FIX | a_caeu | lotus-v1-github:crawler/fetch_caeu_ws.js | data/fetch_caeu_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_cbaaction | lotus-v1-github:crawler/fetch_cbaaction_ws.js | data/fetch_cbaaction_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_cbaoverall | lotus-v1-github:batch/run_all_gba.js | data/fetch_gba.json | medium | Rebuild batch orchestration after individual fetchers are standardized. |
| NEEDS_FIX | a_cbaoverall | lotus-v1-github:crawler/fetch_cbaoverall_ws_mix.js | data/fetch_cbaoverall_ws_mix.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_chengpou | lotus-v1-github:crawler/fetch_chengpou_ws.js | data/fetch_chengpou_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_cpu | lotus-v1-github:crawler/fetch_cpu_ws.js | data/fetch_cpu_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_cru | lotus-v1-github:crawler/fetch_cru_ws.js | data/fetch_cru_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_dsop | lotus-v1-github:batch/run_all_dssopt.js | data/fetch_dssopt.json | medium | Rebuild batch orchestration after individual fetchers are standardized. |
| NEEDS_FIX | a_dsop | lotus-v1-github:crawler/fetch_dsop_ws.js | data/fetch_dsop_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_dsscu | lotus-v1-github:crawler/fetch_dsscu_ws_adv3.js | data/fetch_dsscu_ws_adv3.json | high | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_exmoo | lotus-v1-github:crawler/fetch_exmoo_ws.js | data/fetch_exmoo_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_gcs | lotus-v1-github:crawler/fetch_gcs_rss_adv0.js | - | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_gcseng | lotus-v1-github:crawler/fetch_gcseng_ws.js | data/fetch_gcseng_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_gcsgba | lotus-v1-github:batch/run_all_gcsgba.js | data/fetch_gcsgba.json | medium | Rebuild batch orchestration after individual fetchers are standardized. |
| NEEDS_FIX | a_gcshq | lotus-v1-github:crawler/fetch_gcshq_ws_2.0.js | data/fetch_gcshq_ws_2.0.json | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_gcshq | lotus-v1-github:crawler/fetch_gcshq_ws.js | data/fetch_gcshq_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_gcsup | lotus-v1-github:crawler/fetch_gcsup_ws.js | data/fetch_gcsup_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_hengqin_gov | lotus-v1-github:crawler/fetch_hengqingov_ws.js | data/fetch_hengqingov_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_hojemacau | lotus-v1-github:crawler/fetch_hojemacau_ws.js | data/fetch_hojemacau_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_jtm | lotus-v1-github:crawler/fetch_jtm_ws.js | data/fetch_jtm_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macau_daily | lotus-v1-github:crawler/fetch_macaodaily_ws_2.0.js | - | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_macau_daily | lotus-v1-github:fetch_macaodaily_ws_cb.js | data/fetch_macaodaily_ws_cb.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macaubusiness | lotus-v1-github:crawler/fetch_macaubusiness_ws.js | data/fetch_macaubusiness_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macaucabletv | lotus-v1-github:crawler/fetch_macaucabletv_ws.js | data/fetch_macaucabletv_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macaudailytimes | lotus-v1-github:crawler/fetch_macaudailytimes_ws.js | data/fetch_macaudailytimes_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_macaupostdaily | lotus-v1-github:crawler/fetch_mopostd_ws.js | data/fetch_mopostd_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_plataforma | lotus-v1-github:crawler/fetch_plataformm_ws.js | data/fetch_plataformm_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws_adv1.js | data/fetch_tdm_ws_adv1.json | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws_jina.js | data/fetch_tdm_ws_jina.json | medium | Keep as reference only until primary/backup role is decided. |
| NEEDS_FIX | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws.js | data/fetch_tdm_ws.json | medium | Reuse extraction logic after standardizing logger/history/failure-safe behavior. |
| NEEDS_FIX | a_tdm | lotus-v1-github:crawler/fetch_tdm_ws2.js | data/fetch_tdm_ws2.json | medium | Keep as reference only until primary/backup role is decided. |


## 8. DEPRECATED / DUPLICATE Scripts

| Status | Source | File | Output | Risk | Action |
|---|---|---|---|---|---|
| DUPLICATE | a_gcsgba | lotus-v1-github:crawler/fetch_gcsgba_cb.js | - | medium | Keep as reference only until primary/backup role is decided. |
| DUPLICATE | a_gcsgba | lotus-v1-github:crawler/fetch_gcsgba_ws_2.0.js | data/fetch_gcsgba_ws_2.0.json | medium | Keep as reference only until primary/backup role is decided. |
| DUPLICATE | a_gcsgba | lotus-v1-github:crawler/fetch_GCSGBA_ws.js | data/fetch_gcsgba_ws.json | medium | Keep as reference only until primary/backup role is decided. |
| DUPLICATE | a_macau_daily | lotus-v1-github:crawler/fetch_macaodaily_ws_cb copy.js | data/fetch_macaodaily_ws_cb.json | medium | Keep as reference only until primary/backup role is decided. |


## 9. High-Risk Issues

- lotus-v1-github:crawler/fetch_dsscu_ws_adv3.js: Variant or backup script; compare with primary script before integration.

## 10. Hardcoded Secret Risk Summary

- lotus-v1-github:crawler/fetch_dsscu_ws_adv3.js: API key: API_KE****PXk'; API key: API_KE****6bd'

No full secrets are printed in this report. Any future reuse must repeat a secret scan before copy/adaptation.

## 11. Data Output Compatibility

Existing lotus-v1 output JSON commonly uses fields detected from sample files such as title, abstract, pubDate, link, image, source, date, address, url, author. These can map to Nova-Lotus UI with an adapter that normalizes title, source, category/newsBox, url/link, time/publishedAt, and tags.

## 12. Logger / History / LastUpdated Compatibility

- Logger modules exist at crawler/logger.js and crawler/modules/logger.js. The modules version writes overalllog.json and is closer to the desired M2 style.
- historyManager.js exists and updates history files plus last_updated.json.
- Many fetch scripts do not consistently use both shared modules, so standardization is required before integration.

## 13. Registry Match Against source_registry_a.json

Matched source scripts: 54

- a_aamacau: 論盡媒體
- a_allinmedia: AllinMedia
- a_chengpou: 正報
- a_exmoo: 力報
- a_govmo_cepa_search: gov.mo CEPA
- a_hengqin_gov: 橫琴官網
- a_hojemacau: Hoje Macau
- a_jtm: JTM
- a_macau_daily: 澳門日報
- a_macaubusiness: Macao Business
- a_macaucabletv: 澳門有線
- a_macaudailytimes: Macao Daily Times
- a_macaupostdaily: Macau Post Daily
- a_plataforma: Plataforma
- a_tdm: TDM
- a_caeu: CAEU
- a_cbaaction: 灣區行動
- a_cbaoverall: 灣區總覽
- a_cpu: CPU
- a_cru: CRU
- a_dsop: 公共建設局
- a_dsscu: DSSCU
- a_gcs: GCS
- a_gcseng: GCS 工程房屋
- a_gcshq: GCS 橫琴
- a_gcsup: GCS 都更
- a_gcsgba: GCS 大灣區
- a_al: 立法會

Scripts without clear registry match: 0

- None

## 14. Recommended M2.0B First Integration Batch

1. GCS (a_gcs) - NEEDS_FIX - crawler/fetch_gcs_rss_adv0.js - Close candidate after standardization.
2. TDM (a_tdm) - READY - crawler/fetch_tdm_ws_cb.js - Reusable now with schema adapter.
3. Macau Post Daily (a_macaupostdaily) - READY - crawler/fetch_mopostd_ws_cb.js - Reusable now with schema adapter.
4. Macao Business (a_macaubusiness) - READY - crawler/fetch_macaubusiness_ws_cb.js - Reusable now with schema adapter.

Preferred order remains GCS, TDM, then Macau Post Daily or Macao Business, but only after adapting failure-safe writes, schema normalization, and logger/history behavior.

## 15. Concrete Fix Order

1. Create a new M2 fetch contract in Nova-Lotus without copying old scripts directly.
2. Adapt one source at a time from old extraction logic, starting with the recommended batch.
3. Normalize output schema to Nova-Lotus NewsItem shape and source_registry_a sourceKey.
4. Add failure-safe write behavior: fetch to temp, validate, then replace main output only on success.
5. Standardize logger/history/last_updated behavior.
6. Run each fetcher in dry-run mode before enabling scheduled batches.
7. Build batch runner only after individual fetchers pass validation.

