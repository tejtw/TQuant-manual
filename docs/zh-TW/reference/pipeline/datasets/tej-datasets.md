# Zipline Pipeline 資料集：TQDataSet / TQAltDataSet

!!! info
    本頁詳細介紹 Zipline Pipeline 中的 `TQDataSet` 和 `TQAltDataSet` 資料集，包括其用途、欄位查詢、如何導入和使用 TEJ 財務與非財務數據，並提供完整的範例。

TQuant Lab 為了深度整合 TEJ 數據，提供了兩個專用的 `DataSet`：`TQDataSet` 和 `TQAltDataSet`。它們是 Pipeline 中獲取 TEJ 財務（基本面）和非財務數據的核心來源，讓您可以輕鬆地將 TEJ 數據應用於因子研究和策略開發。

---

## 1. TQDataSet 和 TQAltDataSet 簡介

*   **`TQDataSet`**: 主要用於獲取**財務相關數據**，例如營收、利潤、股東權益報酬率等基本面指標。
*   **`TQAltDataSet`**: 主要用於獲取**非財務相關數據**，例如產業別、市場類型等。

這兩個 `DataSet` 遵循 Zipline `DataSet` 的標準行為，提供經過清洗、對齊且無前視性偏差的歷史數據，供 Pipeline 中的 `Factor`、`Filter` 和 `Classifier` 使用。

---

## 2. 棄用說明與新路徑

!!! important
    早期版本使用 `zipline.pipeline.data.tejquant.TQDataSet` 和 `zipline.pipeline.data.tejquant.TQAltDataSet` 的路徑已被棄用。現在請務必改用新的導入路徑：
    ```python
    from zipline.pipeline.data.TQFundamentals import TQDataSet, TQAltDataSet
    ```

---

## 3. 如何獲取欄位列表

由於 `TQDataSet` 和 `TQAltDataSet` 包含了 TEJ 資料庫中大量的欄位，您可以使用 `._column_names` 屬性來查詢所有可用的欄位名稱。

```python
from zipline.pipeline.data.TQFundamentals import TQDataSet, TQAltDataSet

# 查詢 TQDataSet (財務數據) 所有可用欄位
print("TQDataSet 可用欄位範例:")
print(TQDataSet._column_names[:5]) # 打印前 5 個欄位

# 查詢 TQAltDataSet (非財務數據) 所有可用欄位
print("\nTQAltDataSet 可用欄位範例:")
print(TQAltDataSet._column_names[:5]) # 打印前 5 個欄位
```

---

## 4. 如何在 Pipeline 中使用

在 Pipeline 中使用 `TQDataSet` 和 `TQAltDataSet` 的方式與 `EquityPricing` 類似，都是透過 `DataSet.column_name.latest` 或 `DataSet.column_name.slice(window_length)` 來獲取數據。

#### 常用欄位示例：

*   `TQDataSet.Gross_Margin_Growth_Rate_A.latest`: 獲取最新的毛利率成長率 (年)。
*   `TQDataSet.Return_On_Equity_A.latest`: 獲取最新的股東權益報酬率 (年)。
*   `TQAltDataSet.Industry.latest`: 獲取最新的產業別。
*   `TQAltDataSet.Market_Cap_Dollars.latest`: 獲取最新的市值。

#### 範例：獲取最新產業別和毛利率成長率

```python
from zipline.pipeline.data.TQFundamentals import TQDataSet, TQAltDataSet
from zipline.pipeline import Pipeline

def make_my_tej_pipeline():
    return Pipeline(
        columns={
            'Industry': TQAltDataSet.Industry.latest, # 獲取最新產業別 (非財務)
            'Gross_Margin_Growth_Rate': TQDataSet.Gross_Margin_Growth_Rate_A.latest, # 獲取最新毛利率成長率 (財務)
            'Market_Cap': TQAltDataSet.Market_Cap_Dollars.latest # 獲取最新市值 (非財務)
        }
    )
```

---

## 5. 完整範例

以下是一個完整的 Pipeline 範例，演示如何定義一個 Pipeline，使用 `TQDataSet` 和 `TQAltDataSet` 獲取多種基本面數據，並將其輸出。

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
from zipline.pipeline.factors import SimpleMovingAverage # 範例中可使用內建 Factor
from zipline.pipeline.data import EquityPricing # 可同時使用 EquityPricing
from zipline.pipeline.data.TQFundamentals import TQDataSet, TQAltDataSet
from zipline.pipeline.filters import AverageDollarVolume # 篩選器範例

# 1. 定義 Pipeline
def make_my_fundamental_pipeline():
    # 獲取最新收盤價 (來自 EquityPricing，作為參考)
    latest_close = EquityPricing.close.latest
    
    # 獲取 TEJ 財務數據
    roe_q = TQDataSet.Return_On_Equity_Q.latest # 季度 ROE
    eps_y = TQDataSet.Earnings_Per_Share_Y.latest # 年度 EPS
    
    # 獲取 TEJ 非財務數據
    industry = TQAltDataSet.Industry.latest
    market_cap = TQAltDataSet.Market_Cap_Dollars.latest
    
    # 篩選器：過去 10 天平均日成交金額前 50 檔股票
    high_volume_filter = AverageDollarVolume(window_length=10).top(50)

    return Pipeline(
        columns={
            'Close_Price': latest_close,
            'ROE_Q': roe_q,
            'EPS_Y': eps_y,
            'Industry': industry,
            'Market_Cap': market_cap
        },
        screen=high_volume_filter # 篩選 Universe
    )

# 2. Zipline 回測設置
def initialize(context):
    set_benchmark(symbol('IR0001')) # 設定 Benchmark
    attach_pipeline(make_my_fundamental_pipeline(), 'my_fundamental_pipeline') # 附掛 Pipeline

def before_trading_start(context, data):
    pipeline_results = pipeline_output('my_fundamental_pipeline')
    context.my_universe = pipeline_results.index.get_level_values(1).tolist()
    context.pipeline_data = pipeline_results

def handle_data(context, data):
    if not context.my_universe:
        return

    for asset in context.my_universe:
        if data.can_trade(asset) and asset in context.pipeline_data.index.get_level_values(1):
            close_price = context.pipeline_data.loc[(data.current_dt.date(), asset), 'Close_Price']
            roe = context.pipeline_data.loc[(data.current_dt.date(), asset), 'ROE_Q']
            eps = context.pipeline_data.loc[(data.current_dt.date(), asset), 'EPS_Y']
            industry = context.pipeline_data.loc[(data.current_dt.date(), asset), 'Industry']

            # 示例邏輯：如果 ROE 和 EPS 都為正，且屬於特定產業，則買入
            if roe > 0 and eps > 0 and industry == '半導體業': # 假設半導體業為範例
                order_target_percent(asset, 1.0 / len(context.my_universe))
            # 否則，如果持有該股票，則清倉
            elif (roe <= 0 or eps <= 0) and asset in context.portfolio.positions:
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
