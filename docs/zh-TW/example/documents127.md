# percentile_between 函數介紹

將數值大小介於指定百分位數（含）之間的資料標為 True，其餘標為 False。

> **Parameters:**
> - **min_percentile** _(float)_  
>   下限，介於 [0.0, 100.0]。
> - **max_percentile** _(float)_  
>   上限，介於 [0.0, 100.0]。
> - **mask** _(zipline.pipeline.Filter, optional)_  
>   若指定，僅針對 mask = True 的項目進行排名；預設為 None。

## 範例

篩選出日報酬率中，位於前 20%（即 80 至 100 百分位）的股票：
```python
def make_pipeline():
    daily_r = DailyReturns(inputs=[TWEquityPricing.close])
    top_r = daily_r.percentile_between(
                min_percentile=80,
                max_percentile=100,
                mask=StaticAssets(assets_ex_IR0001)
            )
    return Pipeline(
        columns={
            'Daily Return': daily_r,
            'top_r': top_r
        }
    )

# 執行 pipeline 並檢視結果，應有 4 檔 (20% * 20 檔) 股票被標為 True
run_pipeline(make_pipeline(), start, end)
