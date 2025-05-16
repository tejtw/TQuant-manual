# VWAP 函數介紹

`VWAP()` 是 Zipline 提供的加權平均價格因子，用來計算在指定期間內的 **成交量加權平均價格（Volume Weighted Average Price）**。

VWAP 對機構投資人而言是一項重要指標，常用來評估交易執行品質或做為進出場依據。

## 函數語法

- `inputs`：計算 VWAP 所需的價格與成交量資料，預設為 `EquityPricing.close` 與 `EquityPricing.volume`。  
- `window_length`：VWAP 的觀察期間（n 日）。

```python
VWAP(
    inputs=[TWEquityPricing.close, TWEquityPricing.volume],
    window_length=87
)
```
範例

以下範例建立一個 Pipeline，計算每檔股票過去 87 天的 VWAP 值

```python
from zipline.pipeline.factors import VWAP

def make_pipeline():
    return Pipeline(
        columns={
            "VWAP": VWAP(
                inputs=[TWEquityPricing.close, TWEquityPricing.volume],
                window_length=87
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)

```