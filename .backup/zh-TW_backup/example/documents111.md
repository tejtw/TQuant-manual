# WeightedAverageValue 函數介紹

`WeightedAverageValue()` 是 Zipline 提供的一種加權計算因子，用來計算在指定期間內某數值以成交量加權的平均值，邏輯與 VWAP 類似。

與 VWAP 不同的是，此函數可用來對任意欄位（如最高價、最低價等）進行加權平均處理，更具彈性。

## 函數語法

- `inputs`：需要加權的數值欄位與成交量欄位，例如 `[EquityPricing.high, EquityPricing.volume]`。  
- `window_length`：計算加權平均的觀察期間（n 日）。

```python
WeightedAverageValue(
    inputs=[TWEquityPricing.high, TWEquityPricing.volume],
    window_length=10
)
```
範例

> 以下範例建立一個 Pipeline，計算每檔股票過去 10 天內的成交量加權最高價

```python
from zipline.pipeline.factors import WeightedAverageValue

def make_pipeline():
    return Pipeline(
        columns={
            "WeightedAverageValue": WeightedAverageValue(
                inputs=[TWEquityPricing.high, TWEquityPricing.volume],
                window_length=10
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)

```