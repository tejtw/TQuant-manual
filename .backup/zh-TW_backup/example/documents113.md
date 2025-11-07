# PeerCount 函數介紹

`PeerCount()` 是 Zipline 提供的分組統計因子，可根據某個 factor 或 classifier，統計 **每一組別中的資產數量**。

常見用途包括依照報酬率、估值或其他分類結果，了解同類型公司分布情況。以下例以報酬率的四分位數為基準。

## 函數語法

- `inputs`：作為分類依據的因子（如報酬率分類）。  
- `window_length`：計算期間（n 日）。

```python
PeerCount(
    inputs=[Ret.quartiles()]
)
```

範例

> 以下範例建立一個 Pipeline，計算每個報酬率四分位中有多少公司落入該分組

```python
from zipline.pipeline.factors import PeerCount, Returns

def make_pipeline():
    Ret = Returns(inputs=[TWEquityPricing.close], window_length=2)
    quarter = Ret.quartiles()

    return Pipeline(
        columns={
            "PeerCount": PeerCount(
                inputs=[quarter]
            )
        }
    )

run_pipeline(make_pipeline(), start_time, end_time)


```