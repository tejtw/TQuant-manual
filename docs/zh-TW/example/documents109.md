# RSI 函數介紹

`RSI()` 是 Zipline 提供的動能技術指標，用來計算資產在指定期間內的 **相對強弱指標（Relative Strength Index, RSI）**。

RSI 常用於辨別價格是否處於超買或超賣區間，是技術分析中常見的震盪指標之一。

## 函數語法

- `inputs`：計算 RSI 所需的價格資料欄位，預設為 `EquityPricing.close`。  
- `window_length`：計算 RSI 的觀察期間（n 日），預設為 15。

```python
RSI(
    inputs=[TWEquityPricing.close],
    window_length=87
)
```
範例

> 以下範例建立一個 Pipeline，計算每檔股票過去 87 天的 RSI 數值

```python
from zipline.pipeline.factors import RSI

def make_pipeline():
    return Pipeline(
        columns={
            "RSI": RSI(
                inputs=[TWEquityPricing.close],
                window_length=87
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)

```