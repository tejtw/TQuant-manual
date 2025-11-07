# RollingLinearRegressionOfReturns 函數介紹

`RollingLinearRegressionOfReturns()` 是 Zipline 提供的迴歸分析因子，會針對每個資產與指定資產之間進行 **OLS 線性回歸**，回傳對應的 beta、alpha、r 值、p 值與標準誤。

其回歸模型如下所示：

$$
Return_{i,t} = \beta_{i} \times {Certain Return}_{i,t} + \alpha_{i}
$$

可用來觀察資產對基準資產（如市場因子）的反應程度與統計顯著性。

## 函數語法

- `target`：指定為自變數的資產（例如 `symbol("IR0001")`）。  
- `returns_length`：用來計算報酬的期間（如設為 2 則為日報酬）。  
- `regression_length`：用於執行迴歸的時間窗格長度。  
- `mask`：可選的濾網，用來排除特定資產。

```python
RollingLinearRegressionOfReturns(
    target=symbol("IR0001"),
    returns_length=2,
    regression_length=14
)
```
範例

> 以下範例以 IR0001 作為迴歸的自變數，計算每檔股票與其之間的 beta、alpha 等統計量

```python
from zipline.pipeline.factors import RollingLinearRegressionOfReturns
from zipline.pipeline.filters import StaticAssets
from zipline import run_algorithm
from zipline.api import symbol, attach_pipeline, pipeline_output

def make_pipeline():
    regressor = RollingLinearRegressionOfReturns(
        target=symbol("IR0001"),
        returns_length=2,
        regression_length=14
    )
    return Pipeline(
        columns={
            "beta": regressor.beta,
            "alpha": regressor.alpha,
            "r_value": regressor.r_value,
            "p_value": regressor.p_value,
            "stderr": regressor.stderr
        },
        screen=~StaticAssets([symbol("IR0001")])
    )


# 以下為回測時的使用
def initialize(context):
    my_pipe = attach_pipeline(make_pipeline(), 'my_pipe')

def handle_data(context, data):
    pipe = pipeline_output('my_pipe')
    print("=" * 100)
    print(f"Beta: {pipe.beta}")
    print(f"alpha: {pipe.alpha}")
    print(f"r_value: {pipe.r_value}")
    print(f"p_value: {pipe.p_value}")
    print(f"stderr: {pipe.stderr}")

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