# VolumeShareSlippage : 設定固定 spread 的滑價，不能設定成交量限制
## `zipline.finance.slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1)`
* 利用該筆交易佔當天總交易量的百分比（volume share）來計算滑價，考慮滑價後的成交價計算方法如下（買入的話，符號為+；賣出的話，符號為-）:  
  
<center>

$price \times [1 \pm (\text{price\_impact}) \times (\text{volume\_share})^2]$ 
</center>
 
$price=$ 當日收盤價。  
$\text{volume\_share}=$此單交易量佔總交易量百分比數，最高為$\text{volume\_limit}$

* 設定當日交易量限制：
<center>

$\text{historical\_volume} \times \text{volume\_limit}$ 
</center>

$\text{historical\_volume}=$ 當日成交價。

## Parameters：
* volume_limit (float, optional) -
    * 限制買賣量佔總交易量的最大百分比，預設 = 2.5 %。
    * 此限制考慮如果買賣大量股票，會對股價造成過大影響，導致偏離歷史的價格，若利用當天收盤價進行模擬交易就會高估獲利。
* price_impact (float, optional) - 滑價影響程度，其值越大時，滑價影響程度越大，預設 = 0.1。

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
    set_slippage(slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1))
    
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
* 在12/1下單 1500 張統一，但觀察成交量資料發現，這段期間每日成交量大約只有數千到一萬多張（從 TEJ API（TWN/APIPRCD）取得的成交量（vol）單位是千股，但為了一致性，所以我們這邊將千股轉換成股，利用 order 下單時的單位也是股）。
* 因為我們設定 volume_limit = 0.025，使得 zipline 會把這筆訂單拆成數天慢慢消化，每天成交量不超過該股票總成交量的 2.5%。
```python
# 1216每日成交量大約只有數千到一萬多張（vol單位是千股）
closing_price.query('(mdate >= "2022-12-01")')
```


```python
# 在12/1下單一千五百張統一
orders.loc['2022-12-01']
```


* 12/2的總成交量是 15184000 股，由於我們設定 volume_limit = 0.025，因此 VolumeShareSlippage 會把12/2的成交量限制在2.5%，也就是379600股。
* 成交價（transactions.price）計算方法是：原始收盤價 * ( 1 + price_impact * volume_share ^ 2 ) = 65 * ( 1 + 0.1 * 0.025 ^ 2 )  ≈ 65.004063
* price_impact 是預先設定好的0.1，且因為此處為買單，所以符號為正。
```python
# 查看成交量
orders.loc['2022-12-02']
```


```python
# 查看成交價
transactions.loc['2022-12-02']
```


### orders 資料中的 filled 為累積成交量
* 12/7的 filled = 1293325 股，代表 12/2 到 12/7 成交的累計股數 = 379600 + 242600 + 329275 + 341850 = 1293325。
* 截至12/8已經買滿了 1500 張，所以最後 status 就會從0 變成 1，代表當初下的 1500 張已經全數成交。
```python
orders.query('(created.dt.strftime("%Y-%m-%d") == "2022-12-01")')
```


## 情況 2: 賣出時計算滑價
* 在 12/15 下單賣出 200 張統一，因為在12/16總交易量是 10721 張，volume_share = 200 / 10721 ≈ 0.018655小於 0.025，所以12/16一天就能賣掉。
* 成交價（transactions.price）是 65.3 * ( 1 - 0.1 * 0.018655 ^ 2 ) = 65.297728（賣出的話是減）。

```python
# 查看交易量
closing_price.query('(mdate >= "2022-12-16")')
```


```python
orders.query('(created.dt.strftime("%Y-%m-%d") == "2022-12-15")')
```


```python
# 查看成交價
transactions.loc['2022-12-16']
```

