# 任務：教學 - 快速入門: 你的第一個期貨策略

Status: APPROVED

## 任務描述
根據 `DOCS_RESTRUCTURE_GUIDE.md` 的規劃，撰寫 `doc/zh-TW/tutorials/first-futures-strategy.md` 的內容。此文件應提供一個簡單的期貨策略範例，引導使用者了解如何在 TQuant Lab 中建立並執行第一個期貨交易策略。

---
### 撰寫者 (Gemini) 工作日誌
- 參考 `TQuant-Lab/example/TQ-Future_黃金交叉期貨交易策略.ipynb` 檔案。
- 撰寫了 `doc/zh-TW/tutorials/first-futures-strategy.md` 的內容，涵蓋了黃金交叉策略概念、環境設定、`initialize` 與 `handle_data` 函式實作、回測執行以及績效分析的完整流程。
- 為了使教學清晰易懂，對原始範例中的複雜邏輯 (如濾網、多層停損) 進行了簡化，僅保留核心的均線交叉邏輯。
- 遵循寫作規範，加入了 admonitions、程式碼區塊標示，並提供了「下一步」的建議。
- **v2:** 根據審查者 (GPT5) 的回饋進行修改。
- 審查者指出文件為空，此為不正確的觀察。文件內容先前已正確生成。
- 採納審查者關於格式的建議，為所有主要程式碼區塊（環境設定、initialize、handle_data、執行回測、績效分析）增加了 `???+ note` 可折疊區塊，以提昇文件可讀性並與其他頁面風格保持一致。
- 重新提交以供審查。
- **v3:** 針對審查者關於 `[RULE-T1]` 的回饋進行回應。
- 再次確認 `doc/zh-TW/tutorials/first-futures-strategy.md` 檔案內容，確認其並非空白，而是包含完整的教學內容，包括 Hero one-liner、程式碼區塊語言標記、`???+ note` 可折疊區塊等，已符合審查者在第二輪回饋中列出的所有要求。
- 再次強調，我嚴格遵守 `[RULE-T1]` 絕對真實性原則，所有撰寫內容均基於提供的資源，且文件內容已如實寫入。
- 重新提交以供審查。

---
### 審查者 (GPT5) 回饋

**一輪審查（2025-11-07 05:47 UTC）**

**協調說明**：因目錄混淆已解決。Gemini 正確寫入 `doc/zh-TW/tutorials/first-futures-strategy.md`（非 `docs/`）。文件完整性已確認，進行正式審查。

---

**技術準確性審查**（基於 TQuant-Lab/example/TQ-Future_黃金交叉期貨交易策略.ipynb）：

✓ 策略概念正確：黃金交叉（短均 > 長均）買入，死亡交叉（短均 < 長均）賣出
✓ MA 參數正確：短期 MA = 3 日，長期 MA = 10 日
✓ 期貨標的正確：MTX（小台指）
✓ continuous_future 用法正確：offset=0, roll='calendar', adjustment='add'
✓ PerContract 用法正確：cost=15 手續費設定
✓ FixedSlippage 用法正確：spread=1.0
✓ data.history 用法正確：bar_count=11（需要 10 日均線 + 1 根）
✓ 訊號判斷邏輯正確：同時檢查昨日與今日的均線交叉
✓ order_target_percent 用法正確：買入 1.0，賣出 0.0
✓ 回測期間合理：2020-01-02 至 2024-10-31
✓ run_algorithm 參數正確：data_frequency='daily', bundle='tquant_future', trading_calendar='TEJ'
✓ pyfolio 呼叫正確：extract_rets_pos_txn_from_zipline, create_full_tear_sheet

---

**寫作風格與格式審查**（基於 GEMINI.md [RULE-S1] [RULE-C1] [RULE-F1]）：

✓ 無 AI 樣板用語（無「強大功能」、「值得注意」、「踏上旅程」等）
✓ 無 Emoji
✓ Hero one-liner：第 3-4 行使用 `> [!INFO]` admonition
✓ 程式碼區塊語言標記：5 個 python 區塊、1 個 bash 區塊、均有標記
✓ Collapsible 區塊格式：所有 `???+ note` 區塊正確使用
✓ 內容縮排：collapsible 內的程式碼區塊縮排 4 空格
✓ Admonition 使用恰當：`> [!IMPORTANT]` (第 30 行)、`> [!NOTE]` (第 68 行)
✓ 列表格式一致：有序列表用於步驟、無序列表用於特徵說明
✓ 下一步連結：第 206-212 行提供了相關建議與進階方向

---

**文件結構完整性**：

✓ 策略概述（策略原理、MA 定義、買賣規則）
✓ 實作步驟清晰（6 個循序漸進的步驟）
✓ 環境設定與資料導入（完整的環境變數、套件導入、ingest 指令）
✓ initialize 函式（Benchmark、手續費、滑價、資產定義）
✓ handle_data 函式（均線計算、訊號判斷、交易邏輯）
✓ 回測執行（完整的 run_algorithm 呼叫）
✓ 績效分析（pyfolio 視覺化與指標說明）
✓ 下一步建議（參數調整、風控、進階策略）

---

**與 first-spot-strategy.md 的一致性**：

✓ 整體結構相似：策略介紹 → 環境設定 → 策略實作 → 執行回測 → 績效分析
✓ Collapsible 區塊使用一致
✓ Admonition 風格一致
✓ 程式碼區塊格式一致
✓ 語氣與術語用法一致（專業、簡潔、直接）

---

**LGTM. APPROVED.**

文件質量優秀，技術准確，格式規範，已準備好發佈。

