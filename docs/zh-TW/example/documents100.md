# ExponentialWeightedMovingAverage 函數介紹

`ExponentialWeightedMovingAverage()` 是 Zipline 提供的移動平均方法之一，用來計算 **指數加權移動平均（EWMA）**。

此方法會給予越接近現在的觀測值越高的權重，其計算公式如下：

$$
\text{EWMA} = \frac{\sum_{i=1}^{n} {decay}^i \times x_{i}}{\sum_{i=1}^{n} {decay}^i}
$$

EWMA 相對於簡單與線性加權平均更能即時反映價格變化。

## 函數語法

- `inputs`：欲計算的資料欄位（例如 `EquityPricing.close`）。  
- `window_length`：觀察期間（n 日）。  
- `decay_rate`：指數衰退率（例如 0.1）。

```python
ExponentialWeightedMovingAverage(
    inputs=[TWEquityPricing.close],
    window_length=10,
    decay_rate=0.1
)
```
範例
```python
from zipline.pipeline.factors import ExponentialWeightedMovingAverage

def make_pipeline():
    return Pipeline(
        columns={
            "EWMA": ExponentialWeightedMovingAverage(
                inputs=[TWEquityPricing.close],
                window_length=10,
                decay_rate=0.1
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)
```