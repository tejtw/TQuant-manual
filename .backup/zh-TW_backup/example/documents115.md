# Aroon 函數介紹

`Aroon()` 是 Zipline 提供的技術指標，用來衡量資產價格距離近期期高/低點的時間，輸出一組介於 0 到 100 的數值 `(up, down)`。

其計算方式如下：

- `up` = 從最近的最高價位置除以 `(window_length - 1)`，再乘上 100  
- `down` = 從最近的最低價位置除以 `(window_length - 1)`，再乘上 100  

其中：
- `100` 表示在期間最後一天出現最高/最低點  
- `0` 表示在期間第一天出現最高/最低點  

## 函數語法

- `inputs`：價格欄位，預設為 `[EquityPricing.high, EquityPricing.low]`。  
- `window_length`：觀察期間（n 日）。  

```python
Aroon(
    inputs=[TWEquityPricing.high, TWEquityPricing.low],
    window_length=10,
    mask=StaticSids([0])
)
```

範例

> 以下範例建立一個 Pipeline，分別計算每支股票的 Aroon up 和 Aroon down 指標
```python
from zipline.pipeline.factors import Aroon
from zipline.pipeline.filters import StaticSids

def make_pipeline():
    aroon = Aroon(
        inputs=[TWEquityPricing.high, TWEquityPricing.low],
        window_length=10,
        mask=StaticSids([0])
    )

    return Pipeline(
        columns={
            "up": aroon.up,
            "down": aroon.down
        },
        screen=StaticSids([0])
    )

run_pipeline(make_pipeline(), start_time, end_time)
```