# 版本更新紀錄

!!! note "版本資訊"
    - **版本號**：v2.3.0
    - **發布日期**：2024-02-03
    - **本次更新重點**：全新「策略積木」板塊上線、環境建置教學擴充、Pyfolio 績效指標重寫。

---

## 🔥 重大更新：策略積木專區 (Strategy Blocks)

為了協助使用者跨越「從想法到程式碼」的鴻溝，本次更新正式推出 **[策略積木專區](blocks/Strategy_Blocks_Intro.md)**。此專區提供模組化的開發架構，目標將策略開發時間從 3 天大幅縮短至 3 小時。

本次新增共 **20 份** 技術文件與 **9 個** 完整實戰案例，涵蓋三大核心架構：

### 1. 三大策略架構
| 架構分類 | 適用場景 | 新增內容 |
| :--- | :--- | :--- |
| **A. 財報選股** | 盤外預選、基本面長線投資 | • 包含 **多因子選股**、**小型成長股**、**Dreman 逆向投資** 等 3 個完整案例。<br>• 提供交集法、評分法、排序法三種開發模板。 |
| **B. 技術指標** | 盤中即時運算、技術分析 | • 包含 **MACD 雙線交叉**、**乖離率均值回歸**、**布林通道突破** 等 3 個完整案例。<br>• 深入解析 Loop vs Pipeline 的效能差異。 |
| **C. Pipeline** | 全市場掃描、因子挖掘 | • 包含 **動量因子**、**大戶籌碼分析**、**短線逆勢策略** 等 3 個完整案例。<br>• 專注於向量化計算與大規模股票池篩選。 |

### 2. 標準化文件結構
所有策略案例均採用統一的七段式結構，包含：

- **完整程式碼 (Copy-Paste Ready)**：複製貼上即可執行。
- **優化方向**：每個案例提供 5 個具體的參數或邏輯調整建議。
- **指標詳解**：數學公式與計算步驟圖解，避免
邏輯黑箱。

---

## 📝 文件優化與修正

除了新功能上線，我們也根據社群反饋，針對現有教學文件進行了大幅度的優化與勘誤。

### 🚀 新手上路 (Tutorials)

#### 環境設置
- <span style="background:#28a745; color:white; padding:2px 6px; border-radius:4px;">New</span> **1.3.1 進階開發環境**：新增使用 **VS Code Remote - Containers** 連線 Docker 的教學，提供更流暢的開發體驗。
- <span style="background:#28a745; color:white; padding:2px 6px; border-radius:4px;">New</span> **1.6 常見問題排除**：新增 Docker 環境常見錯誤與排除指南。

#### 10 分鐘體驗 TQuant Lab
- <span style="background:#17a2b8; color:white; padding:2px 6px; border-radius:4px;">Update</span> **互動式範例**：於頁面頂部新增 GitHub Notebook 連結，方便讀者下載並跟隨操作。
- <span style="background:#17a2b8; color:white; padding:2px 6px; border-radius:4px;">Update</span> **指令詳解**：補充 `!zipline ingest` 中驚嘆號 `!` 的含義（Jupyter Magic Command），幫助新手理解執行環境差異。
- <span style="background:#dc3545; color:white; padding:2px 6px; border-radius:4px;">Fix</span> **程式碼修正**：於 `run_algorithm()` 函數中補充 `get_calendar('TEJ')`，確保回測日曆正確載入。

#### 你的第一個現貨策略
- <span style="background:#17a2b8; color:white; padding:2px 6px; border-radius:4px;">Update</span> **互動式範例**：於頁面頂部新增 GitHub Notebook 連結。
- <span style="background:#dc3545; color:white; padding:2px 6px; border-radius:4px;">Fix</span> **API 修正**：修正 `run_algorithm()` 中 `get_calendar('TEJ')` 的使用方式，解決原版程式碼無法運行的問題。

### 📚 核心概念 (Core Concepts)

#### Zipline 引擎
- <span style="background:#ffc107; color:black; padding:2px 6px; border-radius:4px;">Style</span> **流程圖優化**：修改「事件驅動模型」的 Mermaid 流程圖樣式，解決在深色/淺色主題下文字閱讀不清的問題。

#### Pyfolio 績效分析
- <span style="background:#17a2b8; color:white; padding:2px 6px; border-radius:4px;">Update</span> **內容重寫**：大幅改寫「績效指標詳解」頁面，提供更詳細的指標定義、計算公式與解讀方式，幫助使用者深入評估策略好壞。

### 🏠 首頁 (Homepage)
- <span style="background:#28a745; color:white; padding:2px 6px; border-radius:4px;">New</span> **導航更新**：新增導向「策略積木專區」的快速連結。# 版本更新紀錄