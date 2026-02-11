# Zipline 回測中的 context 物件

!!! info
    本頁深入介紹 Zipline 回測中的 `context` 物件，包括其核心作用、主要內建屬性、自定義屬性以及完整範例，幫助使用者理解如何儲存和傳遞策略狀態資訊。

在 Zipline 的事件驅動回測框架中，`context` 物件是策略的核心。它在整個回測過程中持續存在，並在 `initialize()`、`before_trading_start()`、`handle_data()` 和 `analyze()` 等生命週期函數之間傳遞策略的狀態資訊。透過 `context`，您可以存取投資組合的當前狀態、記錄交易資訊，以及儲存任何自定義的策略變數。

---

## 1. context 簡介

`context` 就像一個專屬於您策略的儲物櫃，它：
*   **持久性**: 一旦在 `initialize()` 中設定，`context` 的內容就會在整個回測期間保持不變，除非您明確修改它。
*   **可變性**: 您可以在回測的任何階段讀取或修改 `context` 的屬性。
*   **全局性**: 它是策略中所有生命週期函數共享的唯一狀態容器。

---

## 2. context 的主要內建屬性

`context` 物件內置了幾個重要的屬性，提供了關於投資組合和回測環境的實時資訊。

### 2.1. context.portfolio：投資組合狀態

`context.portfolio` 是一個非常重要的屬性，它提供了當前投資組合的詳細情況。

*   `context.portfolio.cash`: 當前可用的現金餘額。
*   `context.portfolio.positions`: 一個字典型物件，鍵為資產物件，值為 `Position` 物件，包含了您目前持有的所有資產及其詳細資訊（例如持股數量 `amount`）。
    *   `context.portfolio.positions[asset].amount`: 獲取特定資產的持股數量。
    *   `context.portfolio.positions.keys()`: 獲取一個列表，包含所有目前持有的資產物件。
*   `context.portfolio.portfolio_value`: 投資組合的當前總市值（現金 + 持股價值）。
*   `context.portfolio.positions_value`: 所有持股的當前總市值。

#### 範例
```python
def handle_data(context, data):
    # 檢查是否有足夠的現金來下單
    if context.portfolio.cash > 10000:
        # ... 執行買入操作 ...
        pass
    
    # 遍歷所有持有的部位
    for asset, position in context.portfolio.positions.items():
        print(f"持有 {asset.symbol} 股數: {position.amount}, 當前市值: {position.last_sale_price * position.amount}")
    
    # 打印投資組合總價值
    print(f"投資組合總價值: {context.portfolio.portfolio_value}")
```

### 2.2. context.blotter：交易記錄器

`context.blotter` 物件提供了對交易歷史和未完成訂單的訪問介面。儘管在一般的策略範例中不常用，但對於需要精細控制訂單狀態或分析歷史交易的進階策略非常有用。

*   `context.blotter.open_orders`: 獲取一個字典，包含所有尚未完全成交的訂單。

### 2.3. context.asset_finder：資產查找器

`context.asset_finder` 是一個用於根據符號 (symbol)、SID (Zipline ID) 或其他屬性查找資產物件的工具。在大多數情況下，您可以使用 `zipline.api.symbol()` 或 `asset_finder.lookup_symbol()` 來獲取資產物件。

---

## 3. 自定義屬性 (Custom Attributes)

您可以在 `initialize()` 函數中為 `context` 物件添加任意自定義屬性，以便在回測的後續階段（如 `handle_data()`）中存儲和檢索策略的內部狀態或額外數據。

#### 範例
```python
def initialize(context):
    context.my_flag = False          # 儲存布林值
    context.counter = 0              # 儲存整數計數器
    context.stock_list = []          # 儲存股票列表
    context.my_data_dict = {}        # 儲存字典

def handle_data(context, data):
    if not context.my_flag:
        print("這是第一次進入 handle_data！")
        context.my_flag = True # 修改自定義屬性
    
    context.counter += 1
    if context.counter % 10 == 0:
        print(f"已運行 {context.counter} 次 handle_data。")
```

---

## 4. 完整範例

以下是一個完整的範例，演示如何在 `initialize()` 中設定 `context`，並在 `handle_data()` 中使用其內建和自定義屬性。

```python
import pandas as pd
from zipline import run_algorithm
from zipline.api import symbol, order_target_percent, record, set_benchmark

def initialize(context):
    context.my_asset = symbol('2330') # 設定一個要交易的資產
    context.has_ordered = False       # 自定義旗標，追蹤是否已下單
    context.trade_count = 0           # 自定義計數器
    set_benchmark(symbol('IR0001'))   # 設定 Benchmark

def handle_data(context, data):
    # 檢查是否已下單
    if not context.has_ordered:
        # 使用 context.portfolio.cash 檢查是否有足夠現金
        if context.portfolio.cash > data.current(context.my_asset, 'price') * 100: # 假設買100股
            order_target_percent(context.my_asset, 1.0) # 全倉買入
            context.has_ordered = True
            context.trade_count += 1
            print(f"買入 {context.my_asset.symbol}，現金餘額: {context.portfolio.cash}")
    
    # 在每隔一段時間後打印持倉信息
    context.trade_count += 1
    if context.trade_count % 50 == 0:
        if context.my_asset in context.portfolio.positions:
            pos = context.portfolio.positions[context.my_asset]
            print(f"日期: {data.current_dt.date()} 持有 {pos.asset.symbol} 股數: {pos.amount}")
        print(f"投資組合總價值: {context.portfolio.portfolio_value}")

def analyze(context, results):
    # 此處可以利用 context 進行分析，例如打印最終的 trade_count
    print(f"總交易次數: {context.trade_count}")
    print(f"最終投資組合價值: {results.iloc[-1]['portfolio_value']}")

# 執行回測
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
