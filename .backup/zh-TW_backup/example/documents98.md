# SimpleMovingAverage 函數介紹

`SimpleMovingAverage()` 是 Zipline 提供的技術分析工具，用來計算某資產在過去 n 天的 **簡單移動平均值（SMA）**，常用來觀察價格的趨勢。

> SMA = 過去 n 天的收盤價總和 ÷ n

## 函數語法

- `inputs`：欲計算的資料欄位（例如 `EquityPricing.close`）。  
- `window_length`：移動平均的期間（n 日）。

```python
SimpleMovingAverage(
    inputs=[TWEquityPricing.close],
    window_length=10
)
```

```python

from zipline.pipeline.factors import SimpleMovingAverage

def make_pipeline():
    return Pipeline(
        columns={
            "SMA": SimpleMovingAverage(
                inputs=[TWEquityPricing.close], 
                window_length=10
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)
```