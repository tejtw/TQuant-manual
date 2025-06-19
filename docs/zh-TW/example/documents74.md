# PerTrade : 一筆交易收取一筆固定費用
## `zipline.finance.commission.PerTrade(cost=0.0)`
* 一筆交易收取一筆固定費用。
* 適用於 equities 與 futures。

## Parameters：
* cost (float, optional) : 每進行一筆交易所需支付的固定費用。預設為 0 元。
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

* 模型參數`cost`設定為： 0.5 ，相當於每進行一筆交易需支付 0.5 元。
* 滑價模型設定為：`slippage.FixedSlippage(spread=0.00)`。其中，spread 設定為 0，這樣會比較好觀察結果，因為滑價會導致成交價格改變。若有滑價則會使用考慮滑價後的價格計算手續費。
```python
def initialize_pertrade(context):
    context.i = 0
    context.tickers = ['1216']
    context.asset = [symbol(ticker) for ticker in context.tickers]      
    set_slippage(slippage.FixedSlippage(spread=0.00))
    
    # set_commission
    set_commission(equities=commission.PerTrade(cost=0.5))
    
    set_benchmark(symbol('IR0001'))

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

pertrade = run_algorithm(start=start_dt,
                         end=end_dt,
                         initialize=initialize_pertrade,
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

* 在 12/1 下單一張統一（1216）股票，用 `PerTrade` 算法，費用就是設定好的 0.5 元。
```python
# pertrade算法：費用0.5元
pertrade['orders'][1]
```
[{'id': '61a8b52d81de4e4b98d295823efb2464',  
  'dt': Timestamp('2022-12-02 13:30:00+0800',   tz='Asia/Taipei'),
  'reason': None,  
  'created': Timestamp('2022-12-01 13:30:00+0800', tz='Asia/Taipei'),  
  'amount': 1000,  
  'filled': 1000,  
  'commission': 0.5,  
  'stop': None,  
  'limit': None,  
  'stop_reached': False,  
  'limit_reached': False,  
  'sid': Equity(0 [1216]),  
  'status': <ORDER_STATUS.FILLED: 1>}]  