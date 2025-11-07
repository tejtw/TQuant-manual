# 自訂因子 (CustomFactor)

!!! info
    本頁深入介紹 Zipline Pipeline 中的 `CustomFactor`，說明如何透過繼承此類別來創建自訂的因子，以滿足特定的量化策略需求。內容涵蓋 `CustomFactor` 的核心概念、參數、`compute` 方法的實現細節，並提供實用的程式碼範例。

在 Zipline Pipeline 中，**因子 (Factors)** 是用於從原始數據中提取數值訊號的核心組件。雖然 Pipeline 提供了許多 [內建因子](../../reference/pipeline/built-ins.md)，但在實際的量化研究中，您可能需要創建獨特的、符合您策略邏輯的自訂因子。`CustomFactor` 類別正是為此目的而設計的，它允許您完全控制因子的計算邏輯。

---

## 1. `CustomFactor` 核心概念

`CustomFactor` 是一個抽象基類，您需要繼承它並實現其 `compute` 方法來定義您的自訂因子。它的運作方式與內建因子類似，都是接收輸入數據 (`inputs`) 和時間窗口 (`window_length`)，然後在每個交易日計算出一個數值輸出。

**主要特點**：

*   **高度靈活性**：您可以利用 `NumPy`、`Pandas` 等 Python 函式庫，在 `compute` 方法中實現任意複雜的數學運算或邏輯判斷。
*   **避免向前看偏誤**：`CustomFactor` 的設計確保了在計算當前日的因子值時，只會使用到該時間點之前（或當前時間點的開盤前）的歷史數據，有效避免了向前看偏誤 (Look-ahead Bias)。
*   **高效的向量化運算**：儘管您編寫的是 Python 程式碼，但 Pipeline 的底層優化會盡可能地將 `compute` 方法中的 `NumPy` 運算向量化，從而保持高效的執行性能。

---

## 2. `CustomFactor` 參數

在定義 `CustomFactor` 時，您可以設定以下關鍵參數：

*   `inputs` (iterable, optional)
    *   **說明**：指定因子計算所需的原始數據來源。這通常是一個 `BoundColumn` 物件的列表，例如 `[TWEquityPricing.close]`。
    *   **範例**：如果您需要收盤價和開盤價來計算因子，則 `inputs=[TWEquityPricing.close, TWEquityPricing.open]`。

*   `window_length` (int, optional)
    *   **說明**：定義因子計算所需的時間窗口長度。例如，如果需要計算 10 日移動平均，則 `window_length=10`。
    *   **重要**：`window_length` 決定了 `compute` 方法中 `inputs` 參數所接收到的歷史數據量。

*   `mask` (zipline.pipeline.Filter, optional)
    *   **說明**：一個可選的 `Filter` 物件，用於限制哪些資產需要計算此因子。只有通過 `mask` 篩選的資產才會被納入計算。
    *   **範例**：`mask=MarketCap().top(100)` 表示只對市值排名前 100 的股票計算此因子。

*   `outputs` (iterable[str], optional)
    *   **說明**：定義因子輸出的欄位名稱。通常情況下，一個 `CustomFactor` 只輸出一個值，因此此參數不常顯式設定。如果需要輸出多個值，則需要指定多個名稱。

---

## 3. `compute` 方法詳解

`compute` 方法是 `CustomFactor` 的核心，您必須在此方法中實現因子的計算邏輯。它的簽名如下：

```python
def compute(self, today, assets, out, *inputs):
    # 您的因子計算邏輯
    pass
```

*   `self`：`CustomFactor` 實例本身。
*   `today` (pandas.Timestamp)
    *   **說明**：當前 Pipeline 執行計算的日期。這是一個 `pandas.Timestamp` 物件，帶有時區資訊。
*   `assets` (numpy.ndarray)
    *   **說明**：一個長度為 N 的 NumPy 陣列，包含了當前需要計算因子的資產的 `sid` (Zipline 內部資產 ID)。
*   `out` (numpy.ndarray)
    *   **說明**：一個長度為 N 的 NumPy 陣列，您需要將計算出的因子結果寫入此陣列中。`out` 陣列的每個元素對應 `assets` 陣列中的一個資產。
*   `*inputs` (numpy.ndarray)
    *   **說明**：這是一個可變參數，其數量和順序與您在 `CustomFactor` 的 `inputs` 參數中定義的數據來源一致。每個 `input` 都是一個 `MxN` 的 NumPy 陣列，其中 `M` 是 `window_length`，`N` 是資產數量。它包含了每個資產在過去 `window_length` 天的歷史數據。

**`compute` 方法的執行流程**：

1.  Zipline 引擎在每個交易日調用 `compute` 方法。
2.  它會根據您定義的 `inputs` 和 `window_length`，準備好對應的歷史數據，並作為 `*inputs` 傳遞給 `compute`。
3.  您在 `compute` 方法中執行計算，並將結果寫入 `out` 陣列。
4.  Zipline 引擎會收集所有資產的 `out` 陣列結果，並將其整合到 Pipeline 的最終輸出 DataFrame 中。

---

## 4. 建立自訂因子範例

