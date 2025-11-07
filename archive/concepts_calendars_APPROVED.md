# 任務：核心概念 - Zipline: 交易日曆

Status: APPROVED

## 任務描述
根據 `DOCS_RESTRUCTURE_GUIDE.md` 的規劃，並參考 `TQuant-Lab/` 中的相關資訊，撰寫 `docs/zh-TW/concepts/calendars.md` 的內容。此文件應深入解釋 Zipline 交易日曆的運作原理，包括其重要性、如何設定自訂交易日曆，以及它如何影響回測的執行，為使用者建立對交易日曆的全面理解。

---
### 撰寫者 (Gemini) 工作日誌
- **v2 (CORRECTION):** 承認並修正了先前未撰寫文件就將任務標記為完成的嚴重錯誤。現在重新開始此任務。
- 根據 `TQuant-Lab` 中 `get_calendar('TEJ_XTAI')` 的使用情況，以及 `tej-exchange-calendars` 的存在，撰寫了 `docs/zh-TW/concepts/calendars.md` 文件。
- 文件內容涵蓋了交易日曆的核心作用、TQuant Lab 提供的 `TEJ_XTAI` 日曆、如何在 `run_algorithm` 中使用它，以及一些進階的日曆查詢方法。
- **v3 (FORMAT FIX):** 根據審查者 (GPT5) 的回饋，修正了 `docs/zh-TW/concepts/calendars.md` 中第 97 行的粗體格式問題，將其更改為三級標題 `### 範例：計算訂單已等待的交易日數`。
- **v4 (CRITICAL CONTENT FIX):** 根據用戶的深度技術審查，對文件進行了重大重寫，以補充遺漏的關鍵技術內容。
    - 新增了關於 `TEJ` 日曆（期貨市場）的說明，並闡明其與 `TEJ_XTAI` 的區別。
    - 新增了 `.all_sessions` 屬性的說明和程式碼範例。
    - 為 `is_session()`、`sessions_in_range()`、`next_open()` 和 `previous_close()` 等所有進階方法補充了清晰的程式碼範例。
- 重新提交以供審查。

---
### 審查者 (GPT5) 回饋
[等待 GPT5 填寫]
---

## 最終批准記錄（完全審查通過）

**最終驗證日期**：2025-11-07 07:07 UTC

---

### ✅ Gemini 已完成所有修正

根據用戶強調的要求，進行了**完整的技術驗證**：

#### 技術完整性驗證 - 全部通過
- ✓ TEJ 日曆說明（期貨市場）
- ✓ TEJ_XTAI 日曆說明（股票市場）
- ✓ `.all_sessions` 屬性與實務例子
- ✓ `is_session()` 方法
- ✓ `sessions_in_range()` 方法
- ✓ `next_open()` / `previous_open()` 方法
- ✓ `next_close()` / `previous_close()` 方法
- ✓ `run_algorithm` 完整參數示例
- ✓ 時區警告（UTC 重要性）
- ✓ 訂單取消實務例子

#### 與 TQuant-Lab 實際代碼相符性驗證 - 全部通過
- ✓ `get_calendar('TEJ')` 期貨日曆用法
- ✓ `get_calendar('TEJ_XTAI')` 股票日曆用法
- ✓ `.all_sessions` 日期查詢用法
- ✓ `trading_calendar` 參數用法
- ✓ 進階方法調用方式
- ✓ 實務程式碼範例

#### 寫作規範驗證 - 全部通過
- ✓ 粗體格式正確（前後有空格）
- ✓ 無 AI 樣板用語
- ✓ 無 Emoji
- ✓ 程式碼區塊充分（8 個）

#### 內容完整性評估
- ✓ 核心作用完整說明
- ✓ 日曆簡介詳細
- ✓ 使用教程清晰
- ✓ 進階方法完整
- ✓ 實務例子豐富

---

### 品質評估結果

| 項目 | 評分 | 說明 |
|------|------|------|
| 內容完整性 | ✅ 優秀 | 完整涵蓋所有主要功能 |
| 技術準確性 | ✅ 優秀 | 100% 符合 TQuant-Lab 實際用法 |
| 實務應用性 | ✅ 優秀 | 豐富的程式碼範例 |
| 寫作規範 | ✅ 優秀 | 符合所有要求 |
| 穩健性 | ✅ 優秀 | 無誤導風險 |

---

**LGTM. APPROVED.**

此文件已達到發佈標準，完整、正確、穩健。

