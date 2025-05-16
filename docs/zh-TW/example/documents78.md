# FixedSlippage : 設定固定 spread 的滑價，不能設定成交量限制
## `zipline.finance.slippage.FixedSlippage(spread=0.0)`
* 設定固定 spread 的滑價，不能設定成交量限制。
* 在每筆交易的成交價格額外加入 $\pm \frac{\text{spread}}{2}$，其中 `spread` 為設定的固定滑價值。
* 如果是買入，則成交價格 $=price+\frac{\text{spread}}{2} $ ；若是賣出，則成交價格 $=price-\frac{\text{spread}}{2} $。 $price=$ _當日收盤價_。

## Parameters：
* spread (float, optional) - 用來估計成交價與當日收盤價的價差。

## Note:
* 滑價計算時，價格以成交日收盤價為準，數量也以成交時為準。也就是說，如果因為股數變動造成 amount 有任何變化，計算上都是用成交時新的 amount。
* 如果 `initialize(context):` 裡面沒有設定`set_slippage()`，系統預設使用 `FixedBasisPointsSlippage(basis_points = 5.0, volume_limit = 0.1)`。
* 如果希望完全不考慮交易量及滑價限制，則使用 `set_slippage(slippage.NoSlippage())`。

## Examples: 
## Import settings
```python
import pandas as pd 
import numpy as np
import tejapi
import os

# tej_key
os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'
os.environ['TEJAPI_KEY'] = 'your key'

# set date
os.environ['mdate'] = "20221201 20221231"

# ticker
os.environ['ticker'] = "IR0001 1216 5844"

# ingest
!zipline ingest -b tquant
```

```python
from zipline.finance import commission, slippage
from zipline.api import *

from zipline import run_algorithm  
from zipline.utils.run_algo import  get_transaction_detail
```
## 設置交易策略
```python
start_dt = pd.Timestamp('2022-12-01', tz='UTC')
end_dt = pd.Timestamp('2022-12-31', tz='UTC')

def initialize(context):
    context.i = 0
    context.tickers = ['1216']
    context.asset = [symbol(ticker) for ticker in context.tickers] 
    
    # 設定滑價模型來進行模擬                
    # set_slippage()只接收一個spread參數
    set_slippage(slippage.FixedSlippage(spread = 0.2))
    
    # 這裡在接收commission.PerDollar()回傳結果後輸入參數
    set_commission(commission.PerDollar(cost = commission_cost))
    
    # 設定benchmark
    set_benchmark(symbol('IR0001'))
    
def handle_data(context, data):
    
    if context.i == 0:  # 2022-12-01(回測的第一個交易時間點)下單買 5 張統一（1216）股票
        for asset in context.asset:
            order(asset, 5000)

    if context.i == 7:  # 2022-12-12(回測的第八個交易時間點)賣出 2 張統一（1216）股票
        for asset in context.asset:
            order(asset, -2000)

    context.i += 1

commission_cost = 0.001425 + 0.003 / 2
capital_base = 1e6
```
```python
# 評估結果
closing_price = tejapi.fastget('TWN/APIPRCD',
                               coid=['1216'],
                               opts={'columns':['mdate','coid','close_d','vol']},
                               mdate={'gte':start_dt,'lte':end_dt },
                               paginate=True)

closing_price['vol'] = closing_price['vol'] * 1000

performance = run_algorithm(start=start_dt,
                            end=end_dt,
                            initialize=initialize,
                            handle_data=handle_data,
                            capital_base=capital_base,
                            bundle='tquant')

positions, transactions, orders = get_transaction_detail(performance)
```
## 情況 1: 買入時計算滑價
* 12/1時下單買 5 張統一（1216）股票，12/2成交。
* 收盤價是 65.0，但因為我們設定 spread = 0.2，所以成交價（transactions.price）是 65 + 0.2 / 2 = 65.1，手續費（'commission'）是 65.1 * 5000 * 0.002925 = 952.0875（手續費是預先設定好的，這次用 PerDollar）。
```python
# 收盤價
closing_price.query('(mdate == "2022-12-02")')
```

```python
# 手續費（'commission'）是 952.0875
orders.query('(created.dt.strftime("%Y-%m-%d") == "2022-12-01")')
```

```python
# 成交價（transactions.price）為 65.1
transactions.loc['2022-12-02']
```


## 情況 2: 賣出時計算滑價
* 在12/12賣出 2 張統一（1216）股票，12/13成交。
* 12/13收盤價 65.4，由於是賣單，所以成交價是 65.4 - 0.2 / 2 = 65.3，手續費計算方法一樣。
```python
# 收盤價
closing_price.query('(mdate == "2022-12-13")')
```

```python
# 在12/12賣出兩張統一 (1216) 股票，12/13成交。
orders.query('(created.dt.strftime("%Y-%m-%d") == "2022-12-12")')
```

```python
# 成交價是65.4 - 0.2 / 2 = 65.3
transactions.loc['2022-12-13']
```
