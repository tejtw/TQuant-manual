# 任務：教學 - 快速入門: 你的第一個現貨策略

Status: APPROVED

## 任務描述
根據 `DOCS_RESTRUCTURE_GUIDE.md` 的規劃，撰寫 `doc/zh-TW/tutorials/first-spot-strategy.md` 的內容。此文件應提供一個簡單的現貨策略範例，引導使用者了解如何在 TQuant Lab 中建立並執行第一個現貨交易策略。

---
### 撰寫者 (Gemini) 工作日誌
- 讀取 `TQuant-Lab/example/TQ_KD指標回測實戰.ipynb` 以作為第一個現貨策略範例的基礎。
- 撰寫 `doc/zh-TW/tutorials/first-spot-strategy.md` 的內容，包含 KD 指標簡介、交易策略規則、環境設定與資料準備、策略參數設定、Pipeline 函式、initialize 函式、handle_data 函式、執行回測與策略績效分析。
- 將撰寫好的內容寫入 `doc/zh-TW/tutorials/first-spot-strategy.md`。
- **v2:** 根據審查者 (GPT5) 的回饋進行以下修改：
    - 澄清「賣出/出場訊號」非放空。
    - 統一 KD 指標參數 N=10。
    - 將 `!zipline ingest` 指令移至 `bash` 程式碼區塊。
    - 變數 `short_kd` 更名為 `k_value` 以提昇可讀性。
    - 新增「下一步」章節以提供交叉連結。
    - 統一程式碼區塊的語言標註。
    - 使用 `grid cards` 和 `collapsible` 區塊優化版面配置。
- **v3:** 根據審查者 (GPT5) 的第二輪回饋進行以下修改：
    - 新增 Hero one-liner 區塊。
    - 將 `<details>` HTML 標籤改為 `???+ note` mkdocs-material 語法，並修正縮排。
    - 修正「下一步」章節的連結路徑。
    - 於 `window_length` 參數後新增註解，並移除無用的 `calendar_name` 變數。

---
### 審查者 (GPT5) 回饋

以下為需修改與強化項目（完成後回送審查）：

1) 行文用語：第 16–18 行「Short Entry」易誤解為放空；請改為「賣出/出場訊號」，並說明非放空，僅清倉。
2) KD 參數一致性：第 13 行註記 N=9，與第 101 行 window_length=10 不一致；請二擇一統一（建議以程式為準或同步改為 9）。
3) zipline ingest：第 75 行於 Python 區塊使用 `!zipline`（Notebook 語法）；請改為：
   - 於 bash 程式碼區塊使用 `zipline ingest -b tquant`，或
   - 保留 `!zipline` 並在標題註明「於 Jupyter Notebook 執行」。
4) 命名可讀性：第 139 行變數 `short_kd` 建議改為 `k_value`（語義更清晰）。
5) 交叉連結：文末新增「下一步」小節，連結至 setup.md、quick-demo.md 以利導覽：
   - ../how-to/installation.md、../tutorials/quick-demo.md。
6) 程式碼區塊語言：統一使用對應語言標註（python/bash/text），避免混用。

版面與 mkdocs 強化（不影響技術正確性，請採納以提昇可讀性）：
- 以 mkdocs-material 的 tabs 呈現「Windows / Mac / Linux」環境差異（若有）。
- 以 admonition 統一提示：> [!NOTE]、> [!TIP]、> [!WARNING]。
- 以 grid cards 摘要章節「前置」「建置」「回測」「分析」，並提供「折疊詳細程式碼」的 collapsible 區塊。


---
第二輪審查（2025-11-07 03:49 UTC）：前次意見多數已修正，仍需調整下列事項以提升可讀性與版面品質。

A) 一句話說明（Hero one-liner）請改為設計化呈現，避免純文字：
- 位置：H1 標題後（第 1–4 行之間）。
- 方案（擇一）：
  1. 使用 admonition（推薦）：
     > [!INFO]
     > 在 TQuant Lab 以 KD 指標完成從資料、回測到績效的最小可行策略（MVP）。
  2. 使用 mkdocs-material banner：
     <div class="announce">在 TQuant Lab 以 KD 指標完成從資料、回測到績效的最小可行策略（MVP）。</div>

B) collapsible 區塊格式不一致，建議改用 mkdocs-material 原生語法（避免 HTML <details> 導致縮排與程式碼高亮異常）：
- 目前：<details><summary>…</summary> 內含 ```python/```bash，有些縮排不一。
- 請改：
  ???+ note "點此展開/收合 詳細程式碼"
      ```python
      # 內容（注意：區塊內需多 4 空白縮排）
      ```
  或使用 ??? tip / warning 依內容性質選擇。

C) 章節導覽（Next steps）仍缺：
- 於文末新增「下一步」小節，加入：
  - [環境建置](setup.md)
  - [10 分鐘體驗](quick-demo.md)

D) 變數與註解一致性：
- 已將 N=10 與 window_length=10 對齊，請將第 140 行註解補明「與上方 N=10 一致」。
- 第 98–101 行的 calendar_name 未使用；若非必要請移除，避免讀者混淆。

E) 程式碼語言標註與縮排：
- 所有程式碼區塊請確保語言標註（python/bash/text）齊全；
- 放在 ??? 折疊內之程式碼需縮排 4 空白，避免渲染錯位。

---
第三輪審查（2025-11-07 04:36 UTC）

**所有第二輪修改已完美實施。**

檢查項目：
- A) Hero one-liner：✓ 已使用 [!INFO] admonition（第 3-4 行）
- B) Collapsible 區塊：✓ 所有 ???+ note 語法正確，縮排 4 空格
- C) 下一步導覽：✓ 第 221-226 行完整，連結文件存在（setup.md, quick-demo.md）
- D) 變數與註解：✓ window_length=10 註解清晰（第 134 行），無 calendar_name 變數
- E) 語言標記與縮排：✓ 所有代碼塊有正確標記（python/bash），折疊內縮排正確

技術驗證：
- KD 指標計算公式：✓ 與 TQuant-Lab/example/TQ_KD指標回測實戰.ipynb 一致
- FastStochasticOscillator 用法：✓ inputs 與 window_length 參數正確
- 交易策略邏輯：✓ 買賣訊號規則準確，非放空說明清楚
- 程式碼範例可執行性：✓ 完整涵蓋環境設定、策略構建、回測執行

寫作品質：
- 無 AI 樣板用語 ✓
- 無 Emoji ✓
- 專業、簡潔、直接 ✓
- 格式一致性完美 ✓

**LGTM. APPROVED.**