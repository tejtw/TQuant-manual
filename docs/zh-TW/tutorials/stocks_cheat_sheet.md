# Zipline 股票策略備忘錄 (API Cheat Sheet)

!!! info
    本頁提供 TQuant Lab 股票策略開發的 API 快速參考，包含初始化、數據獲取、交易下單、部位管理及回測執行等常用函數。

這是一份專為 TQuant Lab 中進行股票策略回測設計的 API 快速參考備忘錄。

---

## 1. 初始化 (`initialize`)

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `symbol(ticker_str)` | 根據股票代碼取得 `Equity` 資產物件。 | `context.asset = symbol('2330')` |
| `set_benchmark(asset)` | 設定回測的績效比較基準。 | `set_benchmark(symbol('IR0001'))` |
| `set_commission(...)` | 設定交易手續費模型。 | `set_commission(equities=commission.PerDollar(cost=0.001425))` |
| `set_slippage(...)` | 設定滑價模型。 | `set_slippage(equities=slippage.VolumeShareSlippage())` |
| `schedule_function(...)` | 註冊一個排程函數，在特定時間週期性執行。 | `schedule_function(my_func, date_rules.every_day())` |
| `date_rules.every_day()` | 日期規則：每個交易日。 | `schedule_function(my_func, date_rules.every_day())` |
| `date_rules.week_start()` | 日期規則：每週的第一個交易日。 | `schedule_function(my_func, date_rules.week_start())` |
| `date_rules.month_start()` | 日期規則：每個月的第一個交易日。 | `schedule_function(my_func, date_rules.month_start())` |
| `time_rules.market_open()` | 時間規則：每日開盤時。可加 `minutes` 或 `hours` 參數做偏移。 | `time_rules.market_open(minutes=30)` |
| `time_rules.market_close()` | 時間規則：每日收盤時。可加 `minutes` 或 `hours` 參數做偏移。 | `time_rules.market_close(minutes=15)` |

---

## 2. 數據獲取 (Data Access)

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `data.history(...)` | 獲取歷史數據，回傳一個 `pandas.DataFrame`。 | `hist = data.history(asset, 'price', 50, '1d')` |
| `data.current(...)` | 獲取指定資產的當前數據（價格、成交量等）。 | `price = data.current(asset, 'price')` |
| `data.can_trade(asset)` | 檢查指定資產在當前時間點是否可交易。 | `if data.can_trade(my_asset): ...` |
| `get_datetime()` | 取得目前回測的時間點 (UTC)。 | `current_time = get_datetime()` |

---

## 3. 交易與訂單 (Trading & Orders)

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `order(asset, amount)` | 下一張市價單，買入/賣出指定 `amount` 的股數。正數為買，負數為賣。 | `order(symbol('2330'), 1000)` |
| `order_target(asset, amount)` | 下單將資產部位調整至目標 `amount` 股數。 | `order_target(symbol('2330'), 5000)` |
| `order_target_percent(asset, pct)` | 下單將資產部位調整至佔總投資組合價值的 `pct` 比例。 | `order_target_percent(symbol('2330'), 0.1)` |
| `order_value(asset, value)` | 下單買入/賣出價值 `value` 的股票。 | `order_value(symbol('2330'), 500000)` |
| `order_target_value(asset, value)` | 下單將資產部位調整至目標價值 `value`。 | `order_target_value(symbol('2330'), 200000)` |
| `LimitOrder(price)` | 限價單樣式，需與 `order()` 函數配合使用。 | `order(asset, 1000, style=LimitOrder(599.0))` |
| `StopOrder(price)` | 停損單樣式（市價）。 | `order(asset, -1000, style=StopOrder(550.0))` |
| `StopLimitOrder(limit, stop)` | 停損限價單樣式。 | `order(asset, -1000, style=StopLimitOrder(550, 551))` |
| `get_order(order_id)` | 透過訂單 ID 查詢訂單物件。`order()` 函數會回傳 ID。 | `my_order = get_order(order_id)` |
| `get_open_orders()` | 取得所有未成交的掛單。 | `open_orders = get_open_orders()` |
| `cancel_order(order_id)` | 根據訂單 ID 取消一筆未成交的掛單。 | `cancel_order(my_order_id)` |

---

## 4. 投資組合與部位 (Portfolio & Positions)

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `context.portfolio.portfolio_value` | (屬性) 整個投資組合的總淨值。 | `net_worth = context.portfolio.portfolio_value` |
| `context.portfolio.cash` | (屬性) 帳戶中的現金餘額。 | `cash_balance = context.portfolio.cash` |
| `context.portfolio.positions` | (屬性) 一個字典，包含所有當前持有的部位。 | `for asset, pos in context.portfolio.positions.items(): ...` |
| `context.portfolio.positions_value` | (屬性) 所有持倉的總市值。 | `total_pos_value = context.portfolio.positions_value` |
| `position.amount` | (屬性) 持有的股數。 | `shares = position.amount` |
| `position.cost_basis` | (屬性) 平均持有成本。 | `avg_cost = position.cost_basis` |
| `position.last_sale_price` | (屬性) 最新成交價格。 | `current_price = position.last_sale_price` |

---

## 5. 執行與分析 (Execution & Analysis)

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `run_algorithm(...)` | **核心執行函數**，啟動整個回測。 | `results = run_algorithm(...)` |
| `record(**kwargs)` | 在每個時間點記錄一個或多個變數，以便後續分析。 | `record(my_ma=ma_value, price=current_price)` |
| `get_calendar(name)` | 取得一個交易日曆物件。 | `trading_calendar=get_calendar('TEJ')` |