# Zipline 期貨策略備忘錄 (API Cheat Sheet)

!!! info
    本頁提供 TQuant Lab 期貨策略開發的 API 快速參考，包含初始化、數據獲取、交易下單、部位管理及回測執行等常用函數。

這是一份專為 TQuant Lab 中進行 **期貨** 策略回測設計的 API 快速參考備忘錄。

---

## 1. 初始化 (`initialize`)

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `continuous_future(...)` | **(最重要)** 建立一個連續合約物件，用以進行分析與交易。 | `context.future = continuous_future('TX', offset=0)` |
| `set_benchmark(asset)` | 設定回測的績效比較基準。 | `set_benchmark(symbol('IR0001'))` |
| `set_commission(...)` | 設定交易手續費模型，期貨通常按口計費。 | `set_commission(futures=commission.PerContract(cost=200))` |
| `set_slippage(...)` | 設定滑價模型，期貨常用固定點數滑價。 | `set_slippage(futures=slippage.FixedSlippage(spread=6.0))` |
| `schedule_function(...)` | 註冊一個排程函數。期貨策略通常需要排程 **交易** 與 **轉倉** 兩個函數。 | `schedule_function(daily_trade, date_rules.every_day())` |

---

## 2. 數據獲取 (Data Access)

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `data.current(cf, 'contract')` | **(最重要)** 從連續合約(`cf`)中，取得當前可交易的 **具體合約** 物件。 | `contract = data.current(context.future, 'contract')` |
| `data.history(cf, ...)` | 獲取連續合約的歷史數據。 | `hist = data.history(context.future, 'price', 50, '1d')` |
| `data.can_trade(contract)` | 檢查 **具體合約** 在當前時間點是否可交易。 | `if data.can_trade(contract): ...` |
| `get_datetime()` | 取得目前回測的時間點 (UTC)。 | `current_time = get_datetime()` |

---

## 3. 交易與訂單 (Trading & Orders)

**核心觀念**：所有下單函數的 `asset` 參數都必須是 `data.current()` 回傳的**具體合約**，而非 `continuous_future` 物件。

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `order_target(contract, amount)` | 下單將 **具體合約** 的部位調整至目標 `amount` 口數。 | `order_target(contract, 1)` |
| `order(contract, amount)` | 下一張市價單，買入/賣出指定 `amount` 的口數。 | `order(contract, -1)` |
| `get_order(order_id)` | 透過訂單 ID 查詢訂單物件。 | `my_order = get_order(order_id)` |
| `get_open_orders(contract)` | 取得指定 **具體合約** 上所有未成交的掛單。 | `open_orders = get_open_orders(my_contract)` |
| `cancel_order(order_id)` | 根據訂單 ID 取消一筆未成交的掛單。 | `cancel_order(my_order_id)` |

---

## 4. 部位與合約屬性 (Position & Contract Attributes)

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `context.portfolio.positions` | (屬性) 一個字典，包含所有當前持有的部位。 | `for asset, pos in context.portfolio.positions.items(): ...` |
| `position.amount` | (屬性) 持有的口數。多單為正，空單為負。 | `contracts_held = position.amount` |
| `asset.auto_close_date` | (屬性) **(轉倉關鍵)** 具體合約的到期結算日。 | `days_left = (asset.auto_close_date - today).days` |
| `asset.root_symbol` | (屬性) 具體合約的根代碼。 | `if asset.root_symbol == 'TX': ...` |
| `asset.symbol` | (屬性) 具體合約的完整代碼。 | `print(asset.symbol) # e.g., 'TXF2410'` |

---

## 5. 執行與分析 (Execution & Analysis)

| API 函數/屬性 | 說明 | 範例 |
| :--- | :--- | :--- |
| `run_algorithm(...)` | **核心執行函數** ，啟動整個回測。 | `results = run_algorithm(...)` |
| `record(**kwargs)` | 在每個時間點記錄一個或多個變數，以便後續分析。 | `record(my_ma=ma_value, price=current_price)` |
| `get_calendar(name)` | 取得一個交易日曆物件。期貨與股票共用 `TEJ` 日曆。 | `trading_calendar=get_calendar('TEJ')` |