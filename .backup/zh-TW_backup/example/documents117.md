# TrueRange 函數介紹

`TrueRange()` 是 Zipline 提供的波動度計算因子，用來衡量資產的 **真實波動幅度（True Range）**，反映市場價格的劇烈程度。

其計算方式如下：  
從以下三個值中擇其最大者：
1. 今日最高價 − 今日最低價  
2. |今日最高價 − 昨日收盤價|  
3. |今日最低價 − 昨日收盤價|  

值越大表示波動性越強。

## 函數語法

- `inputs`：用於計算的價量欄位，預設為 `[EquityPricing.high, EquityPricing.low, EquityPricing.close]`。  
- `window_length`：觀察期間，**目前僅支援 `window_length = 2`**。

```python
TrueRange(
    inputs=[TWEquityPricing.high, TWEquityPricing.low, TWEquityPricing.close],
    window_length=2,
    mask=StaticSids([0])
)
```

範例

> 以下範例建立一個 Pipeline，計算每支股票的真實波動幅度

```python
from zipline.pipeline.factors import TrueRange
from zipline.pipeline.filters import StaticSids

def make_pipeline():
    return Pipeline(
        columns={
            "TrueRange": TrueRange(
                inputs=[TWEquityPricing.high, TWEquityPricing.low, TWEquityPricing.close],
                window_length=2,
                mask=StaticSids([0])
            )
        },
        screen=StaticSids([0])
    )

run_pipeline(make_pipeline(), start_time, end_time)

```