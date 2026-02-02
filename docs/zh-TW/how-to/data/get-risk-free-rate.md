# 如何設定無風險利率 (Risk-Free Rate)

!!! info
    本頁提供如何在 Zipline 回測中設定無風險利率的詳細指南，包括 `run_algorithm()` 的參數設定和 `TargetPercentPipeAlgo` 的選項，幫助您精確計算策略績效指標。

在量化分析中，無風險利率 (Risk-Free Rate) 是計算夏普比率 (Sharpe Ratio) 等關鍵績效指標時不可或缺的基準。它代表了在沒有承擔任何風險的情況下，理論上能夠獲得的投資報酬率。

在 TQuant Lab 中，設定無風險利率的方法並非使用 `set_risk_free_rate`，而是根據您的使用場景，透過 `run_algorithm()` 函數或 `TargetPercentPipeAlgo` 類別的參數來指定。

---

## 方法一：在 run_algorithm() 中傳入自定義利率

當您呼叫 `run_algorithm()` 來執行回測時，可以透過 `treasury_returns` 參數傳入一個自定義的無風險利率時間序列。這給了您最高的彈性，您可以使用任何來源的數據作為無風險利率。

*   **參數**: `treasury_returns`
*   **類型**: `pandas.Series`
*   **索引 (Index)**: 日期 (datetimes)
*   **值 (Values)**: 每日的無風險報酬率 (float)

#### 範例：設定一個固定的 2% 年化無風險利率

在以下範例中，我們創建一個與回測期間長度相同的 `pd.Series`，每日利率為 `0.02 / 252` (假設一年有 252 個交易日)。

```python
import pandas as pd
from zipline import run_algorithm

# ... (定義您的 initialize, handle_data, analyze 函數)

start_date = pd.Timestamp('2020-01-01', tz='UTC')
end_date = pd.Timestamp('2023-01-01', tz='UTC')

# 創建一個固定的每日無風險利率序列
date_range = pd.date_range(start=start_date, end=end_date, freq='D', tz='UTC')
fixed_rate_series = pd.Series(data=(0.02 / 252), index=date_range)

# 執行回測時傳入 treasury_returns 參數
results = run_algorithm(
    start=start_date,
    end=end_date,
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    capital_base=1e7,
    bundle='tquant',
    treasury_returns=fixed_rate_series  # <--- 在此傳入
)
```

---

## 方法二：使用 TargetPercentPipeAlgo 的預設選項

`TargetPercentPipeAlgo` 是 TQuant Lab 中一個方便的 Pipeline 演算法類別。在初始化此類別時，您可以透過 `zero_treasury_returns` 參數來控制無風險利率的行為。

*   **參數**: `zero_treasury_returns`
*   **類型**: `bool` (布林值)

#### 用法

*   `zero_treasury_returns=True` (預設值)
    *   這會將整個回測期間的無風險利率 **設定為 0** 。這是最簡單的方式，適用於不考慮無風險利率或希望簡化計算的場景。

*   `zero_treasury_returns=False`
    *   TQuant Lab 會自動透過 TEJ API 取得 **第一銀行的年定存利率** 作為每日的無風險利率。
    *   !!! important
            使用此選項 (`False`) 將會 **消耗您的 TEJ API 流量** 。

#### 範例
```python
from zipline.algo.pipeline_algo import TargetPercentPipeAlgo

# ... (定義您的 create_pipeline 函數)

# 初始化演算法，並設定使用 TEJ API 提供的無風險利率
algo = TargetPercentPipeAlgo(
    create_pipeline=create_pipeline,
    zero_treasury_returns=False  # <--- 在此設定
)

# ... (使用 run_algorithm 執行 algo)
```