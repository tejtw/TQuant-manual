# set_do_not_order_list 函數介紹

## zipline.api.set_do_not_order_list(restricted_list, on_error='fail')
預先設定一個不希望交易到的股票清單

- **restricted_list** (*container[Asset], SecurityList*):
  - 指定不可交易的股票清單。
  - 此容器內的元素必須為 `Asset` 物件（例如：`Equity(0 [1101])`，可用 `symbol("1101")` 轉換）。
- **on_error** (*str, optional*):
  - 可選 `'fail'` 與 `'log'`。前者在違反限制時直接中止程式並顯示錯誤訊息；後者則只記錄錯誤但繼續執行。
  - 預設為 `'fail'`。
  - 若設定為 `'log'`，請先設定 log（詳見下方程式碼）：
    ```python
    from logbook import Logger, StderrHandler, INFO
    # 設定 log 顯示方式
    log_handler = StderrHandler(
        format_string='[{record.time:%Y-%m-%d %H:%M:%S.%f}]: {record.level_name}: {record.func_name}: {record.message}',
        level=INFO
    )
    log_handler.push_application()
    log = Logger('Algorithm')
    ```
    
## 範例

在下列範例中，我們將 1101 加入限制清單，並用 `on_error='log'`，然後於 7/26 嘗試下單買入 1101：

```python
def initialize(context):
    context.i = 0
    set_do_not_order_list(restricted_list=[symbol('1101')], on_error='log')
    set_slippage(slippage.FixedSlippage(spread=0.0))
    set_commission(commission.PerDollar(cost=commission_cost))
    set_benchmark(symbol('IR0001'))
    
def handle_data(context, data):
    if context.i == 0:  # 2018-07-24
        order(symbol('2330'), 100)
        
    if context.i == 2:  # 2018-07-26
        order(symbol('1101'), 100)
        
    if context.i == 4:  # 2018-07-30
        order(symbol('1216'), 100)
        
    context.i += 1

commission_cost = 0.001425
capital_base = 1e6

performance = run_algorithm(
    start=start_dt,
    end=end_dt,
    initialize=initialize,
    handle_data=handle_data,
    capital_base=capital_base,
    trading_calendar=get_calendar(calendar_name),
    bundle=bundle_name
)

positions, transactions, orders = get_transaction_detail(performance)
```
# Zipline Trading Controls 交易限制函數

## 在 Zipline 中可以加入六種不同的交易限制：

交易限制功能可以確保演算法如您所預期的的方式執行，並有助於避免預期外交易所帶來的不良後果。

- [set_do_not_order_list](#set_do_not_order_lis)：預先設定一個不希望交易到的股票清單。
- [set_long_only](#set_long_only)：預先設定投資組合不能持有任何短部位（short positions）。
- [set_max_leverage](#set_max_leverage)：設定投資組合的槓桿限制。
- [set_max_order_count](#set_max_order_count)：限制一天內能夠下幾張 order。
- [set_max_order_size](#set_max_order_size)：限制特定股票（或全部）的單次下單股數及金額。
- [set_max_position_size](#set_max_position_size)：限制特定股票（或全部）在帳上的股數及市值。

## 閱讀本篇之前請先閱讀以下文章：

- [TSMC buy and hold strategy.ipynb](#)
- [Zipline Order (order & order_target).ipynb](#)
- [Zipline Order（value & target_value）](#)
- [Zipline Order（percent & target_percent）](#)
- [Zipline Slippage](#)

### 補充說明：

- 交易限制系列函數通常在initialize階段使用。
- 可以一次加入多個交易限制。
- 因為交易限制函數皆是 zipline api 方法，需先from zipline.api import <欲使用的方法> 或 from zipline.api import *。

## 設定環境

```python
import pandas as pd
import numpy as np
import datetime
import tejapi
import time
import os
import warnings
warnings.filterwarnings('ignore')

# tej_key
tej_key ='your key'
tejapi.ApiConfig.api_key = tej_key
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"
os.environ['TEJAPI_KEY'] = tej_key

# date
start='2018-07-24'
end='2018-08-24'
os.environ['mdate'] = '20180724 20180824'

tz = 'UTC'
start_dt, end_dt = pd.Timestamp(start, tz = tz), pd.Timestamp(end, tz = tz)

# calendar
calendar_name='TEJ'

# bundle_name
bundle_name = 'tquant'

os.environ['ticker'] = "2330 1216 1101 IR0001 2317 5844 2454 2357"
!zipline ingest -b tquant
```
```python
from zipline.api import *
from zipline import run_algorithm
from zipline.finance import commission, slippage
from zipline.utils.calendar_utils import get_calendar

from zipline.utils.run_algo import  get_transaction_detail

from logbook import Logger, StderrHandler, INFO

# 設定log顯示方式
log_handler = StderrHandler(format_string='[{record.time:%Y-%m-%d %H:%M:%S.%f}]: ' +
                            '{record.level_name}: {record.func_name}: {record.message}',
                            level=INFO)
log_handler.push_application()
log = Logger('Algorithm')
```
