# Pyfolio 績效分析概論

!!! info
    本頁介紹 TQuant Lab 中整合的強大績效分析工具 Pyfolio，內容涵蓋其核心功能、如何從 Zipline 回測結果生成視覺化的績效報告 (Tear Sheet)，以及如何解讀報告中的關鍵指標與圖表，幫助您深入評估策略的表現。

在量化研究流程中，僅有回測結果的原始數據是不夠的。一個專業的量化研究者需要一套標準化、系統化的工具來評估策略的風險與報酬。Pyfolio 正是為此而生的 Python 套件，它能將 Zipline 的回測結果轉換為一份包含數十種關鍵指標和視覺化圖表的專業報告，稱為「Tear Sheet」。

---

## 1. Pyfolio 的核心作用

Pyfolio 是 TQuant Lab 分析流程中的關鍵一環，它扮演著「策略健檢報告」的角色，主要提供以下功能：

*   **標準化績效指標**：自動計算夏普比率 (Sharpe Ratio)、最大回撤 (Max Drawdown)、Alpha、Beta 等業界通用的風險與報酬指標。
*   **視覺化分析**：提供豐富的圖表，如累積報酬圖、水下圖、月度報酬分佈等，讓您能直觀地評估策略的表現特徵。
*   **與 Zipline 無縫整合**：提供工具函式，可以輕鬆地將 Zipline 的回測輸出轉換為 Pyfolio 所需的格式。

---

## 2. 從 Zipline 到 Pyfolio：標準工作流程

在 TQuant Lab 中，使用 Pyfolio 分析 Zipline 回測結果的流程非常固定，主要分為以下三個步驟：

### 步驟 1：執行 Zipline 回測

首先，您需要像往常一樣執行您的 Zipline 策略，並將結果儲存在一個變數中 (通常命名為 `results`)。

```python
from zipline import run_algorithm

# ... (您的 initialize 和 handle_data 函數定義) ...

results = run_algorithm(
    # ... 您的 run_algorithm 參數 ...
)
```

### 步驟 2：提取 Pyfolio 所需的數據

Zipline 的 `results` DataFrame 格式無法直接被 Pyfolio 使用。您需要使用 `pyfolio.utils.extract_rets_pos_txn_from_zipline()` 這個輔助函式，將 `results` 轉換為 Pyfolio 所需的三个核心物件：

*   `returns` (pandas.Series)：每日的策略報酬率。
*   `positions` (pandas.DataFrame)：每日的持倉狀態。
*   `transactions` (pandas.DataFrame)：所有的交易紀錄。

```python
import pyfolio as pf

# 從 Zipline results 中提取 Pyfolio 所需的數據
returns, positions, transactions = pf.utils.extract_rets_pos_txn_from_zipline(results)
```

### 步驟 3：生成績效報告

完成數據提取後，您可以根據需求選擇生成完整的視覺化報告，或僅快速查看統計數據。

#### 選項 A：生成完整 Tear Sheet (建議)

調用 `pyfolio.tears.create_full_tear_sheet()` 函數，可以生成一份包含所有圖表和統計數據的完整報告。

```python
# 獲取回測期間的基準指數報酬
benchmark_rets = results.benchmark_return

# 產生完整的績效分析報告
pf.create_full_tear_sheet(
    returns,
    positions=positions,
    transactions=transactions,
    benchmark_rets=benchmark_rets, # 傳入基準指數報酬以進行比較
    round_trips=False # 建議設為 False 以加速運算
)
```

#### 選項 B：僅顯示關鍵績效統計

如果您只想快速預覽核心的績效指標，而不需要生成所有圖表，可以使用 `pyfolio.plotting.show_perf_stats()`。這個方法更輕量，執行速度更快。

```python
# 僅顯示關鍵績效指標表格
pf.show_perf_stats(returns, positions=positions, transactions=transactions)
```

---

## 3. 解讀 Tear Sheet 關鍵指標

無論是使用 `create_full_tear_sheet` 還是 `show_perf_stats`，您都會看到一個包含多項關鍵績效指標 (KPIs) 的表格。以下是一些最重要的指標：

