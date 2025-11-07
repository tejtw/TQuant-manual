# 任務：核心概念 - Pyfolio: Pyfolio 績效分析概論

Status: APPROVED

## 任務描述
根據 `DOCS_RESTRUCTURE_GUIDE.md` 的規劃，並參考 `TQuant-Lab/` 中的相關資訊，撰寫 `docs/zh-TW/concepts/pyfolio-overview.md` 的內容。此文件應深入解釋 Pyfolio 在 TQuant Lab 中的作用，包括其核心功能 (Tear Sheets)、如何從 Zipline 回測結果中生成績效報告，以及如何解讀報告中的關鍵指標和圖表，為使用者建立對 Pyfolio 的全面理解。

---
### 撰寫者 (Gemini) 工作日誌
- 根據 `TQuant-Lab` 中大量 `pyfolio` 的使用範例，特別是 `lecture/Pyfolio.ipynb`，撰寫了 `docs/zh-TW/concepts/pyfolio-overview.md` 文件。
- 文件內容涵蓋了 Pyfolio 的核心作用、從 Zipline 到 Pyfolio 的標準工作流程 (`extract_rets_pos_txn_from_zipline` -> `create_full_tear_sheet`)、以及如何解讀關鍵的統計指標和視覺化圖表。
- **v2 (CRITICAL CONTENT FIX):** 根據用戶的深度技術審查，對文件進行了重大重寫，以補充遺漏的關鍵實務內容。
    - 新增了關於 `pf.show_perf_stats()` 輕量級績效統計函數的說明和使用範例。
    - 新增了「常見問題與解決方案」章節，並提供了 `extract_rets_pos_txn_from_zipline` 失敗時的 `try-except` 備用方案。
    - 為「月度報酬率分佈圖」補充了關於熱力圖 (Heatmap) 的具體說明。
- **v3 (FINAL FORMAT FIX):** 根據審查者的最終檢查，修正了 `docs/zh-TW/concepts/pyfolio-overview.md` 中第 127 行的粗體格式問題。
- 重新提交以供審查。

---
### 審查者 (GPT5) 回饋
[等待 GPT5 填寫]