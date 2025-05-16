# StaticAssets 函數介紹

指定特定資產為 True，其它資產為 False。

> **Parameters:**
> - **assets** _(iterable of zipline.assets.Asset)_  
>   指定資產列表。

[Go to Menu](#menu)

```python
from zipline.pipeline.filters import StaticAssets
from zipline.pipeline import Pipeline
from zipline.api import symbol, attach_pipeline, pipeline_output
import pandas as pd

# 此處假設 assets 來自前面 bundle 的資料：
# assets 已經定義，例如：assets = bundle.asset_finder.retrieve_all(sids)

def make_pipeline():
    return Pipeline(
        columns = {
            "StaticAssets": StaticAssets(
                assets = assets[4:8]
            )
        }
    )

def initialize(context):
    attach_pipeline(make_pipeline(), 'my_pipe')

def handle_data(context, data):
    pipe = pipeline_output('my_pipe')
    print("=" * 100)
    print(pipe)

def analyze(context, perf):
    pass

run_pipeline(make_pipeline(), pd.Timestamp("2019-01-02", tz='utc'), pd.Timestamp("2019-01-02", tz='utc'))
