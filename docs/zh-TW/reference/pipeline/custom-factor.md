# Zipline CustomFactor：創建自定義因子

!!! info
    本頁深入介紹 Zipline Pipeline 中的 `CustomFactor`，說明如何透過繼承此類別來創建自訂的因子，以滿足特定的量化策略需求。內容涵蓋 `CustomFactor` 的核心概念、參數、`compute` 方法的實現細節，並提供實用的程式碼範例。

在 Zipline 的 Pipeline API 中，`Factor` 允許您對數據進行數值計算。雖然 Zipline 提供了許多內建因子，但實務上您常常需要根據自己的策略需求創建獨特的分析指標。`CustomFactor` 就是為此而生，它讓您能夠完全自定義因子的計算邏輯。

`CustomFactor` 類別繼承自 `Factor`，這表示它擁有 `Factor` 的所有基本特性，並在此基礎上提供了一個 `compute` 方法供您覆寫，以實現您的自定義邏輯。

---

## 1. CustomFactor 簡介

*   **用途**: 允許開發者定義任何基於歷史數據的橫截面因子計算邏輯。
*   **繼承**: 必須繼承自 `zipline.pipeline.CustomFactor`。
*   **核心**: 透過實作 `compute()` 方法來定義因子的計算方式。

---

## 2. CustomFactor 的核心屬性與方法

在定義 `CustomFactor` 時，您需要設定以下核心屬性，並實作 `compute()` 方法：

*   `inputs`:
    *   **(類別屬性)** 一個列表，包含 `BoundColumn` 物件（例如 `EquityPricing.close`），這些是因子計算所需的歷史數據輸入。
    *   範例：`inputs = [EquityPricing.close, EquityPricing.volume]`
*   `window_length`:
    *   **(類別屬性)** 一個整數，定義因子計算所需的歷史數據窗口長度。例如，`window_length = 20` 表示因子會使用過去 20 天的數據進行計算。
*   `compute(self, today, assets, out, *arrays)`:
    *   **(方法)** 這是您必須覆寫的核心方法，用於實現自定義因子的計算邏輯。它在每個交易日都會被呼叫。
    *   `self`: `CustomFactor` 實例本身。
    *   `today`: (`pd.Timestamp`) 當前正在計算因子的日期。
    *   `assets`: (`np.array`) 一維 NumPy 數組，包含當前 Pipeline Universe 中的資產 SID。
    *   `out`: (`np.array`) 一維 NumPy 數組，您必須將計算出的因子值寫入此數組中。它的長度與 `assets` 相同。
    *   `*arrays`: 變長參數，每個參數對應於 `inputs` 列表中的一個歷史數據輸入。每個 `array` 都是一個 2D NumPy 數組，形狀為 `(window_length, len(assets))`，包含過去 `window_length` 天的數據。
*   `dtype`:
    *   **(類別屬性)** 定義因子的輸出數據類型，例如 `np.float64`。
*   `missing_value`:
    *   **(類別屬性)** 當數據缺失時用於填充的預設值。

---

## 3. 如何創建 CustomFactor

以下將以一個簡單的 `StdDev` (標準差) 因子為例，演示如何繼承 `CustomFactor` 並實作 `compute` 方法來計算過去 `N` 天收盤價的滾動標準差。

```python
import numpy as np
from zipline.pipeline import CustomFactor
from zipline.pipeline.data import EquityPricing

class StdDev(CustomFactor):
    """
    計算過去 N 天收盤價的滾動標準差。
    """
    # 因子計算所需的輸入數據 (這裡只需要收盤價)
    inputs = [EquityPricing.close]
    
    # 因子計算所需的歷史數據窗口長度 (將在初始化時傳入)
    window_length = 0 # 這裡設為0，因為實際會在實例化時設定

    # 因子輸出的數據類型
    dtype = np.float64

    # 當數據缺失時的填充值
    missing_value = 0.0

    def compute(self, today, assets, out, close_prices):
        """
        核心的因子計算邏輯。
        """
        # close_prices 是一個 (window_length, len(assets)) 的 NumPy 數組
        # 計算每個資產在指定窗口長度內的標準差
        out[:] = np.nanstd(close_prices, axis=0) # axis=0 對時間維度求標準差
```

---

## 4. 在 Pipeline 中使用 CustomFactor

創建 `CustomFactor` 後，您就可以像使用任何內建因子一樣，將其應用到您的 Pipeline 中。

#### 範例
```python
from zipline.pipeline import Pipeline
# from zipline.pipeline.factors import SimpleMovingAverage # 也可以同時使用內建因子

def make_my_pipeline():
    # 實例化 CustomFactor，並設定其 window_length
    my_std_dev = StdDev(window_length=20) # 計算 20 日滾動標準差

    return Pipeline(
        columns={
            'StdDev_20D': my_std_dev,
            'Close_Price': EquityPricing.close.latest # 也可以獲取最新收盤價
        }
    )
```

---

## 5. 完整範例

以下是一個完整的範例，演示如何定義一個 `CustomFactor` 並在 Zipline 回測中使用它。

```python
import pandas as pd
import numpy as np
from zipline import run_algorithm
from zipline.api import (
    attach_pipeline,
    pipeline_output,
    set_benchmark,
    symbol,
    order_target_percent
)
from zipline.pipeline import Pipeline, CustomFactor
from zipline.pipeline.data import EquityPricing
from zipline.pipeline.filters import AverageDollarVolume

# 1. 定義 CustomFactor: 計算 N 日滾動標準差
class CustomStdDev(CustomFactor):
    inputs = [EquityPricing.close]
    window_length = 0 # 將在實例化時覆蓋
    dtype = np.float64
    missing_value = 0.0

    def compute(self, today, assets, out, close_prices):
        out[:] = np.nanstd(close_prices, axis=0)

# 2. 定義 Pipeline
def make_my_pipeline():
    # 實例化自定義因子，計算 20 日滾動標準差
    my_std_dev_20d = CustomStdDev(window_length=20)
    
    # 篩選器：過去 10 天平均日成交金額前 20 檔股票
    high_volume_filter = AverageDollarVolume(window_length=10).top(20)

    return Pipeline(
        columns={
            'Custom_StdDev_20D': my_std_dev_20d,
            'Close_Price': EquityPricing.close.latest
        },
        screen=high_volume_filter # 透過 screen 篩選 Universe
    )

# 3. Zipline 回測設置
def initialize(context):
    set_benchmark(symbol('IR0001'))
    attach_pipeline(make_my_pipeline(), 'my_strategy_pipeline') 

def before_trading_start(context, data):
    pipeline_results = pipeline_output('my_strategy_pipeline')
    context.my_universe = pipeline_results.index.get_level_values(1).tolist()
    context.pipeline_data = pipeline_results

def handle_data(context, data):
    if not context.my_universe:
        return

    for asset in context.my_universe:
        if data.can_trade(asset) and asset in context.pipeline_data.index.get_level_values(1):
            std_dev_value = context.pipeline_data.loc[(data.current_dt.date(), asset), 'Custom_StdDev_20D']
            current_price = data.current(asset, 'price')

            # 簡單策略：如果股價波動較大（例如，高於其 20 日標準差的 X 倍），則進行操作
            # 這裡僅作示例，實際策略會更複雜
            if current_price > 100 and std_dev_value > 5: # 假設股價大於100且波動大於5
                if asset not in context.portfolio.positions:
                    order_target_percent(asset, 1.0 / len(context.my_universe))
            elif current_price < 90 and asset in context.portfolio.positions:
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
