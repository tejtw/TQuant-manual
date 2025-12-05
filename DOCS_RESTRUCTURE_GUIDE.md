# TQuant-manual 技術手冊架構優化計畫 (完整版)

## 1. 總覽與目標

本文件旨在為 TQuant-manual 技術手冊提供一個全面性的架構優化方案。

目前手冊的內容組織方式（扁平的目錄結構、以數字序列命名的檔案）導致可維護性與可讀性不足，難以應對未來日益增長的內容。

本次重構的**核心目標**是：建立一個以**使用者需求**為導向、結構清晰、易於維護且具備高度擴展性的技術文件系統。

---

## 2. 核心設計理念：Diátaxis 文件框架

我們將採用業界廣受好評的 **Diátaxis 框架**作為本次架構設計的指導原則。此框架將技術文件劃分為四種不同類型，對應使用者在不同情境下的四種主要需求。

![Diátaxis Framework](https://diataxis.fr/assets/images/diataxis-0b037aca227e12636b97a8f5ed84a5a7.svg)

#### 2.1. 教學 (Tutorials) - `學習導向`
*   **目的**：引導初學者完成一個具體、有意義的專案，讓他們從頭到尾體驗產品的核心功能與價值。
*   **形式**：手把手的步驟教學，類似課程。

#### 2.2. 操作指南 (How-to Guides) - `問題導向`
*   **目的**：當使用者心中有特定目標時，提供精準、按部就班的操作步驟。
*   **形式**：一系列清晰的指令，專注於解決一個特定問題。

#### 2.3. 核心概念 (Explanation) - `理解導向`
*   **目的**：深入解釋特定主題背後的「為什麼」，探討其設計理念、背景知識與運作原理。
*   **形式**：理論性、概念性的討論與闡述。

#### 2.4. API 參考 (Reference) - `資訊導向`
*   **目的**：提供關於 API、函數、類別、參數等最精確、詳盡、客觀的技術規格。
*   **形式**：像一本字典，結構化、資訊密度高。

---

## 3. 建議的新架構藍圖

#### 3.1. 新目錄結構

```
docs/zh-TW/
├── index.md
├── tutorials/
├── how-to/
├── concepts/
└── reference/
```

#### 3.2. 簡化的 `mkdocs.yml` 範例

```yaml
nav:
  - 首頁: index.md
  - 教學:
    - tutorials/getting-started.md
    - ...
  - 操作指南:
    - how-to/installation.md
    - ...
  - 核心概念:
    - concepts/workflow.md
    - ...
  - API 參考:
    - Zipline: 
      - reference/zipline/context.md
      - ...
```

---

## 4. 舊版分階段實施計畫

此為初始規劃，新版計畫請見 Section 7。

---

## 5. 詳細頁面規劃與內容對應 (最終分工版)

*   **黃彥博**：負責**現貨**相關內容，並擔任**主要負責人**，主導架構與合併作業。
*   **胡益鳴**：負責**期貨**相關內容，並作為**協作者**，參與審核與討論。

| 新分類 | 主要章節 | 頁面標題 | 負責人 | 原對應文件 | 新檔名提案 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **教學** | **快速入門** | 新手必讀 | **黃彥博** | `1_quickstart/getting-started.md` | `tutorials/getting-started.md` |
| | | 10分鐘體驗 | **黃彥博** | `1_quickstart/quick-demo.md` | `tutorials/quick-demo.md` |
| | | 環境建置 | **黃彥博** | `1_quickstart/setup.md` | `tutorials/setup.md` |
| | | 你的第一個現貨策略 | **黃彥博** | `1_quickstart/first-strategy.md` | `tutorials/first-spot-strategy.md` |
| | | 你的第一個期貨策略 | **胡益鳴** | (無) | `tutorials/first-futures-strategy.md` |
| | | 常用功能速查 | **黃彥博** | `1_quickstart/quick-reference.md` | `tutorials/quick-reference.md` |
| **核心概念**| **總覽** | TQuant Lab 分析流程 | **黃彥博** | `example/documents2.md` | `concepts/workflow.md` |
| | **Zipline** | Zipline 引擎核心機制 | **黃彥博** | (新) | `concepts/zipline-engine.md` |
| | | Pipeline 投資訊號生成 | **黃彥博** | (新) | `concepts/pipeline-overview.md` |
| | | 交易日曆 | **胡益鳴** | `example/documents12.md` | `concepts/calendars.md` |
| | **Pyfolo** | Pyfolo 績效分析概論 | **黃彥博** | (新) | `concepts/pyfolio-overview.md` |
| | **Alphalens**| Alphalens 因子分析概論 | **黃彥博** | (新) | `concepts/alphalens-overview.md` |
| **操作指南**| **安裝** | TQuant Lab 安裝 | **黃彥博** | `example/documents1.md` | `how-to/installation.md` |
| | **資料** | 如何 Ingest 股票價量資料 | **黃彥博** | `example/_fixme.md` | `how-to/data/ingest-spot-pricing.md` |
| | | 如何 Ingest 期貨價量資料 | **胡益鳴** | (新) | `how-to/data/ingest-futures-pricing.md` |
| | | 如何 Ingest TEJ 財務/非財務資料 | **黃彥博** | `example/documents9.md` | `how-to/data/ingest-tej-fundamental.md`|
| | | 如何取得 Benchmark 報酬率 | **黃彥博** | `example/documents10.md` | `how-to/data/get-benchmark-roi.md` |
| | | 如何取得無風險利率 | **黃彥博** | `example/documents11.md` | `how-to/data/get-risk-free-rate.md` |
| | **回測** | 如何執行一個基本的回測 | **黃彥博** | `example/documents55.md` | `how-to/backtest/run-algorithm.md` |
| | | 如何設定手續費模型 | **胡益鳴** | `example/documents73.md`+ | `how-to/backtest/set-commission.md` |
| | | 如何設定滑價模型 | **胡益鳴** | `example/documents78.md`+ | `how-to/backtest/set-slippage.md` |
| | | 如何設定交易限制 | **黃彥博** | `example/documents66.md`+ | `how-to/backtest/set-trading-controls.md`|
| | **視覺化** | 如何產生 Pyfolo 績效報表 | **黃彥博** | `example/documents4.md` | `how-to/visualization/pyfolio-tearsheet.md` |
| | **因子分析**| 如何執行 Alphalens 因子分析 | **黃彥博** | `example/documents5.md` | `how-to/factor-analysis/alphalens-tearsheet.md` |
| **API 參考**| **Zipline** | `initialize`, `handle_data`, etc. | **黃彥博** | `example/documents13.md`+ | `reference/zipline/lifecycle-functions.md` |
| | | `context` 變數 | **黃彥博** | `example/documents54.md` | `reference/zipline/context.md` |
| | | **股票池 (Universe)** | **黃彥博** | `example/documents14.md` | `reference/zipline/universe.md` |
| | | **排程函數** | **黃彥博** | `example/documents56.md` | `reference/zipline/scheduling-functions.md`|
| | | **下單函數** | **黃彥博** | `example/documents57.md`+ | `reference/zipline/orders.md` |
| | | **資產物件** | **胡益鳴** | `example/documents65.md` | `reference/zipline/assets.md` |
| | | **Pipeline API** | (章節) | `example/documents16.md` | `reference/pipeline/overview.md` |
| | | Factors / Filters / Classifiers | **黃彥博** | `example/documents84.md`+ | `reference/pipeline/terms.md` |
| | | CustomFactor | **黃彥博** | `example/documents87.md` | `reference/pipeline/custom-factor.md` |
| | | **資料集 (DataSet)** | (章節) | - | `reference/pipeline/datasets/overview.md` |
| | | EquityPricing | **黃彥博** | `example/documents90.md` | `reference/pipeline/datasets/equity-pricing.md` |
| | | TQDataSet / TQAltDataSet | **黃彥博** | `example/documents91.md`+ | `reference/pipeline/datasets/tej-datasets.md` |
| | | Custom Dataset | **黃彥博** | `example/documents93.md` | `reference/pipeline/datasets/custom-dataset.md` |
| | | **內建因子/濾網/分類器** | **黃彥博** | `example/documents95.md`+ | `reference/pipeline/built-ins.md` |
| | **Pyfolo** | API 總覽 | **黃彥博** | `example/documents39.md`+ | `reference/pyfolio/api.md` |
| | **Alphalens**| API 總覽 | **黃彥博** | `example/documents43.md`+ | `reference/alphalens/api.md` |
| | **TejToolAPI**| `get_history_data` | **黃彥博** | `example/documents47.md` | `reference/tejtoolapi/get-history-data.md`|

---

## 6. 團隊分工與協作流程 (最終版)

#### 6.1. 團隊角色與職責
*   **黃彥博 (主要負責人 / 現貨內容)**
    *   **職責**：擔任專案主要負責人，主導整體架構，並負責合併分支。撰寫所有「現貨」相關內容，以及共通的核心組件。
*   **胡益鳴 (協作者 / 期貨內容)**
    *   **職責**：負責撰寫所有「期貨」相關的新內容與遷移舊內容。對主要負責人的 PR 進行審查，確保兩人工作協調一致。

#### 6.2. 協作流程
1.  **分支管理**：由 **黃彥博** 建立 `main` 主分支，以及 `yen-po-dev` 和 `yi-ming-dev` 兩個個人工作分支。
2.  **開發**：兩位成員在各自的 `dev-*` 分支上進行內容開發。
3.  **提交審核**：開發至一個段落後，提交 Pull Request (PR) 到 `main` 分支，並指定另一位成員為審查者。
4.  **同儕審查 (Peer Review)**：PR 的審查者負責檢查內容，並提供修改建議。
5.  **合併**：PR 獲得審查者批准 (Approve) 後，由 **黃彥博** 將其合併入 `main` 分支。

---

## 7. 專案時程規劃 (兩人並行版)

| 週次 | 日期範圍 | 主要目標 | 關鍵任務 | 產出 |
| :--- | :--- | :--- | :--- | :--- |
| **Week 1** | (起始日) | **準備與架構建立** | 1. **黃彥博** 完成 Git 分支設定。<br>2. 兩人共同確認並同意本計畫。<br>3. **黃彥博** 建立新目錄結構 (Phase 1)。 | - Git 環境就緒<br>- `docs/zh-TW` 下的空目錄結構 |
| **Week 2-3**| | **內容並行遷移** | 1. **黃彥博**與**胡益鳴**根據計畫，在各自的分支上，並行遷移/建立負責的文件。<br>2. 同時進行檔名語意化。<br>3. 各自更新 `mkdocs.yml` 的 `nav`。 | - 所有文件完成初步遷移與分類。<br>- 包含大量衝突的 `mkdocs.yml` (預期之中) |
| **Week 4-5**| | **並行重構與審核** | 1. 兩人開始對自己負責的內容進行重寫/拆分 (Phase 3)。<br>2. 透過 PR 機制，互相審核對方的產出。<br>3. **黃彥博** 負責整合 `mkdocs.yml` 的衝突。<br>4. 兩人共同撰寫「核心概念」部分。 | - 大部分文件內容完成重構。<br>- 一個乾淨、完整的 `mkdocs.yml`。<br>- 「核心概念」章節草稿。 |
| **Week 6** | (結束日) | **整合、測試與發布** | 1. **黃彥博** 合併所有最終分支。<br>2. 兩人在本地端 `mkdocs serve` 進行完整點擊測試。<br>3. 修復所有失效連結與格式問題。<br>4. 準備正式發布。 | - 一個結構清晰、內容完整、可發布的新版技術手冊。 |

---

## 8. 成功衡量指標 (Metrics for Success)

為了客觀評估本次重構的成效，我們建議在專案完成後，透過以下質化與量化指標進行衡量：

#### 8.1. 可維護性指標
*   **查找時間 (Time-to-Find)**：維護人員尋找特定資訊（例如：一個 API 的參數說明）所需的時間是否顯著減少？
*   **修改時間 (Time-to-Update)**：修改或新增一份文件所需的時間是否縮短？
*   **`mkdocs.yml` 行數**：在不使用插件的情況下，`nav` 設定的行數是否大幅減少？

#### 8.2. 使用者體驗指標
*   **使用者回饋**：透過問卷或訪談，收集使用者對於新文件架構清晰度的評分。
*   **問題解決率**：使用者是否能更快地透過文件找到問題的答案，從而減少尋求人工支援的次數？

#### 8.3. 團隊協作指標
*   **PR 合併衝突率**：由於文件職責劃分更清晰，因修改同一個文件而導致的 Git 合併衝突次數是否降低？
*   **新成員上手時間 (Onboarding Time)**：新加入的維護者是否能更快地理解文件庫的結構並開始貢獻？
