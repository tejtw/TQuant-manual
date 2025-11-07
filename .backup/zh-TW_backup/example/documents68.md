# set_max_leverage

設定投資組合的槓桿限制

## zipline.api.set_max_leverage(max_leverage)

- **max_leverage** (*float*):
  - 表示投資組合的最高槓桿，必須大於 0。
  - 此處指的槓桿為 **gross leverage**，計算方式為：
    ```
    (long_exposure - short_exposure) / (long_exposure + short_exposure + ending_cash)
    ```
    其中：
    - **ending_cash**：當日結束時帳上現金（計算：starting_cash - capital_used）
    - **long_exposure**：所有正持股部分的總價值（sum(amount * last_sale_price)，僅當 amount > 0）
    - **short_exposure**：所有負持股部分的總價值（sum(amount * last_sale_price)，僅當 amount < 0）
  - 參考：[TSMC buy and hold strategy.ipynb](https://github.com/tejtw/TQuant-Lab/blob/main/lecture/TSMC%20buy%20hold%20strategy.ipynb)

<br>

## 補充說明

- 當投資組合的 gross leverage 超過 `max_leverage` 限制時，程式會中止執行（fail）。
- 此限制不支援 `'log'` 模式，必須嚴格限制。

## 範例

設定 `set_max_leverage(3.0)`，範例如下：
- 7/24：先以 100 萬買入 2330（long），同時以 100 萬做空 2317（short）。

```python
def handle_data(context, data):
    if context.i == 0:   # 7/24
        order_value(symbol('2330'), 1e6)
        order_value(symbol('2317'), -1e6)
    ...
```

7/26：以 50 萬買入 2454（long）。

```python
if context.i == 2:   # 7/26
    order_value(symbol('2454'), 5e5)
```

可透過以下程式查詢某些日期的 gross_leverage 與其他參數：

```python
performance.loc['2018-07-25':'2018-07-27', ['gross_leverage', 'portfolio_value', 'ending_cash']]
```

**計算示例（以 7/25 為例）：**

假設：

- 2330 的 amount 與 last_sale_price 分別為 4149 與 240.5

- 2317 的 amount 與 last_sale_price 分別為 -11737 與 82.7

- ending_cash 為 970010.30973

則槓桿計算為：

```yaml
(4149 * 240.5 - (-11737) * 82.7) /
(970010.30973 + 4149 * 240.5 + (-11737) * 82.7) = 1.974022
```
完整程式範例：
```python
def initialize(context):
    context.i = 0
    set_max_leverage(3.0)
    set_slippage(slippage.FixedSlippage(spread=0.0))
    set_commission(commission.PerDollar(cost=commission_cost))
    set_benchmark(symbol('IR0001'))
    
def handle_data(context, data):
    if context.i == 0:   # 7/24
        order_value(symbol('2330'), 1e6)
        order_value(symbol('2317'), -1e6)
            
    if context.i == 2:   # 7/26
        order_value(symbol('2454'), 5e5)
    
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
```
