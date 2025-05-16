# Returns 函數介紹

`Returns()` 是 Zipline 提供的一種因子，用來計算資產在指定窗格長度內的 **報酬率**。

與 `DailyReturns()` 不同，此函數可設定多日的報酬計算期間，常用於觀察週期性的累積報酬。

## 函數語法

- `inputs`：計算報酬所需的價格資料欄位（預設為 `EquityPricing.close`）。  
- `window_length`：報酬率的觀察期間（n 日）。

```python
Returns(
    inputs=[TWEquityPricing.close],
    window_length=2
)
```
範例

> 以下範例建立一個 Pipeline，計算每檔股票近 2 天的報酬率
```python
from zipline.pipeline.factors import Returns

def make_pipeline():
    return Pipeline(
        columns={
            "Returns": Returns(
                inputs=[TWEquityPricing.close],
                window_length=2
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)

```