# Zipline Pipeline 資料集：EquityPricing

!!! info
    本頁詳細介紹 Zipline Pipeline 中的 `EquityPricing` 資料集，包括其用途、提供的欄位、如何存取數據以及在 Pipeline 中使用的範例，是構建價量因子的基礎。

在 Zipline Pipeline 中，`EquityPricing` 是一個核心的內建 `DataSet`，專門用於提供股票的價量數據。它是您構建各種價量因子、篩選器以及交易策略的基礎。

---

## 1. EquityPricing 簡介

`EquityPricing` 包含了股票在每個交易日的開盤價、最高價、最低價、收盤價和成交量等標準資訊。當您在 Pipeline 中引用 `EquityPricing` 時，Zipline 會自動從您選擇的資料包 (`bundle`) 中讀取這些數據，並進行必要的清洗和對齊，確保數據的可用性和一致性。

---

## 2. EquityPricing 提供的欄位

`EquityPricing` 提供以下常用的價量欄位作為 `BoundColumn` 物件：

*   `open`: 每日開盤價。
*   `high`: 每日最高價。
*   `low`: 每日最低價。
*   `close`: 每日收盤價。
*   `volume`: 每日成交量。

---

## 3. 如何存取 EquityPricing 欄位數據

您可以透過 `EquityPricing.column_name` 方式獲取 `BoundColumn` 物件，再利用其 `.latest` 或 `.slice()` 方法來指定您想要提取的數據。

### 3.1. .latest：獲取單一最新值

`.latest` 用於獲取 Pipeline 計算當天（或前一個交易日）的最新數據點。

```python
from zipline.pipeline.data import EquityPricing

# 獲取最新收盤價
latest_close_price = EquityPricing.close.latest

# 獲取最新成交量
latest_volume = EquityPricing.volume.latest
```

### 3.2. .slice(window_length)：獲取歷史窗口數據

`.slice(window_length)` 用於獲取 Pipeline 計算當天之前，指定 `window_length` 天數的歷史數據窗口。這在計算移動平均、標準差等需要歷史數據的因子時非常有用。

```python
from zipline.pipeline.data import EquityPricing

# 獲取過去 20 天的收盤價數據
historical_close_prices = EquityPricing.close.slice(window_length=20)

# 獲取過去 10 天的成交量數據
historical_volume = EquityPricing.volume.slice(window_length=10)
```

### 3.3. .history(window_length, frequency)：獲取歷史窗口數據 (進階用法)

`history()` 方法也可用於獲取歷史數據，它在 `handle_data` 中更為常見。在 Pipeline 中，`.slice()` 通常是更直接和慣用的方式。`history` 方法的 `frequency` 參數可以指定數據頻率 (例如 `'1d'` 代表日頻率)。

```python
from zipline.pipeline.data import EquityPricing

# 獲取過去 5 天的日收盤價數據 (在 Pipeline 中，通常會透過 .slice() 實現類似功能)
historical_close_pipeline = EquityPricing.close.history(5, '1d')
```

---

## 4. 範例

以下是一個完整的 Pipeline 範例，演示如何在 Pipeline 中使用 `EquityPricing` 獲取最新收盤價、計算其 20 日簡單移動平均，並獲取 10 日成交量。

```python
import pandas as pd
from zipline import run_algorithm
from zipline.api import (
    attach_pipeline,
    pipeline_output,
    set_benchmark,
    symbol,
    order_target_percent
)
from zipline.pipeline import Pipeline
from zipline.pipeline.factors import SimpleMovingAverage, AverageDollarVolume
from zipline.pipeline.data import EquityPricing
from zipline.pipeline.filters import AverageDollarVolume as ADVFilter # 重命名以避免衝突

# 1. 定義 Pipeline
def make_my_pricing_pipeline():
    # 獲取最新收盤價
    latest_close = EquityPricing.close.latest
    # 計算 20 日簡單移動平均線
    sma_20 = SimpleMovingAverage(inputs=[EquityPricing.close], window_length=20)
    # 獲取過去 10 天的成交量總和
    volume_10d_sum = EquityPricing.volume.sum(window_length=10) # Sum 是一個 Factor
    
    # 篩選器：過去 5 天平均日成交金額前 30 檔股票
    high_volume_filter = AverageDollarVolume(window_length=5).top(30)

    return Pipeline(
        columns={
            'Close_Price': latest_close,
            'SMA_20': sma_20,
            'Volume_10D_Sum': volume_10d_sum
        },
        screen=high_volume_filter # 篩選 Universe
    )

# 2. Zipline 回測設置
def initialize(context):
    set_benchmark(symbol('IR0001')) # 設定 Benchmark
    attach_pipeline(make_my_pricing_pipeline(), 'my_pricing_pipeline') # 附掛 Pipeline

def before_trading_start(context, data):
    pipeline_results = pipeline_output('my_pricing_pipeline')
    context.my_universe = pipeline_results.index.get_level_values(1).tolist()
    context.pipeline_data = pipeline_results

def handle_data(context, data):
    if not context.my_universe:
        return

    for asset in context.my_universe:
        if data.can_trade(asset) and asset in context.pipeline_data.index.get_level_values(1):
            close_price = context.pipeline_data.loc[(data.current_dt.date(), asset), 'Close_Price']
            sma_20 = context.pipeline_data.loc[(data.current_dt.date(), asset), 'SMA_20']
            volume_sum = context.pipeline_data.loc[(data.current_dt.date(), asset), 'Volume_10D_Sum']

            # 示例邏輯：如果收盤價高於 SMA_20 且成交量充足，則買入
            if close_price > sma_20 and volume_sum > 1_000_000: # 假設成交量大於 1 百萬
                order_target_percent(asset, 1.0 / len(context.my_universe))
            elif close_price < sma_20 and asset in context.portfolio.positions:
                order_target_percent(asset, 0.0)

def analyze(context, results):
    print("回測分析完成。")

# 執行回測
results = run_algorithm(
    start=pd.Timestamp('2020-01-01', tz='UTC'),
    end=pd.Timestamp('2021-01-01', tz='UTC'),
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    capital_base=1_000_000,
    bundle='tquant',
    before_trading_start=before_trading_start
)
```
