# DailyReturns 函數介紹

`DailyReturns()` 是 Zipline 提供的一個簡單因子，用來計算資產的 **日報酬率**，即：

> 日報酬率 = 當日價格變動 ÷ 前一日價格

此因子常用於衡量資產的短期價格變化。

## 函數語法

- `inputs`：欲使用的價格資料欄位，預設為 `EquityPricing.close`。

```python
DailyReturns(
    inputs=[TWEquityPricing.close]
)
```


```python
from zipline.pipeline.factors import DailyReturns

def make_pipeline():
    return Pipeline(
        columns={
            "Daily Return":
            DailyReturns(
                inputs=[TWEquityPricing.close]
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)
```