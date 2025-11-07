# set_long_only 函數介紹

預先設定投資組合不能持有任何短部位(short positions)

## zipline.api.set_long_only(on_error='fail')

- **on_error** (*str, optional*):
  - 可選 `'fail'` 與 `'log'`（預設為 `'fail'`）。當違反 long only 限制時，`'fail'` 會中止程式，`'log'` 則僅記錄錯誤，但仍會成交。
  - 若使用 `'log'`，請先設定 log，例如：
    ```python
    from logbook import Logger, StderrHandler, INFO
    log_handler = StderrHandler(
        format_string='[{record.time:%Y-%m-%d %H:%M:%S.%f}]: {record.level_name}: {record.func_name}: {record.message}',
        level=INFO
    )
    log_handler.push_application()
    log = Logger('Algorithm')
    ```

## 範例

在下列程式中，我們設定 `set_long_only(on_error='log')`，並進行以下操作：
- 7/24：買入 1000 股 2330。
- 7/26：賣出 500 股 2330。
- 7/30：再次賣出 800 股 2330（此時會使持倉轉為 short）。

```python
def initialize(context):
    context.i = 0
    set_long_only(on_error='log')
    set_slippage(slippage.FixedSlippage(spread=0.0))
    set_commission(commission.PerDollar(cost=commission_cost))
    set_benchmark(symbol('IR0001'))
    
def handle_data(context, data):
    if context.i == 0:  # 2018-07-24
        order(symbol('2330'), 1000)
        
    if context.i == 2:  # 2018-07-26
        order(symbol('2330'), -500)
        
    if context.i == 4:  # 2018-07-30
        order(symbol('2330'), -800)
        
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

# 查詢持有 short position 股票的數量
performance.shorts_count
```