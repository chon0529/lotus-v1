# Legacy Fetch Migration Inventory

## 已升級 / 已覆蓋

| 舊檔案 | 新 sourceId | 新 fetch | 狀態 | 備註 |
|---|---|---|---|---|
| fetch_tdm_ws / fetch_tdm_ws_jina / fetch_tdm_ws_cb | a_tdm | crawler/fetch_tdm.js | done | TDM |
| fetch_mopostd_ws / fetch_mopostd_ws_cb | a_macaupostdaily | crawler/fetch_macaupostdaily.js | done | Macau Post Daily |
| fetch_macaubusiness_ws / fetch_macaubusiness_ws_cb | a_macaubusiness | crawler/fetch_macaubusiness.js | done | Macao Business |
| fetch_caeu_ws | a_caeu | crawler/fetch_caeu.js | done | CAEU |
| fetch_cepa_ws_cb | a_govmo_cepa_search | crawler/fetch_govmo_cepa_search.js | done | DSEDT CEPA search |
| fetch_hengqingov_ws / fetch_hengqingov_ws_cb | a_hengqin_gov | crawler/fetch_hengqin_gov.js | done | 橫琴官網 |
| fetch_aamacau_ws / fetch_aamacau_ws_cb | a_aamacau | crawler/fetch_aamacau.js | done | 論盡媒體 |
| fetch_allin_ws / fetch_allin_ws_cb | a_allinmedia | crawler/fetch_allinmedia.js | done | AllinMedia |
| fetch_chengpou_ws / fetch_chengpou_ws_cb | a_chengpou | crawler/fetch_chengpou.js | done | 正報 |
| fetch_exmoo_ws / fetch_exmoo_ws_cb | a_exmoo | crawler/fetch_exmoo.js | done | 力報 |
| fetch_macaucabletv_ws / fetch_macaucabletv_ws_cb | a_macaucabletv | crawler/fetch_macaucabletv.js | done | 澳門有線 |
| fetch_plataformm_ws / fetch_plataformm_ws_cb | a_plataforma | crawler/fetch_plataforma.js | done | Plataforma Marcas |
| fetch_gcs_rss_cb / fetch_gcs_rss_adv0 | a_gcs | crawler/fetch_gcs.js | done | GCS RSS 主新聞 |
| fetch_gcseng_ws | a_gcs_housing | crawler/fetch_gcs_housing.js | done | 舊檔名誤導，實為 GCS 工程房屋 |
| fetch_gcshq_ws_2.0 | a_gcshq | crawler/fetch_gcshq.js | done | GCS 橫琴合作區 |
| fetch_GCSGBA_ws / fetch_gcsgba_cb / fetch_gcsgba_ws_2.0 | a_gcsgba | crawler/fetch_gcsgba.js | done | GCS 粵港澳大灣區 |
| fetch_cbaaction_ws | a_cbaaction | crawler/fetch_cbaaction.js | done | CBA 灣區行動 |
| fetch_cbaoverall_ws_mix | a_cbaoverall | crawler/fetch_cbaoverall.js | done | CBA 綜合 |
| fetch_dsop_ws | a_dsop | crawler/fetch_dsop.js | done | 公共建設局 |
| fetch_dsscu_ws_adv3 | a_dsscu | crawler/fetch_dsscu.js | done | 土地工務局 |
| fetch_cru_ws | a_cru | crawler/fetch_cru.js | done | 都市更新委員會 |
| fetch_cpu_ws | a_cpu | crawler/fetch_cpu.js | done | 城市規劃委員會 |

## 暫不升級為 normal source

| 舊檔案 | 狀態 | 原因 |
|---|---|---|
| fetch_committees_cb | skipped | 合併器：CAEU + CPU + CRU；新架構已有獨立 source |
| fetch_dssopt_cb | skipped | 合併器：DSSCU + DSOP + GCS 類；新架構已有獨立 source |
| fetch_gba_cb | skipped | 合併器：CBA action + CBA overall；新架構已有獨立 source |
| fetch_gcshq_ws | skipped | 舊版，被 fetch_gcshq_ws_2.0 / a_gcshq 取代 |
| fetch_gcsup_ws | pending | GCS 城規基建；目前目標頁顯示無符合條件資料 |
| batch/run_all_committees.js | replaced | 舊 runner，後續由新 run_all 取代 |
| batch/run_all_dssopt.js | replaced | 舊 runner，後續由新 run_all 取代 |
| batch/run_all_gba.js | replaced | 舊 runner，後續由新 run_all 取代 |
| batch/run_all_gcsgba.js | replaced | 舊 runner，後續由新 run_all 取代 |

## 待處理媒體類

| 舊檔案 | 暫定 sourceId | 狀態 | 備註 |
|---|---|---|---|
| fetch_hojemacau_ws / fetch_hojemacau_ws_cb | a_hojemacau | todo | Hoje Macau |
| fetch_jtm_ws / fetch_jtm_ws_cb | a_jtm | todo | Jornal Tribuna de Macau |
| fetch_macaodaily_ws_2.0 / fetch_macaodaily_ws_cb | a_macaodaily | todo | 澳門日報 |
| fetch_macaudailytimes_ws / fetch_macaudailytimes_ws_cb | a_macaudailytimes | todo | Macau Daily Times |

## 現有新 Health Source Count

目前新架構 source 數量：22。
