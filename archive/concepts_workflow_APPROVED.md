# 任務：核心概念 - 總覽: TQuant Lab 分析流程

Status: APPROVED

## 任務描述
根據 `DOCS_RESTRUCTURE_GUIDE.md` 的規劃，並參考 `.backup/` 和 `TQuant-Lab/` 中的相關資訊，撰寫 `docs/zh-TW/concepts/workflow.md` 的內容。此文件應宏觀地介紹 TQuant Lab的核心分析流程，從資料獲取、策略發想、回測執行到績效分析，為使用者建立一個整體的概念框架。

---
### 撰寫者 (Gemini) 工作日誌
- 由於在 `.backup/` 中找不到對應的舊文件 `example/documents2.md`，我轉而分析 `TQuant-Lab/example/TQ_KD指標回測實戰.ipynb` 範例檔案。
- 透過分析範例，我逆向工程並歸納出 TQuant Lab 的四大核心工作流程：資料準備、策略建構、績效分析、以及優化迭代。
- 撰寫了 `docs/zh-TW/concepts/workflow.md` 的內容，詳細闡述了這四個步驟，並引用了 Zipline、Pyfolio 等核心組件。
- 為了提升文件的可讀性與專業性，我使用 Mermaid.js 語法繪製了一個流程圖，以視覺化方式呈現整體分析流程。
- 文件內容符合 `DOCS_RESTRUCTURE_GUIDE.md` 對「核心概念」文件的要求，旨在幫助使用者建立宏觀的理解。
- **v2:** 根據審查者 (GPT5) 的回饋進行修改。
- 在「績效與風險分析」章節中，新增了指向 `alphalens-overview.md` 的連結。
- 擴充了「策略建構與回測」章節，加入了關於手續費/滑價模型和期貨交易的進階概念說明。
- 擴充了「資料準備與載入」章節，明確指出 TQuant Lab 支援股票、期貨、ETF 等多種資料類型。
- 根據建議，新增了「常見陷阱與最佳實踐」章節，討論向前看偏誤、過度優化等重要概念。
- 重新提交以供審查。

---
### 審查者 (GPT5) 回饋

**宏觀與全面審查（2025-11-07 05:48 UTC）**

---

## 概覽評估

✅ **優秀之處**：
- 四大流程結構清晰，符合 TQuant Lab 實際工作流程
- 技術準確性經驗證：所有核心組件（zipline ingest, Pipeline, initialize, handle_data, run_algorithm, pyfolio）均基於實際 Notebook 示例
- Mermaid 流程圖視覺化呈現優秀，顯示了迭代循環的概念
- 內容簡潔專業，無 AI 樣板用語
- 與教學文件的交叉連結合理

---

## 宏觀審查發現

### A. 完整性檢查（基於 TQuant-Lab 29 個範例 Notebook）

✓ 涵蓋的核心流程：
- 資料準備（zipline ingest）
- 策略構建（initialize, handle_data, Pipeline）
- 回測執行（run_algorithm）
- 績效分析（Pyfolio）

⚠️ 遺漏或待補強的內容：

1. **Alphalens 因子分析連結遺失**（第 68 行）
   - 文檔提及 Alphalens 但沒有內連結至 `alphalens-overview.md`
   - `alphalens-overview.md` 目前為空佔位符
   - 建議：新增連結 `> 詳見：[Alphalens 因子分析概論](./alphalens-overview.md)`

2. **高級功能遺漏**
   - 未提及期貨交易（Futures）流程
   - 未提及 `continuous_future()` API
   - 未提及 `set_commission`, `set_slippage` 手續費/滑價模型
   - 未提及多因子 Pipeline 或因子組合
   
   這些在實際範例中很常見，應納入「策略構建」章節作為進階說明。

3. **市場風格與資料類型多樣性**
   - 文檔僅聚焦「標準股票回測」
   - 未提及期貨、ETF、或多資產類別支持
   - 未提及基本面資料（除「TEJ API」外缺乏細節）

### B. 與整體手冊的協調性

✓ **良好的地方**：
- 與 `first-spot-strategy.md` 和 `first-futures-strategy.md` 教學文件形成好的遞進關係
- 與 `zipline-engine.md` 和 `pyfolio-overview.md` 有適當的交叉連結

⚠️ **需改進**：
- `quick-reference.md` 中提到的許多 API（如 `set_benchmark`, `record`, `symbol` 等）在本文中未有詳盡解釋
- 本文應作為「概念概覽」，應清楚指引讀者到「詳細參考」文件的路徑

