# PercentChange 函數介紹

`PercentChange()` 是 Zipline 提供的變化率計算因子，用來計算某變數在指定時間窗格內的 **百分比變化率**。

其計算公式如下：

$$
\frac{new - old}{|old|}
$$

此函數可用於觀察報酬變動幅度或其他欄位的相對變化。

## 函數語法

- `inputs`：欲觀察變動的資料欄位（例如 `EquityPricing.close`）。  
- `window_length`：計算百分比變化的觀察期間（n 日），需大於等於 2。

```python
PercentChange(
    inputs=[TWEquityPricing.close],
    window_length=2
)
```

範例

> 以下範例建立一個 Pipeline，計算每檔股票近 2 日的價格百分比變化

```python
from zipline.pipeline.factors import PercentChange

def make_pipeline():
    return Pipeline(
        columns={
            "PercentChange": PercentChange(
                inputs=[TWEquityPricing.close],
                window_length=2
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)

```