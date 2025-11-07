# PerShare : 按照下單的股數計算費用，同時還可以設定一個最低費用
## `zipline.finance.commission.PerShare(cost=0.001, min_trade_cost=0.0)`
* 按照下單的股數計算費用，同時還可以設定一個最低費用。
* 僅適用於 equities。
* 為預設模型。

## Parameters：
* cost (float, optional)－每交易一股的股票所需支付的固定費用。預設為 0.001 元。
* min_trade_cost (float, optional)－最低費用，預設為無最低費用。
## Notes：
手續費計算時，價格以成交日收盤價為準，數量也以成交時為準，也就是說，如果因為股數變動造成 amount 有任何變化，計算上都是用成交時新的 amount。手續費計算時，價格以成交日收盤價為準，數量也以成交時為準，也就是說，如果因為股數變動造成 amount 有任何變化，計算上都是用成交時新的 amount。
## Examples: 
```python
import pandas as pd
import datetime
import tejapi
import os
import warnings
from logbook import Logger, StderrHandler, INFO
warnings.filterwarnings('ignore')

# set log
log_handler = StderrHandler(format_string='[{record.time:%Y-%m-%d %H:%M:%S.%f}]: ' +
                            '{record.level_name}: {record.func_name}: {record.message}',
                            level=INFO)
log_handler.push_application()
log = Logger('CommissionModel')

# tej_key
os.environ['TEJAPI_KEY'] = "your key" 
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"

# date
# set date
start='2022-12-01'
end='2022-12-31'
os.environ['mdate'] = '20221201 20221231'

tz = 'UTC'
start_dt, end_dt = pd.Timestamp(start, tz = tz), pd.Timestamp(end, tz = tz)

# calendar
calendar_name='TEJ'

# bundle_name
bundle_name = 'tquant'

# ticker
os.environ['ticker'] = '1216 IR0001'

# ingest
!zipline ingest -b tquant
```
Merging daily equity files:  
[2023-11-27 03:31:44.753277] INFO: zipline.data.bundles.core: Ingesting tquant.
```python
from zipline.finance import commission, slippage
from zipline.api import *

from zipline import run_algorithm
from zipline.utils.calendar_utils import get_calendar

from zipline.utils.run_algo import (get_transaction_detail,
                                    get_record_vars)
```

* 範例的模型參數`cost`設定 0.001，`min_trade_cost`設定 5.0。
* 滑價模型設定為：`slippage.FixedSlippage(spread=0.00)`。其中，spread 設定為 0，這樣會比較好觀察結果，因為滑價會導致成交價格改變。若有滑價則會使用考慮滑價後的價格計算手續費。
```python
def initialize_pershare(context):
    context.i = 0
    context.tickers = ['1216']
    context.asset = [symbol(ticker) for ticker in context.tickers]      
    set_slippage(slippage.FixedSlippage(spread=0.00))
    
    # set_commission
    set_commission(equities=commission.PerShare(cost=0.001, min_trade_cost=5.0))

def handle_data(context, data):

    if context.i == 0:
        for asset in context.asset:
            order_target(asset, 1000)
    if context.i == 2:
        for asset in context.asset:
            order_target(asset, 0)
            
    record(close=data.current(context.asset, 'close'))
    context.i += 1

capital_base = 1e5
```
```python
closing_price = tejapi.get('TWN/APIPRCD',
                           coid=['1216'],
                           opts={'columns':['mdate','coid','close_d']},
                           mdate={'gte':start_dt,'lte':end_dt },
                           paginate=True)

pershare = run_algorithm(start=start_dt,
                         end=end_dt,
                         initialize=initialize_pershare,
                         handle_data=handle_data,
                         capital_base=capital_base,
                         trading_calendar=get_calendar(calendar_name),
                         bundle=bundle_name)
```
* 查看12/1的收盤價
```python
# 收盤價
closing_price[0:2]
```
![alt text](image-1.png)

* 在 12/1 下單一張統一（1216）股票，用 `PerShare ` 算法，雖然設定一股抽 0.001，但是因為 1000 股 * 0.001 = 1 小於最低費用 min_trade_cost = 5，所以費用是 5。
```python
# pershare算法：費用5元
pershare['orders'][1]
```
[{'id': '4fba6e4d88a34bc6b6072d2155242915',  
  'dt': Timestamp('2022-12-02 13:30:00+0800', tz='Asia/Taipei'),  
  'reason': None,  
  'created': Timestamp('2022-12-01 13:30:00+0800',  tz='Asia/Taipei'),  
  'amount': 1000,  
  'filled': 1000,  
  'commission': 5.0,  
  'stop': None,  
  'limit': None,  
  'stop_reached': False,  
  'limit_reached': False,  
  'sid': Equity(0 [1216]),  
  'status': <ORDER_STATUS.FILLED: 1>}]  