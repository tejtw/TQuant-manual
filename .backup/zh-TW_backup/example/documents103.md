# MaxDrawdown 函數介紹

`MaxDrawdown()` 是 Zipline 提供的一個風險評估因子，用來計算在指定期間內的 **最大回撤（Maximum Drawdown）**。

最大回撤反映資產價格從高點下跌到低點的最大幅度，常用於衡量潛在損失風險。

## 函數語法

- `inputs`：計算回撤所需的價格資料欄位（例如 `EquityPricing.close`）。  
- `window_length`：觀察期間（n 日）。

```python
MaxDrawdown(
    inputs=[TWEquityPricing.close],
    window_length=1
)
```
範例

> 以下範例建立一個 Pipeline，計算每檔股票在最近 1 天的最大回撤
```python
from zipline.pipeline.factors import MaxDrawdown

def make_pipeline():
    return Pipeline(
        columns={
            "MaxDrawdown": MaxDrawdown(
                inputs=[TWEquityPricing.close],
                window_length=1
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)

```