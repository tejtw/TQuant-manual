# RateOfChangePercentage 函數介紹

`RateOfChangePercentage()` 是 Zipline 提供的動能因子，用來計算某變數在指定期間內的 **百分比變化率（% ROC）**。

其公式如下：

$$
\frac{\text{尾} - \text{頭}}{\text{頭}} \times 100
$$

可用於衡量資產價格變動的強度與方向。

## 函數語法

- `inputs`：作為計算依據的價量資料（如 `EquityPricing.close`）。  
- `window_length`：變化計算的時間窗格長度（n 日）。

```python
RateOfChangePercentage(
    inputs=[TWEquityPricing.close],
    window_length=10
)
```

範例

> 以下範例建立一個 Pipeline，計算每檔股票在過去 10 天的百分比變化率

```python
from zipline.pipeline.factors import RateOfChangePercentage

def make_pipeline():
    return Pipeline(
        columns={
            "RateOfChangePercentage": RateOfChangePercentage(
                inputs=[TWEquityPricing.close],
                window_length=10
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)
```
