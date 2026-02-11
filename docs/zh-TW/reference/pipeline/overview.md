# Zipline Pipeline API 概覽

!!! info
    本頁深入解釋 Zipline Pipeline 的運作原理，包括其核心組件（Factors, Filters, Classifiers）、資料集 (DataSets) 的概念、以及如何透過 Pipeline 高效地生成交易訊號，為使用者建立對 Pipeline 的全面理解。

Zipline 的 Pipeline API 是一個強大且高效的工具，專為在龐大的資產池中進行因子計算和動態資產篩選而設計。它允許策略開發者以聲明式的方式定義複雜的數據處理流程，從而避免了傳統方法中常見的「前視性偏差 (Look-Ahead Bias)」和數據處理效率低下等問題。

---

## 1. Pipeline 簡介

Pipeline 的核心思想是將數據提取、因子計算和資產篩選的邏輯，從主回測循環 (`handle_data()`) 中分離出來，並在 **每個交易日開始前** 進行**一次性** 計算。

#### 主要優勢：
*   **避免前視性偏差** : 確保所有數據操作都只使用到回測當天之前可用的資訊。
*   **高效性** : 透過 Zipline 優化的數據引擎和向量化操作，能夠在大型數據集上高效執行複雜的計算。
*   **可讀性與模組化** : 策略邏輯與數據處理邏輯分離，提高代碼的可讀性和可維護性。

---

## 2. 核心概念 

在使用 Pipeline 時，您會接觸到以下幾個核心概念：

*   `Pipeline` 物件:
    *   這是 Pipeline API 的核心，作為一個容器，用於定義要計算哪些 Factor、篩選哪些資產，以及輸出哪些數據。
    *   您可以在 `Pipeline` 物件中指定 `columns` 來定義輸出數據，以及 `screen` 來定義資產篩選條件。
*   `Factor` (因子):
    *   用於計算橫截面數據（即對所有資產在某個時間點進行計算）的函數。它們通常會返回每個資產在每個時間點的數值。
    *   範例：`SimpleMovingAverage` (簡單移動平均), `AverageDollarVolume` (平均成交金額)。
*   `Filter` (過濾器):
    *   用於篩選資產的布林函數。它們通常會返回每個資產在每個時間點的 `True` 或 `False`，表示該資產是否符合條件。
    *   範例：`top(N)` (市值前N大), `StaticAssets` (靜態資產列表)。
*   `Classifier` (分類器):
    *   用於將資產分組的函數。它們通常返回每個資產在每個時間點的一個類別標籤（例如行業代碼）。
*   `DataSet` (數據集):
    *   Pipeline 數據的來源，例如 `EquityPricing` (股票價格數據), `TQDataSet` (TEJ 自定義數據集)。

---

## 3. Pipeline 工作流程

Pipeline 的使用通常遵循以下三個步驟：

### 3.1. 定義 Pipeline (make_pipeline() 函數)

您會創建一個函數 (通常命名為 `make_pipeline()`)，用於構建和返回一個 `Pipeline` 物件。在這個函數內部，您定義了 Pipeline 的所有計算邏輯。

```python
from zipline.pipeline import Pipeline
from zipline.pipeline.factors import SimpleMovingAverage
from zipline.pipeline.filters import AverageDollarVolume
from zipline.pipeline.data import EquityPricing

def make_my_pipeline():
    # 定義一個因子：20 日簡單移動平均線
    sma_20 = SimpleMovingAverage(inputs=[EquityPricing.close], window_length=20)
    
    # 定義一個篩選器：篩選出過去 20 天平均日成交金額前 50% 的股票
    high_dollar_volume = AverageDollarVolume(window_length=20).percentile_between(50, 100)
    
    return Pipeline(
        columns={
            'SMA_20': sma_20,
            'Close_Price': EquityPricing.close.latest # 也可以獲取最新收盤價
        },
        screen=high_dollar_volume # 將篩選器應用於 Pipeline，決定每天的 Universe
    )
```

### 3.2. 附掛 Pipeline (attach_pipeline() 函數)

