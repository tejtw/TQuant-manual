# Pyfolio 函數總覽

!!! info
    Pyfolio 是一個用於金融投資組合績效與風險分析的 Python 庫，主要以圖表方式顯示投資策略的優劣。它與 Zipline 開源回測庫完美兼容，能將回測結果轉化為專業的視覺化報表。

本頁面整理了 Pyfolio 中最常用的核心函數。

---

## 1. 資料提取 (Data Extraction)

在進行分析前，必須先從 Zipline 的回測結果 (`results`) 中提取出 Pyfolio 所需的格式。

### `extract_rets_pos_txn_from_zipline`

從 `zipline.run_algorithm()` 輸出的結果中，提取每日報酬、持有部位與交易紀錄。

```python
from pyfolio.utils import extract_rets_pos_txn_from_zipline

returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)
```

**參數 (Parameters):**

*   `backtest` (*pd.DataFrame*): Zipline 回測結果 (即 `run_algorithm` 的回傳值)。

**回傳值 (Returns):**

*   `returns` (*pd.Series*): 交易策略的每日報酬率。
*   `positions` (*pd.DataFrame*): 每日持有部位（包含現金與各資產價值）。
*   `transactions` (*pd.DataFrame*): 詳細交易紀錄。

---

## 2. 核心分析報表 (Tear Sheets)

Pyfolio 最強大的功能是 "Tear Sheet"（撕頁報表），能一鍵生成包含多種圖表與指標的完整分析報告。

### `create_full_tear_sheet`

生成包含報酬分析、風險指標、滾動 Beta、回撤 (Drawdown) 分析等全方位的績效報告。

```python
from pyfolio.tears import create_full_tear_sheet

create_full_tear_sheet(
    returns=returns,
    positions=positions,
    transactions=transactions,
    benchmark_rets=benchmark_rets
)
```

**主要參數 (Parameters):**

*   `returns` (*pd.Series*): 策略日報酬率。
*   `positions` (*pd.DataFrame*, optional): 持有部位資訊。
*   `transactions` (*pd.DataFrame*, optional): 交易紀錄。
*   `benchmark_rets` (*pd.Series*, optional): 基準 (Benchmark) 的日報酬率，用於計算 Alpha、Beta 等相對績效。
*   `live_start_date` (*datetime*, optional): 設定 "Live" 交易的開始日期，用於區分樣本內 (In-sample) 與樣本外 (Out-of-sample) 區間。

---

## 3. 其他常用繪圖與統計函數

除了產生完整報表，您也可以單獨呼叫特定函數來分析。

### `show_perf_stats`
顯示策略的關鍵績效指標表格，如年化報酬率、夏普比率 (Sharpe Ratio)、最大回撤 (Max Drawdown) 等。

```python
from pyfolio.plotting import show_perf_stats

show_perf_stats(returns, benchmark_rets)
```

### `show_worst_drawdown_periods`
列出策略歷史上表現最差的前幾名回撤期間 (Drawdown Periods)。

```python
from pyfolio.plotting import show_worst_drawdown_periods

show_worst_drawdown_periods(returns, top=5)
```

### `plot_rolling_returns`
繪製滾動報酬率圖表，並與 Benchmark 進行比較。

```python
from pyfolio.plotting import plot_rolling_returns

plot_rolling_returns(returns, factor_returns=benchmark_rets)
```

---

## 4. 完整使用範例

以下範例展示如何將 Zipline 回測結果導入 Pyfolio 進行分析。

```python
import pyfolio
from pyfolio.utils import extract_rets_pos_txn_from_zipline

# 1. 執行 Zipline 回測 (假設 results 為回測結果 DataFrame)
# results = run_algorithm(...)

# 2. 提取 Pyfolio 所需資料
returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)

# 3. 提取 Benchmark 報酬率 (假設 results 中有紀錄)
benchmark_rets = results.benchmark_return

# 4. 時區標準化 (Pyfolio 要求 UTC 時區)
returns.index = returns.index.tz_localize(None).tz_localize('UTC')
positions.index = positions.index.tz_localize(None).tz_localize('UTC')
transactions.index = transactions.index.tz_localize(None).tz_localize('UTC')
benchmark_rets.index = benchmark_rets.index.tz_localize(None).tz_localize('UTC')

# 5. 產生完整分析報表
pyfolio.tears.create_full_tear_sheet(
    returns=returns,
    positions=positions,
    transactions=transactions,
    benchmark_rets=benchmark_rets
)
```
