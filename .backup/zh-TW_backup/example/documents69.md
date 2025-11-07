# set_max_order_count 函數介紹

```python
zipline.api.set_max_order_count(max_count, on_error='fail')
```

- **功能**：限制一天內能夠下的訂單張數  
- **參數**  
  - `max_count` (*int*): 當天最多可送出的訂單數。  
  - `on_error` (*str*, optional): 違規時處理方式，'fail'（中止）或 'log'（記錄）。預設 'fail'  

- **注意**  
  - 僅計算送出當天的訂單數；滑價或延遲成交不影響計算。  
  - `on_error='log'` 時超限僅記錄訊息，訂單仍照常執行；`on_error='fail'` 時將中止演算法。  

## 範例

- 在以下範例中，我們設定set_max_order_count(max_count=3, on_error='log')，限制最大下單數為 3。
- 設定滑價模型：set_slippage(slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1))，成交量限制為 2.5%。
- 下單：
  - 7/24 long 2330 及 2357 兩檔股票。
  - 7/25 long 2454、2317 及 1101 三檔股票。

```python
def handle_data(context, data):
    if context.i == 0:  # 7/24
        order_value(symbol('2330'), 5e8)
        order_value(symbol('2357'), 3e8)

    if context.i == 1:  # 7/25
        order_value(symbol('2454'), 5e5)
        order_value(symbol('2317'), 5e5)
        order_value(symbol('1101'), 5e5)
```

**補充說明：**
- 訂單數的計算方式：若要計算2018/7/25的訂單數，則從performance的orders取出created = '2018-07-25'的訂單進行計算。也就是說，如果因滑價或條件單的關係，訂單被拆成好幾天成交，則該張訂單只有在成立那天才會納入計算。

```python
def initialize(context):
    context.i = 0
    set_slippage(slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1))
    set_max_order_count(max_count=3, on_error='log')
    set_commission(commission.PerDollar(cost=commission_cost))
    set_benchmark(symbol('IR0001'))
    
def handle_data(context, data):
    
    if context.i == 0:  # 7/24
        order_value(symbol('2330'), 5e8)
        order_value(symbol('2357'), 3e8)
            
    if context.i == 1:  # 7/25
        order_value(symbol('2454'), 5e5)
        order_value(symbol('2317'), 5e5)
        order_value(symbol('1101'), 5e5)

    context.i += 1
    

commission_cost = 0.001425
capital_base = 1e9

performance = run_algorithm(start=start_dt,
                            end=end_dt,
                            initialize=initialize,
                            handle_data=handle_data,
                            capital_base=capital_base,
                            trading_calendar=get_calendar(calendar_name),
                            bundle=bundle_name)

positions, transactions, orders = get_transaction_detail(performance)
```
**範例說明**
- 在7/24下單大量的 2330 和 2357，因為VolumeShareSlippage的限制，所以會拆成數天成交。
- 這個會導致7/25不只有當天下的三張訂單，還有前一天 2330 和 2357 的單，共五張單。
- 但是程式沒有跳出任何錯誤或警告，因為第一天下兩張單，第二天下三張單，程式判定都沒有超過 3，所以沒有問題。
```python
orders.loc['2018-07-25']
```