以下透過幾個範例，展示如何建立不同類型的 `CustomFactor`。

### 範例 1：計算滾動標準差

此範例計算每檔股票每天的滾動標準差 (Standard Deviation)，用於衡量價格波動性。

```python
from zipline.pipeline import CustomFactor, Pipeline
from zipline.pipeline.data import TWEquityPricing
import numpy as np
import pandas as pd

class StdDev(CustomFactor):
    # 定義因子計算所需的輸入數據和時間窗口
    inputs = [TWEquityPricing.close]
    window_length = 7 # 計算 7 日滾動標準差

    def compute(self, today, assets, out, values):
        # values 是一個 (window_length x 資產數量) 的 NumPy 陣列
        # np.nanstd 會沿著時間軸 (axis=0) 計算每個資產的標準差
        out[:] = np.nanstd(values, axis=0)

def make_pipeline_std_dev():
    return Pipeline(
        columns={
            'std_dev': StdDev()
        }
    )

# 假設您已 ingest 資料並設定好環境
# from zipline.TQresearch.tej_pipeline import run_pipeline
# result = run_pipeline(make_pipeline_std_dev(), pd.Timestamp('2013-01-03', tz='UTC'), pd.Timestamp('2023-01-03', tz='UTC'))
# print(result.head())
```

### 範例 2：計算開收盤價差的 10 日平均

此範例展示如何使用多個輸入數據來計算因子，並預設 `inputs` 和 `window_length`。

```python
from zipline.pipeline import CustomFactor, Pipeline
from zipline.pipeline.data import TWEquityPricing
import numpy as np
import pandas as pd

class TenDayMeanDifference(CustomFactor):
    # 預設輸入為收盤價和開盤價
    inputs = [TWEquityPricing.close, TWEquityPricing.open]
    window_length = 10 # 預設計算 10 日平均

    def compute(self, today, assets, out, c_price, o_price):
        # c_price 和 o_price 分別是收盤價和開盤價的歷史數據陣列
        # 計算每日價差的 10 日平均
        out[:] = np.nanmean(c_price - o_price, axis=0)

def make_pipeline_mean_diff():
    # 直接使用預設參數
    close_open_diff = TenDayMeanDifference()
    return Pipeline(
        columns={
            'close_open_diff': close_open_diff
        }
    )

# 假設您已 ingest 資料並設定好環境
# from zipline.TQresearch.tej_pipeline import run_pipeline
# result = run_pipeline(make_pipeline_mean_diff(), pd.Timestamp('2013-01-03', tz='UTC'), pd.Timestamp('2023-01-03', tz='UTC'))
# print(result.head())
```

**覆蓋預設參數**：

您可以在 `make_pipeline` 函數中為 `CustomFactor` 實例化時，覆蓋其預設的 `inputs` 或 `window_length` 參數。這提供了更大的靈活性。

```python
# 覆蓋 TenDayMeanDifference 的 inputs，改為使用最高價和最低價
def make_pipeline_overridden_mean_diff():
    close_open_diff = TenDayMeanDifference(inputs=[TWEquityPricing.high, TWEquityPricing.low])
    return Pipeline(
        columns={
            'close_open_diff': close_open_diff
        }
    )

# 假設您已 ingest 資料並設定好環境
# from zipline.TQresearch.tej_pipeline import run_pipeline
# result = run_pipeline(make_pipeline_overridden_mean_diff(), pd.Timestamp('2013-01-03', tz='UTC'), pd.Timestamp('2023-01-03', tz='UTC'))
# print(result.head())
```

### 範例 3：理解 `window_length` 的計算

`window_length` 參數定義了因子計算所需的歷史數據窗口。重要的是要理解，這個窗口是從**當前交易日的前一個交易日**開始向前計算的，以避免向前看偏誤。

```python
from zipline.pipeline import CustomFactor, Pipeline
from zipline.pipeline.data import TWEquityPricing
import numpy as np
import pandas as pd

class TenDaysLowest(CustomFactor):
    inputs=[TWEquityPricing.close]
    window_length=10 # 計算前 10 日最低收盤價

    def compute(self, today, assets, out, close_prices):
        # close_prices 包含從 (today - 10 個交易日) 到 (today - 1 個交易日) 的數據
        out[:] = np.nanmin(close_prices, axis=0)

def make_pipeline_lowest():
    return Pipeline(
        columns={
            'TenDaysLowest': TenDaysLowest()
        }
    )

# 假設您已 ingest 資料並設定好環境
# from zipline.TQresearch.tej_pipeline import run_pipeline
# results = run_pipeline(make_pipeline_lowest(), pd.Timestamp('2013-03-18', tz='UTC'), pd.Timestamp('2023-01-03', tz='UTC'))        
# print(results.head())
```

---

## 總結

`CustomFactor` 是 Zipline Pipeline 中一個極其強大的功能，它賦予了量化研究者無限的靈活性來創建和測試自訂的交易因子。透過深入理解其參數和 `compute` 方法的運作機制，您可以將任何複雜的數據處理邏輯轉化為高效的 Pipeline 因子，從而提升策略的深度和廣度。