# SimpleBeta 函數介紹

`SimpleBeta()` 是 Zipline 提供的回歸因子，用來計算資產相對於特定資產的 **Beta 值**，用以衡量兩者報酬率的線性敏感度。

此函數等價於 `RollingLinearRegressionOfReturns` 所回傳的 beta 值，但提供更簡化的寫法與用途。

## 函數語法

- `target`：指定為自變數的基準資產（例如 `symbol("IR0001")`）。  
- `regression_length`：觀察報酬與回歸的窗格長度。

```python
SimpleBeta(
    target=symbol("IR0001"),
    regression_length=30
)
```
範例

> 以下範例建立一個 Pipeline，計算所有資產相對於 IR0001 的 30 日 beta 值
```python
from zipline.pipeline.factors import SimpleBeta
from zipline.pipeline.filters import StaticAssets
from zipline import run_algorithm
from zipline.api import symbol, attach_pipeline, pipeline_output

def make_pipeline():
    Beta = SimpleBeta(
        target=symbol("IR0001"),
        regression_length=30
    )
    return Pipeline(
        columns={
            "SimpleBeta": Beta
        },
        screen=~StaticAssets([symbol("IR0001")])
    )

def initialize(context):
    my_pipe = attach_pipeline(make_pipeline(), 'my_pipe')

def handle_data(context, data):
    pipe = pipeline_output('my_pipe')
    print("=" * 100)
    print(pipe)

def analyze(context, perf):
    pass

results = run_algorithm(
    start=start_time,
    end=end_time,
    initialize=initialize,
    capital_base=1e6,
    handle_data=handle_data,
    analyze=analyze,
    bundle='tquant'
)
```