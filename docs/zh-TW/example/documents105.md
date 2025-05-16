# RollingPearson 函數介紹

`RollingPearson()` 是 Zipline 提供的因子函數，用來計算兩個變數或因子之間的 **滾動皮爾森相關係數（Rolling Pearson Correlation）**。

此函數可觀察變數間的動態關聯程度，是量化策略中常用來偵測關係穩定性的工具。

## 函數語法

- `base_factor`：欲計算相關係數的主要因子。  
- `target`：與 `base_factor` 配對計算相關係數的另一變數或因子。  
- `correlation_length`：觀察期間（n 日），如欲觀察與前一日之相關，則設為 2。  
- `mask`：可選的條件濾網，用來排除特定證券。

```python
RollingPearson(
    base_factor=base_factor,
    target=target,
    correlation_length=10
)
```
範例

> 以下範例建立一個 Pipeline，計算每日報酬與近 6 日報酬之間的 10 日滾動相關係數
```python
from zipline.pipeline.factors import RollingPearson
from zipline.pipeline.factors import DailyReturns
from zipline.pipeline.factors import Returns

def make_pipeline():
    base_factor = DailyReturns(inputs=[TWEquityPricing.close])
    target = Returns(inputs=[TWEquityPricing.close], window_length=6)
    return Pipeline(
        columns={
            "RollingPearson": RollingPearson(
                base_factor=base_factor,
                target=target,
                correlation_length=10
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)
```
