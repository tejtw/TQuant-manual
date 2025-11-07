# AllPresent 函數介紹

在 n 日內，若每日皆有指定資料，該資產為 True。

> **Parameters:**
> - **inputs** _(zipline.pipeline.data.Dataset.BoundColumn 或 boolean)_  
>   資產價量資訊。
> - **window_length** _(int)_  
>   決定 n 日的長度。

```python
from zipline.pipeline.filters import AllPresent
from zipline.pipeline import Pipeline

def make_pipeline():
    return Pipeline(
        columns = {
            "AllPresent": AllPresent(
                inputs=[TWEquityPricing.close], 
                window_length=10
            )
        }
    )

# 例如查詢特定日期的資料：
run_pipeline(make_pipeline(), start, end).loc["2018-05-04"]
# 注意：若某資產未於 n 日內每日皆有資料，則其結果為 False。
```