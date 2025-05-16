# FastStochasticOscillator 函數介紹

`FastStochasticOscillator()` 是 Zipline 提供的動能指標之一，計算資產在一段期間內的 **快速隨機指標（K 值）**，其值介於 0 到 100。

此指標可用來判斷超買或超賣狀態：
- K 值高於 80，可能出現超買
- K 值低於 20，可能出現超賣
- D 值常為 K 值的 3 日簡單移動平均（SMA）

其計算公式如下：

$$
\frac{\text{收盤價} - \text{期間最低}}{\text{期間最高} - \text{期間最低}} \times 100
$$

## 函數語法

- `inputs`：用於計算的價量欄位，預設為 `[EquityPricing.close, EquityPricing.low, EquityPricing.high]`。  
- `window_length`：觀察期間（n 日），預設為 14。

```python
FastStochasticOscillator(
    inputs=[TWEquityPricing.close, TWEquityPricing.low, TWEquityPricing.high],
    window_length=10,
    mask=StaticSids([0])
)
```
範例

> 以下範例建立一個 Pipeline，計算每支股票在過去 10 天的 Fast Stochastic Oscillator（K 值）

```python
from zipline.pipeline.factors import FastStochasticOscillator
from zipline.pipeline.filters import StaticSids

def make_pipeline():
    return Pipeline(
        columns={
            "FastStochasticOscillator": FastStochasticOscillator(
                inputs=[TWEquityPricing.close, TWEquityPricing.low, TWEquityPricing.high],
                window_length=10,
                mask=StaticSids([0])
            )
        },
        screen=StaticSids([0])
    )

run_pipeline(make_pipeline(), start_time, end_time)
```
