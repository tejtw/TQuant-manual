# top/bottom 函數介紹

將最大/最小的 N 項標為 True，其餘為 False。

> **Parameters:**
> - **N** _(int)_  
>   要標記的數量。
> - **mask** _(zipline.pipeline.Filter, optional)_  
>   若指定，僅對 mask 為 True 的項目進行排名；預設為 None。
> - **groupby** _(zipline.pipeline.Classifier, optional)_  
>   若指定，則每個分類內取最大／最小的 N 項；必須為 `Classifier`。

[Go to Menu](#menu)

## 範例 – top

在以下範例中： 
- 先利用 30 日簡單移動平均線 (SMA) 將股票分成四個等級（quartiles）。
- 接著利用 SimpleBeta 篩選出 beta 最高的 2 檔股票，但先以 AverageDollarVolume 篩出日均成交額超過 5 億的股票，
- 並透過 groupby 對每個 SMA 等級內分別選出 top 2 股票。

```python
assets_ex_IR0001 = [i for i in assets if i != bundle.asset_finder.lookup_symbol('IR0001', as_of_date=None)]

def make_pipeline():
    # 計算 30 日簡單移動平均
    sma = SimpleMovingAverage(inputs=[TWEquityPricing.close], window_length=30)
    # 將 SMA 依 quartiles 分為 4 級
    sma_quartiles = sma.quartiles(mask=StaticAssets(assets_ex_IR0001))
    
    # 計算 beta (以 IR0001 為基準)
    sbeta = SimpleBeta(
        target=bundle.asset_finder.lookup_symbol('IR0001', as_of_date=None),
        regression_length=300,
        allowed_missing_percentage=0.25
    )
    
    # 平均成交額
    adv = AverageDollarVolume(window_length=10)
    top_dollar = adv > 500000000
    # 對每個 SMA quartile 內選出 beta 最高的 2 檔股票
    top_beta = sbeta.top(N=2, mask=top_dollar & StaticAssets(assets_ex_IR0001), groupby=sma_quartiles)
    
    return Pipeline(
        columns={
            'SMA': sma,
            'SMA Quartile': sma_quartiles,
            'Average Dollar Volume': adv,
            'Simple Beta': sbeta,
            'top_beta': top_beta
        }
    )

# 執行 pipeline，結果中 top_beta 為 True 的即為各等級內 beta 最高的 2 檔
result = run_pipeline(make_pipeline(), end, end)
result.sort_values(by=['SMA Quartile', 'Simple Beta'], ascending=[False, False])
