# 如何產生 Pyfolio 績效報表

!!! info
    本頁提供如何從 Zipline 回測結果生成 Pyfolio 績效報表的詳細指南，包括數據準備、時區標準化和 `create_full_tear_sheet()` 的使用方法。

Pyfolio 是一個強大的 Python 庫，專為量化投資策略的績效與風險分析而設計。它與 Zipline 回測庫完美兼容，能夠將 Zipline `run_algorithm()` 產生的複雜回測結果，轉換為一套標準化且視覺化的績效報告 (稱為 "tearsheet")，讓您可以全面評估策略的優劣。

本指南將說明如何將 Zipline 的回測結果導入 Pyfolio 並生成完整的績效報表。

---

## 1. 準備回測數據

首先，您需要從 Zipline `run_algorithm()` 函數返回的 `results` DataFrame 中，提取 Pyfolio 所需的核心數據格式。`pyfolio.utils.extract_rets_pos_txn_from_zipline()` 函數能有效地完成這項任務。

#### 核心數據類型：
*   `returns` (策略報酬率): `pd.Series`，包含每個交易日的策略報酬率。
*   `positions` (持有部位): `pd.DataFrame`，包含每個交易日各證券與現金的持有部位。
*   `transactions` (交易紀錄): `pd.DataFrame`，包含所有交易的詳細資訊。
*   `benchmark_rets` (基準報酬率): `pd.Series`，包含每個交易日的 Benchmark 報酬率。這可以從 `results.benchmark_return` 直接取得。

#### 數據提取與時區標準化

Pyfolio 要求輸入的數據索引必須是 UTC 時區。因此，在提取數據後，通常需要進行時區標準化。

```python
import pandas as pd
import pyfolio
from pyfolio.utils import extract_rets_pos_txn_from_zipline

# 假設 results 是 zipline.run_algorithm() 執行後的結果 DataFrame
# results = run_algorithm(...)

# 提取策略數據
returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)

# 提取 Benchmark 報酬率
benchmark_rets = results.benchmark_return

# 時區標準化 (確保 Pyfolio 兼容性)
returns.index = returns.index.tz_localize(None).tz_localize('UTC')
positions.index = positions.index.tz_localize(None).tz_localize('UTC')
transactions.index = transactions.index.tz_localize(None).tz_localize('UTC')
benchmark_rets.index = benchmark_rets.index.tz_localize(None).tz_localize('UTC')
```

---

## 2. 生成完整績效報表 (create_full_tear_sheet())

當您準備好上述數據後，就可以呼叫 `pyfolio.tears.create_full_tear_sheet()` 函數來生成包含各項圖表和統計數據的完整績效報表。

#### 主要參數：
*   `returns`: (必要) 策略的每日報酬率 (`pd.Series`)。
*   `positions`: (可選) 策略的每日持有部位 (`pd.DataFrame`)。
*   `transactions`: (可選) 策略的交易紀錄 (`pd.DataFrame`)。
*   `benchmark_rets`: (可選) Benchmark 的每日報酬率 (`pd.Series`)。若不傳入，則某些與 Benchmark 比較的圖表將不會生成。

```python
import pyfolio

# ... (上述數據提取與時區標準化的程式碼)

pyfolio.tears.create_full_tear_sheet(
    returns=returns,
    positions=positions,
    transactions=transactions,
    benchmark_rets=benchmark_rets # 傳入 Benchmark 報酬率以供比較
)
```

執行後，您會看到一系列的績效圖表和統計數據，包括報酬曲線、回撤、風險指標、各資產的持有比重分析、交易分析等。

---

## 3. 完整範例

以下將結合一個簡單的「買入並持有台積電」策略的回測結果，演示如何生成 Pyfolio 績效報表。

!!! tip
    在執行此範例前，請確保您已經使用 `zipline ingest -b tquant` 匯入了價量資料，並且資料範圍涵蓋了回測期間。詳見：[匯入價量資料指南](../data/ingest-spot-pricing.md)

```python
import pandas as pd
from zipline import run_algorithm
from zipline.api import (
    set_benchmark,
    symbol,
    order_target_percent,
    record
)
import pyfolio
from pyfolio.utils import extract_rets_pos_txn_from_zipline
import matplotlib.pyplot as plt


# --- Zipline 回測部分 ---
def initialize(context):
    context.asset = symbol('2330')
    set_benchmark(symbol('IR0001'))
    context.has_ordered = False

def handle_data(context, data):
    if not context.has_ordered:
        order_target_percent(context.asset, 1.0)
        context.has_ordered = True
    record(price=data.current(context.asset, 'price'))

def analyze(context, results):
    pass # Pyfolio 將會處理分析和視覺化

results = run_algorithm(
    start=pd.Timestamp('2022-01-01', tz='UTC'),
    end=pd.Timestamp('2023-01-01', tz='UTC'),
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    capital_base=1_000_000,
    bundle='tquant'
)

# --- Pyfolio 分析部分 ---
# 1. 提取 Zipline 回測結果
returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)
benchmark_rets = results.benchmark_return

# 2. 時區標準化
returns.index = returns.index.tz_localize(None).tz_localize('UTC')
positions.index = positions.index.tz_localize(None).tz_localize('UTC')
transactions.index = transactions.index.tz_localize(None).tz_localize('UTC')
benchmark_rets.index = benchmark_rets.index.tz_localize(None).tz_localize('UTC')

# 3. 生成完整的 Pyfolio 績效報表
pyfolio.tears.create_full_tear_sheet(
    returns=returns,
    positions=positions,
    transactions=transactions,
    benchmark_rets=benchmark_rets
)

# 由於 create_full_tear_sheet 內部會調用 plt.show()，
# 如果在非互動環境運行，可能需要手動儲存圖表或確保繪圖環境是互動的。
# plt.show() # 如果 tearsheet 沒有自動顯示，可以嘗試手動呼叫
```
