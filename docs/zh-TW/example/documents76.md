# Custom_TW_Commission 函數介紹
`zipline.finance.commission.Custom_TW_Commission(min_trade_cost=20, discount=1.0, tax = 0.003)`: 台灣專用的手續費模型
* 僅適用於 equities。
* 台灣股票適用的手續費模型，考量券商手續費（費率：0.001425）及證交稅，同時還可以設定一個最低費用。
* 台灣交易股票時的情況的情況：在台灣交易股票時，主要有兩個直接成本：手續費及證交稅。
    * 手續費
        * 買進或賣出時皆須繳交。
        * 計算方式為：成交價 × 成交股數 × 0.1425 % × 折扣（折扣預設是 1，沒有折扣）。
        * 手續費有最低價格（預設是 20 元）。
    * 證交稅
        * 賣出時才要繳交。
        * 計算方式為：成交價 × 成交股數 × 證交稅率（證交稅率預設是 0.3%）。

## 函數語法：
* `min_trade_cost`－最低費用。預設為 20 元。
* `discount`－券商手續費折扣比率。預設為 1，代表沒有折扣。
* `tax`－證交稅率，預設為 0.003。
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

* 滑價模型設定為：`slippage.FixedSlippage(spread=0.00)`。其中，spread 設定為 0，這樣會比較好觀察結果，因為滑價會導致成交價格改變。若有滑價則會使用考慮滑價後的價格計算手續費。
```python
def initialize_Custom(context):
    context.i = 0
    context.tickers = ['1216']
    context.asset = [symbol(ticker) for ticker in context.tickers]      
    set_slippage(slippage.FixedSlippage(spread=0.00))
    
    # set_commission
    set_commission(equities=commission.Custom_TW_Commission(min_trade_cost=20,
                                                            discount = 1.0,
                                                            tax = 0.003))
    
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

Custom = run_algorithm(start=start_dt,
                       end=end_dt,
                       initialize=initialize_Custom,
                       handle_data=handle_data,
                       capital_base=capital_base,
                       trading_calendar=get_calendar(calendar_name),
                       bundle=bundle_name)
```
* 查看12/1-12/5的收盤價
```python
# 收盤價
closing_price[0:3]
```
![alt text](image-2.png)

* 在 12/1 下單一張統一（1216）股票，用 `Custom_TW_Commission ` 算法，手續費 0.1425 % 且並無折扣。
```python
# 買進：65 * 1000 股 * 0.001425 = 93
Custom['orders'][1]
```
[{'id': 'a05f2ae2969c42bc809b112195eb3dbb',  
  'dt': Timestamp('2022-12-02 13:30:00+0800', tz='Asia/Taipei'),  
  'reason': None,  
  'created': Timestamp('2022-12-01 13:30:00+0800', tz='Asia/Taipei'),  
  'amount': 1000,  
  'filled': 1000,  
  'commission': 93,  
  'stop': None,  
  'limit': None,  
  'stop_reached': False,  
  'limit_reached': False,  
  'sid': Equity(0 [1216]),  
  'status': <ORDER_STATUS.FILLED: 1>}]  
* 用12/5 的收盤價下單賣出一張統一（1216）股票並於12/6 成交，手續費 0.1425 % 且並無折扣，證交稅0.3%。
```python
# 賣出：64.6 * 1000 股 * 0.001425 + 64.6 * 1000 股 * 0.003 = 93 + 194 = 287
Custom['orders'][3]
```
[{'id': '5b0c6088e7a74a43b40d95ab4b7be5d4',  
  'dt': Timestamp('2022-12-06 13:30:00+0800', tz='Asia/Taipei'),  
  'reason': None,  
  'created': Timestamp('2022-12-05 13:30:00+0800', tz='Asia/Taipei'),  
  'amount': -1000,  
  'filled': -1000,  
  'commission': 287,  
  'stop': None,  
  'limit': None,  
  'stop_reached': False,  
  'limit_reached': False,  
  'sid': Equity(0 [1216]),  
  'status': <ORDER_STATUS.FILLED: 1>}]  