# LinearWeightedMovingAverage 函數介紹

`LinearWeightedMovingAverage()` 是 Zipline 提供的移動平均方法之一，用來計算 **線性加權移動平均（LWMA）**。

此方法會對較近的價格給予較大的權重，計算公式如下：

$$
\text{LWMA} = \frac{\sum_{i=1}^{n} i \times x_{i}}{\sum_{i=1}^{n} i}
$$

與簡單移動平均不同，LWMA 更重視近期的價格變化。

## 函數語法

- `inputs`：欲計算的資料欄位（例如 `EquityPricing.close`）。  
- `window_length`：加權期間的長度（n 日）。

```python
LinearWeightedMovingAverage(
    inputs=[TWEquityPricing.close],
    window_length=10
)
```
範例
```python
from zipline.pipeline.factors import LinearWeightedMovingAverage

def make_pipeline():
    return Pipeline(
        columns={
            "LWMA": LinearWeightedMovingAverage(
                inputs=[TWEquityPricing.close], 
                window_length=10
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)
```
