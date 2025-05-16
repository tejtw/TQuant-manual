# set_max_order_size 函數介紹

zipline.api.set_max_order_size(asset=None, max_shares=None, max_notional=None, on_error='fail')

- **功能**：限制單筆訂單的下單股數與金額  
- **參數**  
  - `asset` (*Asset*, optional): 要限制的標的，None 則對所有標的生效。  
  - `max_shares` (*int*, optional): 單筆最多下單股數。  
  - `max_notional` (*float*, optional): 單筆最多下單金額（下單數 × 當日收盤價）。  
  - `on_error` (*str*, optional): 'fail'（中止）或 'log'（記錄），預設 'fail'。  

- **注意**  
  - 檢查的是下單量與當日收盤價相乘的結果，實際成交價導致金額超出不會觸發錯誤。  
  - `on_error='log'` 時超限僅記錄訊息，訂單仍照常執行。  

- **補充說明：**
  - `max_shares` 是以下單時股數為準。
  - `max_notional` 計算方法為下單時的股數 * 下單當天收盤價，所以成交時的股數和金額可能還是會超過set_max_order_size的限制，細節在下面的範例說明。

## 範例

在以下這個範例，我們限制 1101 的 max_shares = 1000，且限制 2330 的 max_shares = 2000 、max_notional = 481000。

```python
def initialize(context):
    ...
    set_max_order_size(asset= symbol('1101'), max_shares=1000, on_error='log')
    set_max_order_size(asset= symbol('2330'), max_shares=2000, max_notional=481000, on_error='log')
    ...
```

在7/25 long 1000股的 1101 股票及 2000 股的 2330 股票。

```python
def handle_data(context, data):
    if context.i == 1:  # 2018-07-25
        order(symbol('1101'), 1000)
        order(symbol('2330'), 2000)
```

在8/16 long 2005 股的 2330 股票。

```python
if context.i == 17:  # 2018-08-16
    order(symbol('2330'), 2005)
```
```python
ef initialize(context):
    context.i = 0
    set_max_order_size(asset= symbol('1101'), max_shares=1000, on_error='log')
    set_max_order_size(asset= symbol('2330'), max_shares=2000, max_notional=481000, on_error='log')
    set_slippage(slippage.FixedSlippage(spread = 0.0))
    set_commission(commission.PerDollar(cost=0.01))
    set_benchmark(symbol('IR0001'))
    
def handle_data(context, data):

    if context.i == 1:  # 2018-07-25
        order(symbol('1101'), 1000)
        order(symbol('2330'), 2000)

    if context.i == 17:  # 2018-08-16
        order(symbol('2330'), 2005)

    context.i += 1


commission_cost = 0.001425
capital_base = 1e6


performance = run_algorithm(start=start_dt,
                            end=end_dt,
                            initialize=initialize,
                            handle_data=handle_data,
                            capital_base=capital_base,
                            trading_calendar=get_calendar(calendar_name),
                            bundle=bundle_name)

closing_price = tejapi.fastget('TWN/APIPRCD',
                               coid=['1101','2330'],
                               opts={'columns':['mdate','coid','close_d']},
                               mdate={'gte':start_dt,'lte':end_dt },
                               paginate=True)

positions, transactions, orders = get_transaction_detail(performance)
```