在回測的 `initialize()` 函數中，您需要使用 `zipline.api.attach_pipeline()` 將定義好的 Pipeline 附掛到回測引擎。這樣，Zipline 就會知道在每個交易日運行該 Pipeline。

```python
from zipline.api import attach_pipeline, set_benchmark, symbol

def initialize(context):
    set_benchmark(symbol('IR0001')) # 設定 Benchmark
    attach_pipeline(make_my_pipeline(), 'my_pipeline_name') # 附掛 Pipeline 並命名
```

### 3.3. 獲取 Pipeline 輸出 (pipeline_output() 函數)

在每個交易日需要 Pipeline 輸出結果時，您可以使用 `zipline.api.pipeline_output()` 函數，傳入您在 `attach_pipeline()` 中指定的名稱，來獲取當日 Pipeline 的計算結果。

這通常在 `before_trading_start()` 函數中執行，因為 Pipeline 的計算會在市場開盤前完成，您可以利用其結果來決定當天的交易策略。

```python
from zipline.api import pipeline_output

def before_trading_start(context, data):
    # 獲取名為 'my_pipeline_name' 的 Pipeline 在前一交易日計算的結果
    context.pipeline_results = pipeline_output('my_pipeline_name')
    
    # 從 Pipeline 輸出中獲取當天的 Universe (符合 screen 條件的股票)
    context.my_universe = context.pipeline_results.index.get_level_values(1).tolist()

    # 範例：從結果中獲取 SMA_20 值
    # if not context.pipeline_results.empty:
    #     for asset in context.my_universe:
    #         sma_value = context.pipeline_results.loc[(data.current_dt.date(), asset), 'SMA_20']
    #         print(f"{asset.symbol} 的 SMA_20: {sma_value}")
```

---

## 4. 完整範例

以下是一個完整的範例，演示如何定義、附掛 Pipeline 並獲取其輸出以篩選資產。

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
from zipline.pipeline.filters import StaticAssets

# 1. 定義 Pipeline
def make_my_pipeline():
    # 計算 20 日簡單移動平均線因子
    sma_20 = SimpleMovingAverage(inputs=[EquityPricing.close], window_length=20)
    
    # 篩選出過去 10 天平均日成交金額前 20 檔股票作為 Universe
    high_volume_filter = AverageDollarVolume(window_length=10).top(20)

    return Pipeline(
        columns={
            'SMA_20': sma_20,
            'Close_Price': EquityPricing.close.latest # 同時獲取最新收盤價
        },
        screen=high_volume_filter # 將篩選器應用於 Pipeline，定義 Universe
    )

# 2. Zipline 回測設置
def initialize(context):
    set_benchmark(symbol('IR0001')) # 設定 Benchmark
    attach_pipeline(make_my_pipeline(), 'my_strategy_pipeline') # 附掛 Pipeline

def before_trading_start(context, data):
    # 獲取 Pipeline 的輸出
    pipeline_results = pipeline_output('my_strategy_pipeline')
    
    # 從 Pipeline 輸出中獲取當天的 Universe (符合 screen 條件的股票)
    context.my_universe = pipeline_results.index.get_level_values(1).tolist()
    
    # 將 Pipeline 結果儲存到 context，供 handle_data 使用
    context.pipeline_data = pipeline_results

def handle_data(context, data):
    # 如果今天沒有篩選出的股票，則不做任何操作
    if not context.my_universe:
        return

    # 遍歷篩選出的股票
    for asset in context.my_universe:
        # 確保股票數據可用，並且有 SMA_20 數據
        if data.can_trade(asset) and asset in context.pipeline_data.index.get_level_values(1):
            sma_value = context.pipeline_data.loc[(data.current_dt.date(), asset), 'SMA_20']
            current_price = data.current(asset, 'price')

            # 簡單策略：如果股價突破 20 日均線，則買入
            if current_price > sma_value:
                # 買入等權重
                order_target_percent(asset, 1.0 / len(context.my_universe))
            # 如果股價跌破 20 日均線，且持有該股票，則清倉
            elif current_price < sma_value and asset in context.portfolio.positions:
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
    before_trading_start=before_trading_start # 確保 before_trading_start 被呼叫
)
```
