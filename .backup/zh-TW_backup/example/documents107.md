# RollingSpearmanOfReturns 函數介紹

`RollingSpearmanOfReturns()` 是 Zipline 提供的統計因子之一，用來計算特定資產與其他資產在指定期間內的 **斯匹爾曼等級相關係數（Spearman Rank Correlation）**。

與皮爾森相關不同，斯匹爾曼相關衡量的是變數排序的單調關係，對於非線性但仍具趨勢的資料更為敏感。

## 函數語法

- `target`：指定為基準的資產（例如 `symbol("IR0001")`）。  
- `returns_length`：用來計算報酬的期間（n 日），若為日報酬則設為 2。  
- `correlation_length`：觀察期間（n 日）以進行相關計算。  
- `mask`：可選的濾網，用來排除特定資產。

```python
RollingSpearmanOfReturns(
    target=symbol("IR0001"),
    returns_length=2,
    correlation_length=14
)
```

範例

> 以下範例建立一個 Pipeline，計算所有資產與 IR0001 之間的 14 日斯匹爾曼報酬相關係數
```python
from zipline.pipeline.factors import RollingSpearmanOfReturns
from zipline.pipeline.filters import StaticAssets
from zipline import run_algorithm
from zipline.api import symbol, attach_pipeline, pipeline_output

def make_pipeline():
    regressor = RollingSpearmanOfReturns(
        target=symbol("IR0001"),
        returns_length=2,
        correlation_length=14
    )
    return Pipeline(
        columns={
            "RollingSpearmanOfReturns": regressor
        },
        screen=~StaticAssets([symbol("IR0001")])
    )


# 以下為回測時的使用
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