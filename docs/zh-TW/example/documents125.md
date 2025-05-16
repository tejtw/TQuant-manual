# SingleAsset 函數介紹

指定單一特定資產為 True，其餘為 False。

> **Parameters:**
> - **asset** _(zipline.assets.Asset)_  
>   指定的單一資產。

```python
from zipline.pipeline.filters import SingleAsset
from zipline.pipeline import Pipeline
from zipline.api import symbol, attach_pipeline, pipeline_output
import pandas as pd

def make_pipeline():
    return Pipeline(
        columns = {
            "SingleAsset": SingleAsset(
                asset = assets[4]  # 假設 assets[4] 為指定資產
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
