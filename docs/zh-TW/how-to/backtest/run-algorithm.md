# 如何執行一個基本的回測

!!! info
    本頁提供如何使用 `zipline.run_algorithm()` 函數執行基本策略回測的指南，包括 Zipline 回測函數架構、主要參數說明和完整的範例。

在 TQuant Lab 中，執行策略回測的核心是 `zipline.run_algorithm()` 函數。這個函數整合了數據加載、策略邏輯執行以及績效計算等所有步驟，是您將策略想法轉化為回測結果的主要入口。

---

## 1. Zipline 的回測函數架構

一個標準的 Zipline/TQuant Lab 策略腳本主要由三個函數構成，它們定義了回測的完整生命週期：

1.  `initialize(context)`
    *   **執行時機**：在回測開始時僅執行 **一次**。
    *   **主要用途**：進行所有初始設定。這包括設定 Benchmark、設定手續費/滑價模型、定義要交易的資產，以及初始化您想在整個策略中追蹤的變數。

2.  `handle_data(context, data)`
    *   **執行時機**：在回測的每個時間單位（例如，每日或每分鐘）都會被呼叫。
    *   **主要用途**：這是策略的核心邏輯所在。您會在這個函數中檢查市場數據 (`data`)、判斷交易信號、並下達買賣訂單。`context` 物件則用於在不同時間點之間傳遞狀態。

3.  `analyze(context, results)`
    *   **執行時機**：在回測結束後僅執行 **一次**。
    *   **主要用途**：對回測結果進行分析與視覺化。`results` 參數是一個包含了每日績效指標的 `pandas.DataFrame`，您可以利用它來繪製圖表或計算自定義的統計數據。

---

## 2. run_algorithm() 函數

當您定義好上述三個函數後，就可以將它們傳遞給 `run_algorithm()` 來啟動回測。

#### 主要參數：
*   `start`: (`pd.Timestamp`) 回測的起始日期。
*   `end`: (`pd.Timestamp`) 回測的結束日期。
*   `initialize`: (函數) 上述的 `initialize` 函數。
*   `handle_data`: (函數) 上述的 `handle_data` 函數。
*   `analyze`: (函數, 可選) 上述的 `analyze` 函數。
*   `capital_base`: (`float`) 初始資金。
*   `bundle`: (`str`) 要使用的資料包名稱，例如 `'tquant'`。

---

## 3. 基本回測範例：買入並持有

以下是一個完整的「買入並持有台積電 (2330)」策略，它演示了如何組織並執行一個基本的回測。

!!! tip
    在執行此範例前，請確保您已經使用 `zipline ingest -b tquant` 匯入了價量資料，並且資料範圍涵蓋了回測期間。詳見：[匯入價量資料指南](../data/ingest-spot-pricing.md)

```python
import pandas as pd
from zipline import run_algorithm
from zipline.api import (
    set_benchmark,
    symbol,
    order_target_percent,
    record
)
import matplotlib.pyplot as plt

# 1. 初始化函數
def initialize(context):
    """
    回測開始前僅執行一次。
    """
    # 設定要交易的股票
    context.asset = symbol('2330')
    
    # 設定 Benchmark
    set_benchmark(symbol('IR0001'))
    
    # 用於判斷是否已下單的旗標
    context.has_ordered = False

# 2. 核心交易邏輯函數
def handle_data(context, data):
    """
    每個交易日都會被呼叫。
    """
    # 如果尚未下單，則下單一次
    if not context.has_ordered:
        # 將 100% 的資金買入 context.asset (2330)
        order_target_percent(context.asset, 1.0)
        
        # 將旗標設為 True，確保之後不再重複下單
        context.has_ordered = True
    
    # 記錄每日的股價，方便後續繪圖
    record(price=data.current(context.asset, 'price'))

# 3. 回測結束後的分析函數
def analyze(context, results):
    """
    回測結束後執行一次。
    """
    fig, axes = plt.subplots(2, 1, figsize=(12, 10), sharex=True)
    
    # 繪製投資組合價值
    results['portfolio_value'].plot(ax=axes[0])
    axes[0].set_title('Portfolio Value')
    
    # 繪製股價
    results['price'].plot(ax=axes[1])
    axes[1].set_title(f'{context.asset.symbol} Price')
    
    plt.tight_layout()
    plt.show()

# 4. 執行回測
results = run_algorithm(
    start=pd.Timestamp('2022-01-01', tz='UTC'),
    end=pd.Timestamp('2023-01-01', tz='UTC'),
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    capital_base=1_000_000,
    bundle='tquant'
)
```
