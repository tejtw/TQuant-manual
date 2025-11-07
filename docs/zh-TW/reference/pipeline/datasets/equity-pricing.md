# EquityPricing 資料集

!!! info
    本頁詳細介紹 `TWEquityPricing` 資料集，它是 TQuant Lab Pipeline 中用於獲取台灣股票市場歷史價量數據的核心資料集。內容涵蓋其可用欄位、在 Pipeline 中的使用方法，以及常見的應用範例。

`TWEquityPricing` 是 Zipline Pipeline 中最基礎也最常用的資料集之一。它封裝了台灣股票市場每日的開盤價、最高價、最低價、收盤價和成交量，為絕大多數技術分析因子的計算提供了必要的數據基礎。

---

## 1. `TWEquityPricing` 核心概念

`TWEquityPricing` 代表了 TQuant Lab 資料庫中所有股票的歷史價量數據。當您在 Pipeline 中引用此資料集時，Zipline 引擎會自動處理數據的載入和對齊，確保您的因子計算能夠高效且準確地進行。

**主要特點**：

*   **標準化欄位**：提供了標準化的價量欄位名稱 (`open`, `high`, `low`, `close`, `volume`)，方便使用者記憶和使用。
*   **自動數據對齊**：Pipeline 會自動處理不同股票的交易日期和數據長度，您無需手動對齊時間序列。
*   **高效能存取**：數據以優化的 bcolz 格式儲存，確保在回測過程中能夠快速讀取。

---

## 2. 可用欄位

`TWEquityPricing` 資料集包含以下五個核心欄位，您可以直接在 Pipeline 中訪問它們：

*   `open`
    *   **類型**：`float`
    *   **說明**：當日的開盤價。

*   `high`
    *   **類型**：`float`
    *   **說明**：當日的最高價。

*   `low`
    *   **類型**：`float`
    *   **說明**：當日的最低價。

*   `close`
    *   **類型**：`float`
    *   **說明**：當日的收盤價。

*   `volume`
    *   **類型**：`integer`
    *   **說明**：當日的成交量 (單位：股)。

---

## 3. 在 Pipeline 中的使用方法

在 Pipeline 中使用 `TWEquityPricing` 非常簡單。您只需從 `zipline.pipeline.data` 模組導入它，然後就可以像訪問物件屬性一樣訪問其欄位。

### 範例 1：獲取最新收盤價

在 Pipeline 中，您通常會使用 `.latest` 屬性來獲取每個欄位的最新值。這代表了 Pipeline 在當前計算日可用的最新數據（通常是前一交易日的數據）。

```python
from zipline.pipeline import Pipeline
from zipline.pipeline.data import TWEquityPricing

def make_my_pipeline():
    # 獲取最新的收盤價
    latest_close = TWEquityPricing.close.latest
    
    return Pipeline(
        columns={
            'close_price': latest_close
        }
    )
```

### 範例 2：作為因子的輸入

`TWEquityPricing` 的欄位是大多數內建因子和自訂因子的主要數據來源。

```python
from zipline.pipeline import Pipeline
from zipline.pipeline.data import TWEquityPricing
from zipline.pipeline.factors import SimpleMovingAverage, FastStochasticOscillator

def make_my_pipeline():
    # 將收盤價作為 SimpleMovingAverage 的輸入
    mean_close_20 = SimpleMovingAverage(inputs=[TWEquityPricing.close], window_length=20)
    
    # 將收盤價、最低價、最高價作為 FastStochasticOscillator 的輸入
    k_value = FastStochasticOscillator(
        inputs=[TWEquityPricing.close, TWEquityPricing.low, TWEquityPricing.high],
        window_length=10
    )
    
    return Pipeline(
        columns={
            'mean_close_20': mean_close_20,
            'k_value': k_value
        }
    )
```

### 範例 3：在自訂因子中使用

在創建 [自訂因子](../../reference/pipeline/custom-factor.md) 時，`TWEquityPricing` 的欄位也是最常用的 `inputs` 之一。

```python
from zipline.pipeline import CustomFactor
from zipline.pipeline.data import TWEquityPricing
import numpy as np

class HighLowSpread(CustomFactor):
    # 定義輸入為最高價和最低價
    inputs = [TWEquityPricing.high, TWEquityPricing.low]
    window_length = 1 # 只需要當日的數據

    def compute(self, today, assets, out, high_prices, low_prices):
        # high_prices 和 low_prices 都是 (1 x N) 的 NumPy 陣列
        # 計算當日最高價與最低價的價差
        out[:] = high_prices[0] - low_prices[0]
```

---

## 總結

`TWEquityPricing` 是 TQuant Lab Pipeline 中不可或缺的基礎資料集。無論是計算技術指標、篩選股票，還是創建複雜的自訂因子，都離不開它所提供的價量數據。熟練掌握 `TWEquityPricing` 的使用，是進行量化策略研究的第一步。
