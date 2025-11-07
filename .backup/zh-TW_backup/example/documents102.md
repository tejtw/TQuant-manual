# ExponentialWeightedMovingStdDev 函數介紹

`ExponentialWeightedMovingStdDev()` 是 Zipline 提供的波動度計算因子，用來計算 **指數加權移動標準差（EWMSTD）**。

這種標準差會對較近期的資料給予更高的權重，適用於變動快速的市場條件下進行風險評估。

## 函數語法

- `inputs`：欲計算的資料欄位（例如 `EquityPricing.close`）。  
- `window_length`：觀察期間（n 日）。  
- `decay_rate`：指數衰退率（例如 0.1）。

```python
ExponentialWeightedMovingStdDev(
    inputs=[TWEquityPricing.close],
    window_length=10,
    decay_rate=0.1
)
```
範例

> 以下範例建立一個 Pipeline，計算每檔股票過去 10 天的指數加權移動標準差
```python
from zipline.pipeline.factors import ExponentialWeightedMovingStdDev

def make_pipeline():
    return Pipeline(
        columns={
            "EWMSTD": ExponentialWeightedMovingStdDev(
                inputs=[TWEquityPricing.close],
                window_length=10,
                decay_rate=0.1
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)
```