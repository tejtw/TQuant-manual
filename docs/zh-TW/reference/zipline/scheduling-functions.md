# Zipline 排程函數參考

!!! info
    本頁詳細說明 Zipline 排程函數，包括 `schedule_function()` 的用法、日期規則 (`date_rules`) 和時間規則 (`time_rules`) 的設定，幫助使用者精確控制回測任務的執行時機。

在 Zipline 回測中，策略通常需要定期執行某些任務，例如 **每日的再平衡** 、 **每月初的資產篩選** ，或者在特定的時間點執行某些分析。Zipline 提供了強大的排程函數功能，讓您可以精確地控制這些任務的執行時機。

核心的排程函數是 `schedule_function()`，它結合了日期規則 (`date_rules`) 和時間規則 (`time_rules`) 來定義任務的執行頻率。

---

## 1. schedule_function() 函數

`zipline.api.schedule_function()` 用於將一個自定義函數排程到未來的特定時間點執行。它通常在 `initialize()` 函數中呼叫。

```python
from zipline.api import schedule_function
# 亦需導入 date_rules 和 time_rules
from zipline.api import date_rules, time_rules
import datetime
```

#### 主要參數：
*   `func`: (callable) 欲排程執行的函數。此函數必須接受 `context` 和 `data` 作為參數。
*   `date_rule`: (zipline.api.date_rules 物件) 定義函數執行的日期頻率。
*   `time_rule`: (zipline.api.time_rules 物件, 可選) 定義函數在交易日中執行的具體時間點。預設為 `time_rules.market_open()`。
*   `half_days`: (bool, 可選) 若為 `True`，則函數也會在半天交易日執行。預設為 `False`。
*   `calendar_days`: (bool, 可選) 若為 `True`，則函數會在日曆日執行，而不僅限於交易日。預設為 `False`。
*   `exception_rules`: (zipline.api.date_rules 物件, 可選) 指定不執行函數的日期規則。

---

## 2. 日期規則 (date_rules)

`date_rules` 用於定義 `schedule_function()` 的日期觸發條件。

*   **導入**: `from zipline.api import date_rules`

#### 常見日期規則：

*   `date_rules.every_day()`: 每個交易日執行。
    ```python
    schedule_function(my_daily_task, date_rules.every_day())
    ```

*   `date_rules.week_start(days_offset=0)`: 每週的第一個交易日執行。`days_offset` 可用於從第一個交易日偏移，例如 `days_offset=1` 表示每週第二個交易日。
    ```python
    schedule_function(my_weekly_task, date_rules.week_start()) # 每週一執行
    schedule_function(my_weekly_task_offset, date_rules.week_start(days_offset=2)) # 每週三執行 (週一+2天)
    ```

*   `date_rules.month_start(days_offset=0)`: 每月的第一個交易日執行。
    ```python
    schedule_function(my_monthly_task, date_rules.month_start()) # 每月第一個交易日執行
    ```

*   `date_rules.month_end(days_offset=0)`: 每月的最後一個交易日執行。
    ```python
    schedule_function(my_monthly_end_task, date_rules.month_end()) # 每月最後一個交易日執行
    ```

---

## 3. 時間規則 (time_rules)

`time_rules` 用於定義 `schedule_function()` 在符合 `date_rules` 的交易日中，具體在什麼時間點執行。

*   **導入**: `from zipline.api import time_rules`

#### 常見時間規則：

*   `time_rules.market_open(minutes=0)`: 在市場開盤時執行。`minutes` 參數可以指定在開盤後偏移的分鐘數。
    ```python
    schedule_function(my_open_task, date_rules.every_day(), time_rules.market_open()) # 每天開盤執行
    schedule_function(my_open_delay_task, date_rules.every_day(), time_rules.market_open(minutes=30)) # 每天開盤後30分鐘執行
    ```

*   `time_rules.market_close(minutes=0)`: 在市場收盤時執行。`minutes` 參數可以指定在收盤前偏移的分鐘數（負值）或收盤後偏移的分鐘數（正值）。
    ```python
    schedule_function(my_close_task, date_rules.every_day(), time_rules.market_close()) # 每天收盤執行
    schedule_function(my_close_before_task, date_rules.every_day(), time_rules.market_close(minutes=-10)) # 每天收盤前10分鐘執行
    ```

*   `time_rules.before_market_open(minutes=0)`: 在市場開盤前執行。`minutes` 參數指定開盤前多少分鐘。
    ```python
    schedule_function(my_pre_open_task, date_rules.every_day(), time_rules.before_market_open(minutes=10)) # 每天開盤前10分鐘執行
    ```

*   `time_rules.after_market_close(minutes=0)`: 在市場收盤後執行。`minutes` 參數指定收盤後多少分鐘。
    ```python
    schedule_function(my_post_close_task, date_rules.every_day(), time_rules.after_market_close(minutes=10)) # 每天收盤後10分鐘執行
    ```

*   `time_rules.at_time(dt_time)`: 在交易日中的特定時間執行。`dt_time` 應為 `datetime.time` 物件。
    ```python
    schedule_function(my_fixed_time_task, date_rules.every_day(), time_rules.at_time(datetime.time(10, 0))) # 每天早上10點執行
    ```

---

## 4. 完整範例

以下是一個完整的程式碼範例，演示如何在 `initialize()` 函數中設定多個排程任務。

```python
import pandas as pd
from zipline import run_algorithm
from zipline.api import (
    symbol,
    order_target_percent,
    record,
    set_benchmark,
    schedule_function,
    date_rules,
    time_rules
)
import datetime

# --- 自定義任務函數 ---
def rebalance_monthly(context, data):
    # 每月執行的再平衡邏輯
    current_price = data.current(context.my_asset, 'price')
    if current_price is not None and not pd.isnull(current_price):
        order_target_percent(context.my_asset, 0.5) # 將一半資金投入
        print(f"[{data.current_dt.date()}] 每月再平衡: 買入 {context.my_asset.symbol}")

def log_daily_data(context, data):
    # 每日執行的數據記錄邏輯
    current_price = data.current(context.my_asset, 'price')
    if current_price is not None and not pd.isnull(current_price):
        record(price=current_price)
        print(f"[{data.current_dt.date()}] 每日記錄: {context.my_asset.symbol} 價格 {current_price}")

def pre_market_check(context, data):
    # 盤前執行的檢查邏輯
    print(f"[{data.current_dt.date()}] 盤前檢查: 市場即將開盤...")


# --- Zipline 回測部分 ---
def initialize(context):
    context.my_asset = symbol('2330')
    set_benchmark(symbol('IR0001'))
    
    # 1. 設定每日收盤前 10 分鐘記錄數據
    schedule_function(
        log_daily_data,
        date_rules.every_day(),
        time_rules.market_close(minutes=-10)
    )

    # 2. 設定每月第一個交易日開盤時進行再平衡
    schedule_function(
        rebalance_monthly,
        date_rules.month_start(),
        time_rules.market_open()
    )

    # 3. 設定每天開盤前 5 分鐘進行盤前檢查
    schedule_function(
        pre_market_check,
        date_rules.every_day(),
        time_rules.before_market_open(minutes=5)
    )
    
def handle_data(context, data):
    pass # 核心交易邏輯可以放在這裡，也可以排程執行

def analyze(context, results):
    # 分析結果
    final_portfolio_value = results.iloc[-1]['portfolio_value']
    print(f"最終投資組合價值: {final_portfolio_value}")

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