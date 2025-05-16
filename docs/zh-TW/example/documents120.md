# Any 函數介紹

在 n 日內，若一資產任一日符合條件值，該資產為 True。

> **Parameters:**
> - **inputs** _(zipline.pipeline.data.Dataset.BoundColumn 或 boolean)_  
>   資產價量資訊與條件值。
> - **window_length** _(int)_  
>   決定 n 日的長度。

```python
from zipline.pipeline.filters import Any
from zipline.pipeline import Pipeline

def make_pipeline():
    return Pipeline(
        columns = {
            "Any": Any(
                inputs=[TWEquityPricing.close.latest > 40],
                window_length=10
            )
        }
    )

run_pipeline(make_pipeline(), start, end)
```