| 指標 (Metric) | 說明 |
| :--- | :--- |
| **Annual return** | **年化報酬率**：策略在一年期間的平均報酬率。 |
| **Cumulative returns** | **累積報酬率**：策略在整個回測期間的總報酬率。 |
| **Annual volatility** | **年化波動率**：策略報酬率的年化標準差，衡量風險的常用指標。 |
| **Sharpe ratio** | **夏普比率**：衡量每單位風險所能換取的超額報酬。數值越高，代表策略的風險調整後報酬越好。 |
| **Calmar ratio** | **卡瑪比率**：年化報酬率與最大回撤的比值，衡量策略承受最大風險時的回報能力。 |
| **Max drawdown** | **最大回撤**：策略在回測期間內，淨值從最高點回落到最低點的最大幅度。這是衡量策略風險的重要指標。 |
| **Alpha** | **Alpha (α)**：相對於基準指數的超額報酬。正的 Alpha 代表策略表現優於市場。 |
| **Beta** | **Beta (β)**：策略相對於基準指數的系統性風險。Beta 為 1 表示策略與市場同步波動。 |

---

## 4. 解讀 Tear Sheet 關鍵圖表

`create_full_tear_sheet` 產生的視覺化圖表提供了更直觀的洞察。

*   **累積報酬圖 (Cumulative returns)**
    這是最重要的圖表之一，它將策略的累積報酬與基準指數的累積報酬繪製在一起，讓您能一目了然地看出策略在不同時間段的表現是優於還是劣於市場。

*   **水下圖 (Underwater plot / Drawdown plot)**
    此圖顯示了策略淨值從歷史高點回撤的百分比。圖中曲線在 0 軸以下的區域代表策略處於虧損狀態。此圖能幫助您直觀地感受策略可能面臨的最大虧損幅度和持續時間。

*   **滾動 Beta / Alpha (Rolling Beta / Alpha)**
    這些圖表顯示了策略的 Alpha 和 Beta 在不同時間窗口（例如 6 個月）內的變化情況，有助於判斷策略的風格是否穩定。

*   **月度報酬率分佈圖 (Monthly returns distribution)**
    此圖通常以 **熱力圖 (Heatmap)** 的形式呈現，將每個月份的報酬率用顏色深淺表示（綠色為正，紅色為負），讓您可以快速識別策略在哪個月份或年份表現較好或較差，從而發現潛在的季節性效應。

---

## 5. 常見問題與解決方案

### extract_rets_pos_txn_from_zipline 執行失敗

在極少數情況下（例如回測時間過短或沒有任何交易），`extract_rets_pos_txn_from_zipline` 可能會因為無法提取有效的交易數據而執行失敗。為了增強程式碼的穩健性，建議使用 `try-except` 區塊來處理這種異常情況。

 **備用方案**：如果提取失敗，您可以退而求其次，僅分析策略的總報酬率 (`algorithm_period_return`)。

```python
import pyfolio as pf

try:
    # 嘗試正常提取數據
    returns, positions, transactions = pf.utils.extract_rets_pos_txn_from_zipline(results)
except Exception as e:
    print(f"從 Zipline 結果中提取數據時發生錯誤: {e}")
    # 如果失敗，則使用備用方案，僅獲取總報酬率
    returns = results.get('algorithm_period_return', None)
    positions = None
    transactions = None

# 即使提取失敗，仍然可以分析總報酬率
if returns is not None:
    pf.create_returns_tear_sheet(returns, benchmark_rets=results.benchmark_return)
else:
    print("無法獲取任何有效的報酬數據進行分析。")
```

---

## 總結

Pyfolio 是量化研究中不可或缺的績效分析工具。它將複雜的風險報酬指標和策略表現特徵，以標準化、視覺化的方式呈現出來，幫助研究者快速、準確地評估策略的優劣。在 TQuant Lab 中，熟練運用 `create_full_tear_sheet` 和 `show_perf_stats`，並了解如何處理潛在的數據提取問題，是從策略開發邁向策略優化的關鍵一步。