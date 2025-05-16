# FixedBasisPointsSlippage : 設定固定基點的滑價，並可設定成交量限制
## `zipline.finance.slippage.FixedBasisPointsSlippage(basis_points=5.0, volume_limit=0.1)`
* 為 zipline 預設模型，設定固定基點的滑價，其計算方法為（買入的話，符號為+；賣出的話，符號為-）:  
  
<center>

$price \times [1 \pm \text{basis\_point} \times 0.0001]$ 
</center>

* 設定當日交易量限制：
<center>

$\text{historical\_volume} \times \text{volume\_limit}$ 
</center>

$\text{historical\_volume}=$ 當日成交價。

## Parameters：
* volume_limit (float, optional) -
    * 買賣量佔總交易量的最高百分比，預設 = 0.1。
    * 此限制考慮如果買賣大量股票，會對股價造成過大影響，導致偏離歷史的價格，若利用當天收盤價進行模擬交易就會高估獲利。
* basis_point (float, optional) - 設置滑價基點，基點越大，滑價程度越大，預設 = 5.0。

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
### 設置交易策略
```python
start_dt = pd.Timestamp('2022-12-01', tz='UTC')
end_dt = pd.Timestamp('2022-12-31', tz='UTC')

def initialize(context):
    context.i = 0
    context.tickers = ['1216']
    context.asset = [symbol(ticker) for ticker in context.tickers]  
    
#     set_slippage
    set_slippage(slippage.FixedBasisPointsSlippage(basis_points=5.0, volume_limit=0.025))
    
    set_commission(commission.PerDollar(cost = commission_cost))
    set_benchmark(symbol('IR0001'))
    
def handle_data(context, data):
    
    if context.i == 0: # 2022-12-01
        for asset in context.asset:
            order(asset, 1500000)       
    
    if context.i == 10: # 2022-12-15
        for asset in context.asset:
            order(asset, -200000)    

    context.i += 1

capital_base = 1e8
commission_cost = 0.001425 + 0.003 / 2

```
```python
closing_price = tejapi.fastget('TWN/APIPRCD',
                               coid=['1216'],
                               opts={'columns':['mdate','coid','close_d','vol']},
                               mdate={'gte':start_dt,'lte':end_dt },
                               paginate=True)

closing_price['vol'] = closing_price['vol'] * 1000  #將千股轉換成股

# 評估結果
performance = run_algorithm(start=start_dt,
                            end=end_dt,
                            initialize=initialize,
                            handle_data=handle_data,
                            capital_base=capital_base,
                            bundle='tquant')

positions, transactions, orders = get_transaction_detail(performance)
```
## 情況 1: 買入時計算滑價
* 在12/1下單 1500 張統一，成交量限制和VolumeShareSlippage範例相同，不多做敘述。所以12/1下的單到了12/8才完全成交。
* 以12/2為例，成交價（transactions.price）計算方法是：原始收盤價 * ( 1 + basis_point * 0.0001 ) = 65 * ( 1 + 5 * 0.0001 ) ≈ 65.0325
* basis_point 是預先設定好的 5，且因為此處為買單，所以符號為正。
```python
#查看12/2的交易量（vol單位是千股）
closing_price.query('(mdate == "2022-12-02")')
```


```python
orders.query('(created.dt.strftime("%Y-%m-%d") == "2022-12-01")')
```


```python
# 查看成交價
transactions.loc['2022-12-02']
```


## 情況 2: 賣出時計算滑價
* 在12/15下單賣出 200 張統一。
* 成交價計算方法是：原始收盤價 * ( 1 - basis_point * 0.0001 ) = 65.3 * ( 1 - 5 * 0.0001 ) ≈ 65.26735
* basis_point 是預先設定好的 5，且因為此處為賣單，所以符號為負。

```python
# 查看交易量
closing_price.query('(mdate == "2022-12-16")')
```


```python
orders.query('(created.dt.strftime("%Y-%m-%d") == "2022-12-15")')
```


```python
# 查看成交價
transactions.loc['2022-12-16']
```
