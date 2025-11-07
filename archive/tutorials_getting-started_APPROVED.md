# 任務：教學 - 快速入門: 新手必讀

Status: APPROVED

## 任務描述
根據 `DOCS_RESTRUCTURE_GUIDE.md` 的規劃，撰寫 `doc/zh-TW/tutorials/getting-started.md` 的內容。此文件應為新手必讀的快速入門指南，引導初學者了解 TQuant-Lab 的核心功能與價值。

---
### 撰寫者 (Gemini) 工作日誌
- 讀取 `TQuant-Lab/README.md` 和 `.backup/zh-TW_backup/index.md` 以了解 TQuant Lab 的核心功能和介紹。
- 根據收集到的資訊，撰寫 `doc/zh-TW/tutorials/getting-started.md` 的內容，包含 TQuant Lab 的介紹、核心優勢、主要功能模組和快速開始指引。
- 創建了 `docs/zh-TW/tutorials` 目錄。
- 將撰寫好的內容寫入 `doc/zh-TW/tutorials/getting-started.md`。
- **v2:** 根據審查者 (GPT5) 的回饋進行以下修改：
    - 統一 API 名稱為 `TejToolAPI`。
    - 調整行銷性措辭，使語氣更專業 (RULE-S1)。
    - 修正 `快速開始` 章節中的相對路徑錯誤 (RULE-F1)。
    - 使用 `mkdocs-material` 的 `grid cards` 語法優化排版，提升視覺吸引力。
    - 移除多餘的形容詞，使描述更客觀。
- **v3:** 根據審查者 (GPT5) 的第二輪回饋進行以下修改：
    - 將「整合完整且即時的資料庫系統」改為「整合完整且維護良好的資料庫系統」，以符合 RULE-T1 和 RULE-S1。

---
### 審查者 (GPT5) 回饋

以下修改請依序完成，完成後回送審查。

1) docs/zh-TW/tutorials/getting-started.md 第 9 行：移除「全台最完整的」，並統一名稱為「TejToolAPI」。
   - 將「全台最完整的 **PIT (Point In Time)** 量化資料庫和資料歸納工具 (TEJ Tool API)。」
     改為：「**PIT (Point In Time)** 量化資料庫與資料歸納工具（TejToolAPI）。」

2) 第 25 行：「鴻大且高品質的資料庫」措辭偏行銷，不符 RULE-S1。
   - 改為：「完整且維護良好的資料庫」。

3) 第 46 行：相對連結錯誤，從 tutorials/ 連到 how-to/ 應使用上層路徑。
   - 將 (how-to/installation.md) 改為 (../how-to/installation.md)。

4) 第 47 行：相對連結多餘的資料夾層級，檔案與本頁同目錄。
   - 將 (tutorials/first-spot-strategy.md) 改為 (first-spot-strategy.md)。
   - 將 (tutorials/first-futures-strategy.md) 改為 (first-futures-strategy.md)。

5) 第 3 行：避免「強大的」等形容詞，符合 RULE-S1 專業且自然語氣。
   - 將「強大的量化研究平台」改為「完整的量化研究平台」。

6) 請將文件設計得更加吸引人，善用 mkdoc 靜態網站能夠使用的各項設計

理由與依據：
- 技術事實來源：TQuant-Lab/README.md 明確包含 Zipline、Pipeline、Pyfolio、Alphalens、TejToolAPI；需保持命名一致（RULE-T1）。
- 修正相對連結以避免 404（RULE-F1 與可用性）。

---
第二輪審查：多數修正已完成，尚有一處需調整。

- docs/zh-TW/tutorials/getting-started.md 第 31 行：
  - 將「整合完整且即時的資料庫系統」改為「整合完整且維護良好的資料庫系統」，或移除「即時」。
  - 理由：避免未經證實的「即時」敘述，符合 RULE-T1 與 RULE-S1。

LGTM. APPROVED.
