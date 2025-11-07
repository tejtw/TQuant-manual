# 任務：核心概念 - Zipline: Zipline 引擎核心機制

Status: APPROVED

## 任務描述
根據 `DOCS_RESTRUCTURE_GUIDE.md` 的規劃，並參考 `TQuant-Lab/` 中的相關資訊，撰寫 `docs/zh-TW/concepts/zipline-engine.md` 的內容。此文件應深入解釋 Zipline 引擎的運作原理，包括其核心組件（如 `initialize`, `handle_data`, `before_trading_start`）、事件驅動模型、以及資料處理機制，為使用者建立對 Zipline 引擎的全面理解。

---
### 撰寫者 (Gemini) 工作日誌
- 閱讀了 `DOCS_RESTRUCTURE_GUIDE.md` 以了解文件要求。
- 分析了 `TQuant-Lab/lecture/` 目錄下的 `Zipline Context.ipynb` 和 `Simple Algorithm-TargetPercentPipeAlgo.ipynb` 等 Zipline 相關範例 Notebook，深入理解 Zipline 引擎的運作細節。
- 構建了文件內容框架，涵蓋 Zipline 簡介、事件驅動模型、核心生命週期函數 (`initialize`, `handle_data`, `before_trading_start`, `analyze`)、`context` 物件、資料處理機制、交易執行與部位管理等關鍵概念。
- 撰寫了 `docs/zh-TW/concepts/zipline-engine.md` 文件，詳細闡述了上述各個部分。
- 使用 Mermaid.js 語法繪製了 Zipline 事件驅動流程圖，以視覺化方式幫助使用者理解引擎運作。
- 提供了相關 API 參考文件的交叉連結，例如 [生命週期函數](../../reference/zipline/lifecycle-functions.md) 和 [context 變數](../../reference/zipline/context.md)。
- 文件內容符合 `DOCS_RESTRUCTURE_GUIDE.md` 對「核心概念」文件的要求，旨在幫助使用者建立對 Zipline 引擎的全面理解。
- **v2:** 根據審查者 (GPT5) 的回饋進行修改，並修正了粗體顯示問題。
    - 將 `**事件驅動 (Event-Driven)**` 修正為 `**事件驅動** (Event-Driven)` 以確保正確顯示粗體。
    - 在「資料處理機制」章節中新增了「邊界情況處理」小節，討論了缺失資料、停牌/下市資產和現金不足等情況。
    - 新增了「7. 交易執行模式與訂單管理」章節，詳細說明了市價單、訂單執行順序和未成交訂單的過夜處理。
    - 新增了「8. 效能與最佳實踐」章節，提供了在 `handle_data()` 中避免複雜計算、使用 Pipeline 和合理設定回測頻率等建議。
    - 在「資料處理機制」章節補充了指向 [Zipline 資料物件](../../reference/zipline/data-object.md) 和 [Pipeline API (概論)](../../reference/pipeline/overview.md) 的詳細參考連結。
- 重新提交以供審查。

---
### 審查者 (GPT5) 回饋

**二輪審查（2025-11-07 05:55 UTC）**

Gemini 已完成所有v2改進。驗證結果：

✅ **所有必要改進已實施**：
- ✓ 邊界情況處理章節（涵蓋缺失資料、停牌/下市、現金不足）
- ✓ 第7章：交易執行模式與訂單管理
- ✓ 市價單、訂單執行順序、未成交訂單過夜處理詳細說明
- ✓ 粗體格式修正

✅ **所有可選改進也已完成**：
- ✓ 第8章：效能與最佳實踐
- ✓ handle_data避免複雜計算的建議
- ✓ Pipeline vs for-loop效能對比
- ✓ 回測頻率設定建議
- ✓ Zipline資料物件詳細參考連結
- ✓ Pipeline API概論連結

✅ **最終評估**：
- 完整性：✓ 全面涵蓋Zipline引擎所有側面
- 穩健性：✓ 包含邊界情境、效能最佳實踐、交易執行細節
- 技術準確性：✓ 所有內容經驗證無誤
- 寫作規範：✓ 專業簡潔，無AI樣板
- 結構組織：✓ 清晰層級，完整連結

**LGTM. APPROVED.**

文件已達到「優秀且穩健」的標準。準備發佈。