### C. 技術準確性驗證

✓ **核心機制描述準確**
- Pipeline 的「訊號生成」說法正確
- initialize & handle_data 的函數簽名和職責描述準確
- 迭代循環的概念正確

⚠️ **細節差距**

第 50-51 行 `initialize` 和 `handle_data` 的描述略顯簡化：

當前（簡化版）：
```
initialize(context)：此函數在回測開始時僅執行一次，用於設定初始參數，例如初始資金、手續費/滑價模型、以及註冊 Pipeline。

handle_data(context, data)：此函數...會在回測的每個交易日被調用。
```

改進建議（更精確）：
```
initialize(context)：此函數在回測開始時**僅執行一次**...

handle_data(context, data)：此函數會在每個交易日 **盤中** 被調用。您可在此獲取 Pipeline 結果並執行交易。

（註：對於日頻回測，handle_data 在開盤後執行；實際執行時間取決於 `before_trading_start` 和其他生命週期函數）
```

### D. 結構與可讀性

✓ 優秀
- 層級清晰（使用 ### 劃分四大步驟）
- 流程圖視覺化有效
- 每個步驟都有實用的 「詳見」連結

---

## 建議修正清單

### 必要修正（符合「優秀且穩健」的標準）：

1. **新增 Alphalens 連結**（第 68 行後）
   ```markdown
   > 詳見：[Alphalens 因子分析概論](./alphalens-overview.md)
   ```

2. **擴展「策略構建與回測」章節**，加入進階概念（建議新增小節）：
   ```markdown
   #### 進階概念：手續費與滑價模型
   在實際交易中，手續費和滑價是重要的成本因子。透過 `set_commission()` 和 `set_slippage()` 函數，您可以精確模擬交易成本，使回測結果更貼近現實。
   
   #### 進階概念：期貨與連續合約
   對於期貨交易，使用 `continuous_future()` API 獲取連續合約物件...（簡要說明，詳見 first-futures-strategy.md）
   ```

3. **補充「資料準備」章節**，提及多資料類型：
   ```markdown
   - **多資料類型支持**：除股票價量外，TQuant Lab 支援基本面資料、期貨、ETF 等。根據您的策略需求選擇對應的資料 bundle。
   ```

### 可選改進（提升深度）：

4. **新增「常見陷阱」小節**（在迭代優化後）
   ```markdown
   ## 常見陷阱與最佳實踐
   
   - **向前看偏誤 (Look-ahead bias)**：確保 Pipeline 中的因子只使用過去的資料
   - **過度優化 (Overfitting)**：在訓練期間優化參數後，應在獨立的測試期驗證
   - **滑價與成本忽視**：不設定手續費/滑價可能導致過度樂觀的回測結果
   ```

---

## 最終評估

**當前狀態**：⚠️ 良好但不夠穩健
- 核心流程準確且結構清晰
- 但缺少進階細節和邊界情境
- Alphalens 參考不完整

**改進後預期**：✓ 優秀且穩健
- 完整涵蓋核心與進階功能
- 充分連接到相關文件
- 為初學者和進階使用者都提供有用的框架

---

**狀態**：`PENDING_WRITER_ACTION`

需修正上述四個必要項目（尤其是 Alphalens 連結），以達到「優秀且穩健」的標準。

---

**二輪審查（2025-11-07 05:50 UTC）**

Gemini 已完成所有必要修正。驗證結果：

✅ **所有必要修正已實施**：
- ✓ Alphalens 連結已新增（第 80 行）
- ✓ 進階概念：手續費與滑價模型（第 59-60 行）
- ✓ 進階概念：期貨與連續合約（第 62-63 行）
- ✓ 多資料類型支援說明（第 36-37 行）
- ✓ 常見陷阱與最佳實踐（第 96-105 行）

✅ **可選改進也已完成**：
- ✓ 向前看偏誤 (Look-ahead Bias) 詳細說明
- ✓ 過度優化 (Overfitting) 詳細說明
- ✓ 滑價與成本忽視 詳細說明

✅ **最終評估**：
- 完整性：✓ 覆蓋核心與進階功能
- 穩健性：✓ 包含邊界情境與最佳實踐
- 連接性：✓ 充分連接到相關文件
- 廣度：✓ 支持多資產類別

**LGTM. APPROVED.**

文件已達到「優秀且穩健」的標準。
