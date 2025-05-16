# AtLeastN 函數介紹

在 m 日內，若一資產至少有 n 日符合條件值，該資產為 True。

> **Parameters:**
> - **inputs** _(zipline.pipeline.data.Dataset.BoundColumn 或 boolean)_  
>   資產價量資訊與條件值。
> - **window_length** _(int)_  
>   決定 m 日的長度。
> - **N** _(int)_  
>   至少需要符合條件的天數。

```python
from zipline.pipeline.filters import AtLeastN
from zipline.pipeline import Pipeline

def make_pipeline():
    return Pipeline(
        columns = {
            "AtLeastN": AtLeastN(
                inputs=[TWEquityPricing.close.latest > 40],
                window_length=10,
                N=2
            )
        }
    )

run_pipeline(make_pipeline(), start, end)
```