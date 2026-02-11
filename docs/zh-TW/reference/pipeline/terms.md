# Pipeline 核心構建模塊：Factor, Filter, Classifier

!!! info
    本頁詳細介紹 Zipline Pipeline 中的 `Factor`、`Filter` 和 `Classifier` 三種核心構建模塊，包括其定義、用途、輸出及使用範例，幫助使用者建立自動化選股邏輯。

Zipline 的 Pipeline API 透過 `Factor`、`Filter` 和 `Classifier` 三種核心構建模塊，實現了靈活高效的數據處理和資產篩選。理解這些構建模塊的用途和相互關係，是構建強大 Pipeline 的基礎。

---

## 1. 概念簡介

*   **`Factor` (因子)**:
    *   **用途**: 計算橫截面（cross-sectional）數據，通常是數值型輸出。它對每個資產在每個時間點生成一個數值，例如移動平均、相對強弱指數、市值等。
    *   **輸出**: `pd.DataFrame`，索引為 `(日期, 資產)` 的 MultiIndex，值為計算出的數值。
*   **`Filter` (過濾器)**:
    *   **用途**: 根據布林條件篩選資產。它對每個資產在每個時間點生成一個布林值 (`True`/`False`)，用於決定該資產是否應包含在回測的 Universe 或 Pipeline 的輸出中。
    *   **輸出**: `pd.DataFrame`，索引為 `(日期, 資產)` 的 MultiIndex，值為布林值。
*   **`Classifier` (分類器)**:
    *   **用途**: 將資產分組。它對每個資產在每個時間點生成一個離散的類別標籤，例如行業代碼、市值分位數等。
    *   **輸出**: `pd.DataFrame`，索引為 `(日期, 資產)` 的 MultiIndex，值為類別標籤。

---

## 2. Factor (因子)

`Factor` 是 Pipeline 中最基礎的數值計算單元。它通常接受一個或多個 `DataSet` 中的欄位作為輸入，並在指定的 `window_length` 上執行計算。

*   **用途**: 從原始數據中提取有意義的數值資訊。
*   **常見參數**:
    *   `inputs`: (list of `BoundColumn`) 因子計算所需的輸入數據欄位，例如 `[EquityPricing.close]`。
    *   `window_length`: (int) 因子計算所使用的歷史數據窗口長度（例如，20 日移動平均）。

#### 範例：SimpleMovingAverage (簡單移動平均)

```python
from zipline.pipeline.factors import SimpleMovingAverage
from zipline.pipeline.data import EquityPricing

# 計算 20 日收盤價的簡單移動平均
sma_20 = SimpleMovingAverage(inputs=[EquityPricing.close], window_length=20)

# 計算 10 日成交金額的簡單移動平均
# from zipline.pipeline.factors import AverageDollarVolume
# sma_dollar_volume_10 = SimpleMovingAverage(inputs=[AverageDollarVolume(window_length=1)], window_length=10)
```

---

## 3. Filter (過濾器)

`Filter` 用於根據條件選擇資產。它們通常是 `Factor` 物件透過比較運算 (例如 `factor > value`) 或特定方法 (例如 `top(N)`) 轉換而來。

*   **用途**: 定義每日回測或 Pipeline 輸出的資產 Universe。
*   **常見用法**:
    *   **基於因子的排名篩選**: `Factor.top(N)` (前 N 名), `Factor.bottom(N)` (後 N 名)。
    *   **基於因子分位數篩選**: `Factor.percentile_between(min_percentile, max_percentile)` (指定分位數區間)。
    *   **布林運算**: `factor > value`, `factor == value`。
    *   **組合過濾器**: 使用 `&` (AND), `|` (OR), `~` (NOT) 運算符組合多個 `Filter`。

#### 範例：篩選日成交金額前 50 檔股票

```python
from zipline.pipeline.factors import AverageDollarVolume

# 計算 20 日平均日成交金額因子
dollar_volume = AverageDollarVolume(window_length=20)

# 創建一個 Filter：篩選出平均日成交金額前 50 名的股票
top_50_dollar_volume = dollar_volume.top(50)

# 創建一個 Filter：篩選出平均日成交金額在 50% 到 80% 分位數之間的股票
mid_range_dollar_volume = dollar_volume.percentile_between(50, 80)
```

---

## 4. Classifier (分類器)

`Classifier` 用於將資產歸類到不同的組別中，例如行業、市場類型或自定義的組別。這對於進行行業輪動、分組對沖或分層回測等策略非常有用。

*   **用途**: 對資產進行分組或標籤化。
*   **常見用法**: 獲取資產的行業或板塊信息。

#### 範例：獲取資產的主產業別

```python
from zipline.pipeline.data import tejquant # 假設 tejquant 數據集已導入
from zipline.pipeline.classifiers import Industry

# 獲取資產的主產業別 (中文)
main_industry = tejquant.TQDataSet.Industry.latest
# 或者
# main_industry = Industry() # Zipline 內建的 Industry Classifier
```

---

## 5. 完整範例

以下是一個完整的 Pipeline 範例，演示如何在一個 Pipeline 中同時使用 `Factor`、`Filter` 和 `Classifier`，並在回測中獲取其輸出。

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
from zipline.pipeline.data import EquityPricing, tejquant # 導入 tejquant
from zipline.pipeline.filters import StaticAssets # 導入 StaticAssets
from zipline.pipeline.classifiers import Industry # 導入 Industry Classifier

# 1. 定義 Pipeline
def make_my_pipeline():
    # Factor: 計算 20 日簡單移動平均線
    sma_20 = SimpleMovingAverage(inputs=[EquityPricing.close], window_length=20)
    
    # Factor: 計算 10 日平均成交金額
    dollar_volume = AverageDollarVolume(window_length=10)
    
    # Filter: 篩選出平均成交金額前 50 檔股票
    high_volume_filter = dollar_volume.top(50)

    # Classifier: 獲取主產業別
    # Zipline 內建 Industry 或 tejquant.TQDataSet.Industry
    sector_classifier = tejquant.TQDataSet.Industry.latest

    return Pipeline(
        columns={
            'SMA_20': sma_20,
            'Dollar_Volume': dollar_volume,
            'Sector': sector_classifier # 將 Classifier 加入輸出
        },
        screen=high_volume_filter # 將 Filter 應用於 Pipeline，定義 Universe
    )

# 2. Zipline 回測設置
def initialize(context):
    set_benchmark(symbol('IR0001')) # 設定 Benchmark
    attach_pipeline(make_my_pipeline(), 'my_strategy_pipeline') # 附掛 Pipeline

def before_trading_start(context, data):
    pipeline_results = pipeline_output('my_strategy_pipeline')
    context.my_universe = pipeline_results.index.get_level_values(1).tolist()
    context.pipeline_data = pipeline_results

def handle_data(context, data):
    if not context.my_universe:
        return

    for asset in context.my_universe:
        if data.can_trade(asset) and asset in context.pipeline_data.index.get_level_values(1):
            sma_value = context.pipeline_data.loc[(data.current_dt.date(), asset), 'SMA_20']
            current_price = data.current(asset, 'price')
            sector = context.pipeline_data.loc[(data.current_dt.date(), asset), 'Sector'] # 獲取產業別

            # 簡單策略：如果股價突破 20 日均線，且屬於特定產業，則買入
            if current_price > sma_value and sector == '半導體業': # 假設半導體業為範例
                order_target_percent(asset, 1.0 / len(context.my_universe))
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
