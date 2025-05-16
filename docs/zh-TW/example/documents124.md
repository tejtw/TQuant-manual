# StaticSids 函數介紹

指定特定資產（以其 sid）為 True。

> **Parameters:**
> - **sids** _(iterable of int)_  
>   指定資產的 sid 列表。

[Go to Menu](#menu)

```python
from zipline.pipeline.filters import StaticSids
from zipline.pipeline import Pipeline
from zipline.api import symbol, attach_pipeline, pipeline_output
import pandas as pd

def make_pipeline():
    return Pipeline(
        columns = {
            "StaticSids": StaticSids(
                sids = range(4,8)  # 例如：選出 sid 4 至 7 的資產
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

run_pipeline(make_pipeline(), pd.Timestamp("2019-01-01", tz='utc'), pd.Timestamp("2019-01-02", tz='utc'))
