# Zipline 資產物件 (Asset)

!!! info
    本頁詳細說明 Zipline 中的資產物件 (`Asset`)，包括如何獲取不同類型的資產物件（如股票、期貨）及其常用屬性，並提供完整的範例。

在 Zipline 回測框架中，資產物件 (`Asset`) 是對股票、期貨、債券等可交易金融工具的抽象表示。每個資產都有其獨特的屬性，並且在回測引擎中作為策略邏輯的基礎。理解如何獲取資產物件及其屬性，是編寫 Zipline 策略的關鍵一步。

---

## 1. 資產物件簡介

`Asset` 物件是 Zipline 用來識別和操作市場中金融工具的方式。當您在 `handle_data()` 中引用 `data.current(asset, 'price')` 或 `order(asset, amount)` 時，`asset` 參數指的就是一個 `Asset` 物件。

Zipline 支援不同類型的資產：
*   `Equity`: 表示股票。
*   `Future`: 表示期貨合約。

---

## 2. 獲取資產物件

您可以透過多種 Zipline API 函數來獲取資產物件。

### 2.1. zipline.api.symbol()：透過股票代碼獲取

這是最常用的方法，用於根據資產的市場代碼（Ticker Symbol）獲取股票 (`Equity`) 資產物件。

```python
from zipline.api import symbol

def initialize(context):
    # 獲取台積電 (2330) 的股票資產物件
    context.tsmc = symbol('2330')
    # 獲取台泥 (1101) 的股票資產物件
    context.taiwan_cement = symbol('1101')
```

### 2.2. zipline.api.sid()：透過 Zipline ID (SID) 獲取

`sid()` 函數允許您透過 Zipline 內部為每個資產分配的唯一識別符 (SID) 來獲取資產物件。

!!! note
    在 TQuant Lab 的範例中，`sid()` 函數較少被直接用於獲取資產。通常更傾向於使用 `symbol()` 或 `asset_finder.lookup_symbol()`。

### 2.3. 期貨資產：continuous_future() 和 future_symbol()

對於期貨交易，Zipline 提供了專門的函數來處理期貨合約的複雜性，例如合約滾動。

#### continuous_future(root_symbol, offset, roll, adjustment)

`continuous_future()` 函數用於創建一個「 **連續期貨** 」合約的資產物件。它會根據預設的滾動規則，自動將當前的期貨合約連結起來，形成一個理論上的連續合約序列。

*   **`root_symbol`**: 期貨的根代碼，例如 `'TX'` (台指期)、`'MTX'` (小型台指期)。
*   **`offset`**: 與最近月份合約的偏移量。`0` 代表最近月份合約。
*   **`roll`**: 滾動規則，例如 `'calendar'` (按日曆滾動)、`'volume'` (按成交量滾動)。
*   **`adjustment`**: 調整方式，例如 `'add'` (加權調整)、`'mul'` (乘數調整)。

```python
from zipline.api import continuous_future

def initialize(context):
    # 獲取台指期近月連續合約資產物件
    context.txf = continuous_future(
        root_symbol='TX', 
        offset=0, 
        roll='calendar', 
        adjustment='add'
    )
```

#### future_symbol(root_symbol, offset)

`future_symbol()` 函數用於獲取特定月份期貨合約的代碼字串。它通常用於輔助查詢或在不需要連續合約物件時使用。

```python
from zipline.api import future_symbol

def initialize(context):
    # 獲取台指期近月合約的代碼字串
    context.tx_near_month_str = future_symbol('TX', offset=0)
    print(f"近月台指期代碼字串: {context.tx_near_month_str}") # 可能輸出 'TXF202309'
```

---

## 3. Asset 物件的常用屬性

獲取 `Asset` 物件後，您可以訪問其多個屬性來取得相關資訊。

*   `asset.symbol`: (str) 資產的市場代碼（例如 '2330', 'TXF'）。
*   `asset.asset_name`: (str) 資產的名稱（例如 '台積電', '台指期貨'）。
*   `asset.exchange`: (str) 資產在哪個交易所交易（例如 'TWSE', 'TAIFEX'）。
*   `asset.start_date`: (`pd.Timestamp`) 資產開始交易的日期。
*   `asset.end_date`: (`pd.Timestamp`) 資產最後交易的日期（對於期貨可能代表到期日）。
*   `asset.sid`: (int) Zipline 內部為資產分配的唯一識別符。

#### 範例
```python
def handle_data(context, data):
    equity_asset = symbol('2330')
    future_asset = continuous_future(root_symbol='TX', offset=0, roll='calendar', adjustment='add')

    print(f"股票代碼: {equity_asset.symbol}")
    print(f"股票名稱: {equity_asset.asset_name}, 交易所: {equity_asset.exchange}")
    print(f"Zipline ID: {equity_asset.sid}")

    print(f"\n期貨根代碼: {future_asset.root_symbol}") # 期貨資產特有屬性
    print(f"期貨交易市場: {future_asset.exchange}")
    # ... 其他屬性 ...
```

---

## 4. 完整範例

```python
import pandas as pd
from zipline import run_algorithm
from zipline.api import symbol, sid, continuous_future, future_symbol, set_benchmark

def initialize(context):
    # 獲取股票資產
    context.tsmc = symbol('2330')
    context.umc = symbol('2303')

    # 獲取期貨資產
    context.tx_future = continuous_future(root_symbol='TX', offset=0, roll='calendar', adjustment='add')
    context.mtx_future = continuous_future(root_symbol='MTX', offset=0, roll='calendar', adjustment='add')

    set_benchmark(symbol('IR0001'))

def handle_data(context, data):
    # 獲取股票資產屬性
    print(f"日期: {data.current_dt.date()}")
    print(f"台積電 ({context.tsmc.symbol}) 名稱: {context.tsmc.asset_name}, 交易所: {context.tsmc.exchange}")
    
    # 獲取期貨資產屬性
    print(f"台指期貨 ({context.tx_future.root_symbol}) 交易所: {context.tx_future.exchange}")
    
    # 範例: 使用 future_symbol 查詢
    current_tx_symbol_str = future_symbol('TX', offset=0)
    print(f"當前台指期近月合約代碼字串: {current_tx_symbol_str}")
    
    # 僅運行一次，避免重複輸出
    if not context.ran_once:
        context.ran_once = True
        
def analyze(context, results):
    print("回測分析完成。\n")

# 運行回測 (使用虛擬 initialize/handle_data/analyze)
results = run_algorithm(
    start=pd.Timestamp('2022-01-01', tz='UTC'),
    end=pd.Timestamp('2022-01-05', tz='UTC'), # 短期回測，僅為演示
    initialize=initialize,
    handle_data=lambda context, data: (
        print(f"執行 handle_data，日期: {data.current_dt.date()}"),
        handle_data(context, data) if not hasattr(context, 'ran_once') else None,
        setattr(context, 'ran_once', True) # 標記為已執行一次
    ),
    analyze=analyze,
    capital_base=1_000_000,
    bundle='tquant'
)