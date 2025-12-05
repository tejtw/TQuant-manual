# Pipeline 資料集 (DataSet) 概覽

!!! info
    本頁介紹 Zipline Pipeline 中資料集 (DataSets) 的核心概念，包括其作用、TQuant Lab 提供的內建資料集類型，以及如何在 Pipeline 中使用這些資料集來獲取原始數據。

在 Zipline Pipeline 中，`DataSet` 扮演著數據來源的角色。它提供了一個結構化的介面，讓您可以便捷、安全地存取歷史市場數據、基本面數據或其他自定義數據。`DataSet` 的主要優勢在於它能確保數據經過清洗、對齊，並在 Pipeline 的計算過程中自動處理前視性偏差。

---

## 1. DataSet 簡介

`DataSet` 物件代表了一個特定的數據源，例如股票的每日價格 (`EquityPricing`) 或 TEJ 的財務數據。當您在 Pipeline 中使用 `Factor`、`Filter` 或 `Classifier` 時，它們通常會從這些 `DataSet` 中獲取原始輸入。

---

## 2. BoundColumn 概念

當您透過 `DataSet.column_name` 方式（例如 `EquityPricing.close`）訪問 `DataSet` 中的特定欄位時，Zipline 會返回一個 `BoundColumn` 物件。這個 `BoundColumn` 物件是實際數據操作的介面。

`BoundColumn` 提供了多種方法來指定您想要從該欄位獲取哪些數據：

*   `.latest`: 獲取每個資產在每個交易日的最新值。
    *   範例：`EquityPricing.close.latest` (獲取最新收盤價)。
*   `.slice(window_length)`: 獲取每個資產在指定 `window_length` 內的歷史數據窗口。
    *   範例：`EquityPricing.volume.slice(window_length=20)` (獲取過去 20 天的交易量數據)。

---

## 3. 常見 DataSet 範例

Zipline (TQuant Lab) 提供了多個內建的 `DataSet` 以供使用：

### 3.1. EquityPricing：股票價量數據

`EquityPricing` 是最常用的 `DataSet` 之一，它提供了股票的標準價量數據。

*   **導入**: `from zipline.pipeline.data import EquityPricing`
*   **常見欄位**:
    *   `open`: 開盤價
    *   `high`: 最高價
    *   `low`: 最低價
    *   `close`: 收盤價
    *   `volume`: 成交量

#### 範例：獲取最新收盤價和 20 日成交量

```python
from zipline.pipeline.data import EquityPricing
from zipline.pipeline import Pipeline
from zipline.pipeline.factors import SimpleMovingAverage

def make_pipeline():
    return Pipeline(
        columns={
            'Latest_Close': EquityPricing.close.latest,
            'Historical_Volume_20D': EquityPricing.volume.slice(window_length=20),
            'SMA_20D_Close': SimpleMovingAverage(inputs=[EquityPricing.close], window_length=20)
        }
    )
```

### 3.2. TQDataSet / TQAltDataSet：TEJ 財務與非財務數據

TQuant Lab 為了整合 TEJ 資料庫的豐富數據，提供了 `TQDataSet` 和 `TQAltDataSet`。

*   **`TQDataSet`**: 主要用於財務相關的數據。
*   **`TQAltDataSet`**: 主要用於非財務相關的數據。

!!! important
    早期版本的 `zipline.pipeline.data.tejquant.TQDataSet` 已被棄用。現在請改用 `zipline.pipeline.data.TQFundamentals.TQDataSet` 和 `zipline.pipeline.data.TQFundamentals.TQAltDataSet`。

*   **導入**: `from zipline.pipeline.data.TQFundamentals import TQDataSet, TQAltDataSet`
*   **常見欄位**: 這些 `DataSet` 提供了 TEJ 資料庫中眾多的財務（例如 `Gross_Margin_Growth_Rate_A`）和非財務（例如 `Industry`）數據。具體可用欄位請參考相關文件或通過 `TQDataSet._column_names` 查詢。

#### 範例：獲取最新產業別和毛利率成長率

```python
from zipline.pipeline.data.TQFundamentals import TQDataSet, TQAltDataSet
from zipline.pipeline import Pipeline

def make_pipeline():
    return Pipeline(
        columns={
            'Industry': TQAltDataSet.Industry.latest, # 獲取最新產業別
            'Gross_Margin_Growth_Rate': TQDataSet.Gross_Margin_Growth_Rate_A.latest # 獲取最新毛利率成長率
        }
    )
```

---

## 4. 完整範例

以下是一個完整的 Pipeline 範例，演示如何在一個 Pipeline 中結合 `EquityPricing` 和 `TQDataSet` 獲取多種數據。

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
from zipline.pipeline.factors import SimpleMovingAverage
from zipline.pipeline.data import EquityPricing
from zipline.pipeline.data.TQFundamentals import TQDataSet, TQAltDataSet
from zipline.pipeline.filters import AverageDollarVolume # 篩選器範例

# 1. 定義 Pipeline
def make_my_pipeline():
    # 獲取最新收盤價
    latest_close = EquityPricing.close.latest
    # 計算 20 日簡單移動平均線
    sma_20 = SimpleMovingAverage(inputs=[EquityPricing.close], window_length=20)
    # 獲取最新產業別
    industry_sector = TQAltDataSet.Industry.latest
    # 獲取最新毛利率成長率
    gross_margin_growth = TQDataSet.Gross_Margin_Growth_Rate_A.latest
    
    # 篩選器：過去 10 天平均日成交金額前 50 檔股票
    high_volume_filter = AverageDollarVolume(window_length=10).top(50)

    return Pipeline(
        columns={
            'Close_Price': latest_close,
            'SMA_20': sma_20,
            'Industry': industry_sector,
            'GM_Growth': gross_margin_growth
        },
        screen=high_volume_filter # 篩選 Universe
    )

# 2. Zipline 回測設置
def initialize(context):
    set_benchmark(symbol('IR0001')) # 設定 Benchmark
    attach_pipeline(make_my_pipeline(), 'my_data_pipeline') # 附掛 Pipeline

def before_trading_start(context, data):
    pipeline_results = pipeline_output('my_data_pipeline')
    context.my_universe = pipeline_results.index.get_level_values(1).tolist()
    context.pipeline_data = pipeline_results

def handle_data(context, data):
    if not context.my_universe:
        return

    for asset in context.my_universe:
        if data.can_trade(asset) and asset in context.pipeline_data.index.get_level_values(1):
            close_price = context.pipeline_data.loc[(data.current_dt.date(), asset), 'Close_Price']
            sma_20 = context.pipeline_data.loc[(data.current_dt.date(), asset), 'SMA_20']
            industry = context.pipeline_data.loc[(data.current_dt.date(), asset), 'Industry']

            # 示例邏輯：如果收盤價高於 SMA_20 且屬於「半導體業」，則買入
            if close_price > sma_20 and industry == '半導體業':
                order_target_percent(asset, 1.0 / len(context.my_universe))
            # 否則，如果持有該股票，則清倉
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
