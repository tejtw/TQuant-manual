
# All 函數介紹

在 n 日內，若一資產每日皆符合條件值，該資產為 True。

> **Parameters:**
> - **inputs** _(zipline.pipeline.data.Dataset.BoundColumn 或 boolean)_  
>   資產價量資訊與條件值。
> - **window_length** _(int)_  
>   決定 n 日的長度。 

```python
from zipline.pipeline.filters import All
from zipline.pipeline import Pipeline
from zipline.TQresearch.tej_pipeline import run_pipeline
from zipline.pipeline.data import TWEquityPricing
import pandas as pd

def make_pipeline():
    return Pipeline(
        columns = {
            "ALL": All(
                inputs=[TWEquityPricing.close.latest > 40],  # 條件：前一日收盤價 > 40 則 True
                window_length=1
            )
        }
    )

# 假設 start 與 end 已定義，例如：
# start = pd.Timestamp("2018-02-06", tz='utc')
# end = pd.Timestamp("2022-02-06", tz='utc')

run_pipeline(make_pipeline(), start, end)

# Pipeline built-in filters (內建Filters)

本文介紹常用的內建 Filters。

## Menu

- [All](#All): 在 n 日內，若一資產每日皆符合條件值，該資產為 True。
- [Any](#Any): 在 n 日內，若一資產任一日符合條件值，該資產為 True。
- [AtLeastN](#AtLeastN): 在 m 日內，若一資產至少有 n 日符合條件值，該資產為 True。
- [AllPresent](#AllPresent): 在 n 日內，若每日皆有指定資料，該資產為 True。
- [StaticAssets](#StaticAssets): 指定特定資產為 True。
- [StaticSids](#StaticSids): 指定特定資產為 True。
  - sids (int, iterable)
- [SingleAsset](#SingleAsset): 指定特定資產為 True。 
  - assets (zipline.assets.Asset, iterable) 
- [top/bottom](#top/bottom): 將最大 / 最小的 N 項標為 True，其餘為 False。
- [percentile_between](#percentile_between): 將數值大小介於兩個百分位數（含）之間的資料標為 True，其餘為 False。
- [if_else](#if_else): 在 if_else 函數前會先給定一個條件，若符合條件則回傳 if_true 的值，不符合條件則回傳 if_false 的值。