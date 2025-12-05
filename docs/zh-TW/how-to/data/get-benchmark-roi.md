# 如何設定與取得 Benchmark 報酬率

!!! info
    本頁提供如何在 Zipline 回測中設定與取得 Benchmark 報酬率的詳細指南，包括 `set_benchmark()` 的使用方法和 Benchmark 報酬率的計算方式。

在量化分析中，Benchmark (大盤/市場基準) 是一個衡量您的投資策略表現好壞的關鍵指標。透過將策略的報酬率與 Benchmark 的報酬率進行比較，您可以客觀地評估策略是否產生了超越市場的「超額報酬 (Alpha)」。

在 TQuant Lab (Zipline) 中，設定 Benchmark 主要透過 `set_benchmark()` 函數完成，其結果主要用於 [Pyfolio 績效報表](./visualization/pyfolio-tearsheet.md) 的視覺化分析。

---

## 1. 設定 Benchmark

您通常會在 `initialize` 函數中呼叫 `set_benchmark()` 來指定本次回測要使用的市場基準。

!!! important
    用於設定 Benchmark 的資產 (無論是指數或個股)，都必須 **預先透過 `ingest` 指令匯入** 至 `tquant` 資料包中。

### 方法一：使用預設的市場指數

TQuant Lab 預設使用 `'IR0001'` (台灣加權報酬指數) 作為市場基準。這是最常用的設定方法。

```python
from zipline.api import set_benchmark, symbol

def initialize(context):
    # 將台灣加權報酬指數設定為 Benchmark
    set_benchmark(symbol('IR0001'))
```

### 方法二：使用自定義的股票作為 Benchmark

您也可以指定任意一支股票作為 Benchmark，例如，將台積電 (`'2330'`) 作為比較基準，以評估您的策略相對於特定龍頭股的表現。

```python
from zipline.api import set_benchmark, symbol

def initialize(context):
    # 將台積電 (2330) 設定為 Benchmark
    set_benchmark(symbol('2330'))
```

---

## 2. 取得 Benchmark 報酬率

在 TQuant Lab 的工作流程中，您 **通常不需要手動呼叫** `get_benchmark_returns()`。

當您執行回測並產生 Pyfolio 報表時，Zipline 會在後台自動根據您用 `set_benchmark()` 設定的基準，計算每日的 Benchmark 報酬率，並將其與您的策略報酬率並列呈現在圖表和數據統計中。

Benchmark 的每日報酬率計算方式為：`(當日收盤價 / 前一日收盤價) - 1`。

如果您確實在特殊場景下需要手動取得 Benchmark 的歷史報酬序列，可以使用 `get_benchmark_returns()` 函數，但這在多數分析流程中並非必要步驟。

```python
from zipline.api import get_benchmark_returns, date_rules, time_rules

def initialize(context):
    # ... (設定 benchmark)
    
    # 範例：每日開盤後取得 benchmark 歷史報酬
    schedule_function(
        log_benchmark,
        date_rules.every_day(),
        time_rules.market_open()
    )

def log_benchmark(context, data):
    # 取得從回測開始到當天的 benchmark 報酬率 (一個 Pandas Series)
    # 注意：此函數在 TQuant Lab 範例中較少被直接使用
    benchmark_returns = get_benchmark_returns() 
    print(benchmark_returns.tail())
```