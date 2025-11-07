# set_max_position_size 函數介紹

限制特定股票（或全部）在帳上持有的**股數及市值**

## zipline.api.set_max_position_size(asset=None, max_shares=None, max_notional=None, on_error='fail')

- **asset** (*Asset, optional*):
  - 當設定非 None 時，僅對該股票生效；若為 None，則所有股票皆受此限制。
  - 必須為 `Asset` 物件（例如：`Equity(0 [1101])`）。
- **max_shares** (*int, optional*):
  - 限制該股票在帳上持有的最大股數。
- **max_notional** (*float, optional*):
  - 限制該股票在帳上持有的最大市值（市值 = 持股股數 × 當天收盤價）。
- **on_error** (*str, optional*):
  - 可選 `'fail'` 與 `'log'`，預設為 `'fail'`。
  - 若使用 `'log'`，請先進行下列 log 設定：
    ```python
    from logbook import Logger, StderrHandler, INFO
    log_handler = StderrHandler(
        format_string='[{record.time:%Y-%m-%d %H:%M:%S.%f}]: {record.level_name}: {record.func_name}: {record.message}',
        level=INFO
    )
    log_handler.push_application()
    log = Logger('Algorithm')
    ```

## 補充說明

- 此函數與 `set_max_order_size()` 使用方式類似，但針對的是**帳上部位**（position），而非單筆下單。
- 限制檢查僅在下單當下進行，系統會根據下單後的部位計算是否超過設定限制，並非持續追蹤帳戶整體部位。
- 若同一股票下多筆訂單，則每筆訂單會**個別**進行限制檢查。

## 範例

本例中我們設定：
- 限制 **2330** 單筆訂單的最大下單股數為 2000，最大下單金額為 481000。
- 限制 **1101** 帳上部位的最大持股股數為 1050。
- 限制 **2330** 帳上部位的最大持股股數為 2000，且最大市值為 600000。

```python
def initialize(context):
    context.i = 0
    set_max_order_size(asset=symbol('2330'), max_shares=2000, max_notional=481000, on_error='log')
    set_max_position_size(asset=symbol('1101'), max_shares=1050, on_error='log')
    set_max_position_size(asset=symbol('2330'), max_shares=2000, max_notional=600000, on_error='log')
    set_slippage(slippage.FixedSlippage(spread=0.0))
    set_commission(commission.PerDollar(cost=0.01))
    set_benchmark(symbol('IR0001'))
    
def handle_data(context, data):
    if context.i == 0:  # 2018-07-24
        order(symbol('1101'), 1000)
        
    if context.i == 1:  # 2018-07-25
        order(symbol('2330'), 2000)
        order(symbol('2330'), 1000)
        
    if context.i == 5:  # 2018-07-31
        order(symbol('2330'), 500)
        
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

closing_price = tejapi.fastget(
    'TWN/APIPRCD',
    coid=['1101','2330'],
    opts={'columns': ['mdate', 'coid', 'close_d']},
    mdate={'gte': start_dt, 'lte': end_dt},
    paginate=True
)

positions, transactions, orders = get_transaction_detail(performance)
```

## 觀察說明:

- 7/24 下單 1101 以 1000 股買入，若因除權事件實際成交 1100 股，雖然超過限制（1050 股）的數值，但限制檢查依然根據下單時的數量進行，因此不會出錯。

- 7/25 連續下兩筆 2330 訂單（2000 股與 1000 股），下單時每筆皆分別檢查，故未違反限制；但若加總後部位累計超過設定上限，則該限制僅在下單當下檢查，不會持續追蹤。

- 7/31 若下單 500 股 2330 使得帳面部位超出限制（例如超過最大持股數或最大市值），則會記錄錯誤訊息（若 on_error 設為 'log'，僅記錄錯誤而仍成交）。