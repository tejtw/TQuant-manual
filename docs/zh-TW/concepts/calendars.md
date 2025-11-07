# 交易日曆 (Trading Calendars)

!!! info
    本頁解釋 Zipline 中交易日曆 (Trading Calendars) 的重要性，以及在 TQuant Lab 環境下如何使用 `tej-exchange-calendars` 套件來確保回測的準確性。內容涵蓋交易日曆的核心概念、TQuant Lab 提供的台灣市場日曆，以及在回測中指定日曆的方法。

在量化回測中，一個準確的交易日曆是確保模擬結果貼近真實市場的基石。如果回測引擎不知道市場何時開盤、何時休市，或何時因節假日而不交易，那麼所有的計算（如移動平均、波動率）和交易模擬都將是錯誤的。

Zipline 透過一個強大的交易日曆系統來解決這個問題，而 TQuant Lab 則基於此系統，提供了專為台灣市場設計的 `tej-exchange-calendars` 套件。

---

## 1. 交易日曆的核心作用

交易日曆在 Zipline 回測中扮演著以下幾個關鍵角色：

*   **定義交易日 (Sessions)**：
    準確定義哪些日期是交易日，哪些是週末或國定假日（如農曆新年、端午節等）。這確保了 `handle_data` 函數只會在市場實際開放的日子被調用。

*   **定義開收盤時間 (Open/Close Times)**：
    每個交易日曆都包含了市場的開盤和收盤時間。這對於分鐘級別的回測至關重要，它決定了數據的可用時間點和交易的執行時間。

*   **處理特殊交易日**：
    交易日曆能夠處理非正常的交易日，例如因颱風而延遲開盤、補班日的全天交易，或是只有半天交易的日期。

*   **避免數據前視**：
    透過精確的時間戳和交易日定義，Zipline 可以確保在任何時間點，策略只能獲取到當時已經發生的數據，從而避免向前看偏誤。

---

## 2. TQuant Lab 的台灣市場日曆

TQuant Lab 使用 `tej-exchange-calendars` 套件來提供專為台灣市場客製化的交易日曆。主要包含兩個核心日曆：`TEJ_XTAI` 用於股票市場，`TEJ` 用於期貨市場。

### `TEJ_XTAI` 日曆 (股票市場)

*   **全名**：Taiwan Stock Exchange Calendar (台灣證券交易所日曆)
*   **用途**：專為台灣股票市場設計，完整包含了台灣證券交易所的所有交易日、休市日、以及特殊的開收盤時間規則。
*   **適用場景**：進行台股、ETF 等證券交易的策略回測。

### `TEJ` 日曆 (期貨市場)

*   **全名**：Taiwan Futures Exchange Calendar (台灣期貨交易所日曆)
*   **用途**：專為台灣期貨市場設計，包含了台灣期貨交易所的交易日規則。
*   **適用場景**：進行台指期、小台指等期貨商品的策略回測。

---

## 3. 如何在回測中使用交易日曆

在 TQuant Lab 中，您通常在 `run_algorithm` 函數中透過 `trading_calendar` 參數來指定要使用的交易日曆。

### 獲取交易日曆

您可以使用 `get_calendar` 函數來獲取一個已註冊的交易日曆實例。

```python
from zipline.utils.calendar_utils import get_calendar

# 獲取台灣證券交易所的交易日曆
stock_calendar = get_calendar('TEJ_XTAI')

# 獲取台灣期貨交易所的交易日曆
futures_calendar = get_calendar('TEJ')
```

### 在 `run_algorithm` 中指定日曆

在執行回測時，將獲取到的日曆實例傳遞給 `trading_calendar` 參數。

```python
from zipline import run_algorithm
from zipline.utils.calendar_utils import get_calendar
import pandas as pd

# ... (您的 initialize 和 handle_data 函數定義) ...

# 執行股票策略回測時，指定 TEJ_XTAI 日曆
stock_results = run_algorithm(
    start=pd.Timestamp('2020-01-01', tz='utc'),
    end=pd.Timestamp('2023-12-31', tz='utc'),
    initialize=initialize,
    handle_data=handle_data,
    capital_base=1e6,
    bundle='tquant',
    trading_calendar=get_calendar('TEJ_XTAI') # 指定股票交易日曆
)

# 執行期貨策略回測時，指定 TEJ 日曆
futures_results = run_algorithm(
    start=pd.Timestamp('2020-01-01', tz='utc'),
    end=pd.Timestamp('2023-12-31', tz='utc'),
    initialize=initialize_futures,
    handle_data=handle_data_futures,
    capital_base=1e6,
    bundle='tquant_future',
    trading_calendar=get_calendar('TEJ') # 指定期貨交易日曆
)
```

!!! warning "時區 (Timezone) 的重要性"
    Zipline 內部的所有時間戳都使用 UTC 時區。當您定義回測的起始和結束日期時，請務必使用帶有 `tz='utc'` 的 `pandas.Timestamp` 物件，以確保與交易日曆的時區一致，避免潛在的錯誤。

---

## 4. 交易日曆的實用方法與屬性

交易日曆物件本身也提供了一些實用的屬性和方法，供您在策略中查詢時間相關的資訊。

### `.all_sessions` 屬性

*   **用途**：獲取該日曆在 TQuant Lab 資料庫中所涵蓋的全部交易日期。
*   **返回**：一個 `pandas.DatetimeIndex` 物件，包含了所有交易日的日期。
*   **範例**：獲取 2020 年之後的所有交易日。

    ```python
    from zipline.utils.calendar_utils import get_calendar
    import pandas as pd

    calendar = get_calendar('TEJ_XTAI')
    all_sessions = calendar.all_sessions

    # 篩選出 2020-01-01 之後的所有交易日
    sessions_after_2020 = all_sessions[all_sessions >= pd.Timestamp('2020-01-01', tz='utc')]
    print(sessions_after_2020[:5])
    ```

### `is_session(timestamp)` 方法

*   **用途**：檢查某個時間戳是否為交易日。
*   **返回**：布林值 (`True` 或 `False`)。
*   **範例**：判斷 2023 年 10 月 10 日是否為交易日。

    ```python
    from zipline.utils.calendar_utils import get_calendar
    import pandas as pd

    calendar = get_calendar('TEJ_XTAI')
    a_day = pd.Timestamp('2023-10-10', tz='utc') # 國慶日
    is_trading_day = calendar.is_session(a_day)
    print(f"Is {a_day.date()} a trading day? {is_trading_day}") # 應返回 False
    ```

### `sessions_in_range(start_ts, end_ts)` 方法

*   **用途**：獲取兩個時間戳之間的所有交易日。
*   **返回**：一個 `pandas.DatetimeIndex` 物件。
*   **範例**：計算 2023 年第一季有多少個交易日。

    ```python
    from zipline.utils.calendar_utils import get_calendar
    import pandas as pd

    calendar = get_calendar('TEJ_XTAI')
    start_date = pd.Timestamp('2023-01-01', tz='utc')
    end_date = pd.Timestamp('2023-03-31', tz='utc')

    q1_sessions = calendar.sessions_in_range(start_date, end_date)
    print(f"Number of trading days in Q1 2023: {len(q1_sessions)}")
    ```

### `next_open()` / `previous_open()` 方法

*   **用途**：獲取指定時間點之後或之前的下一個/上一個開盤時間。
*   **範例**：找到 2023 年元旦之後的第一個開盤時間。

    ```python
    from zipline.utils.calendar_utils import get_calendar
    import pandas as pd

    calendar = get_calendar('TEJ_XTAI')
    a_day = pd.Timestamp('2023-01-01', tz='utc') # 元旦

    next_opening_time = calendar.next_open(a_day)
    print(f"Next open after {a_day.date()}: {next_opening_time}")
    ```

### `next_close()` / `previous_close()` 方法

*   **用途**：獲取指定時間點之後或之前的下一個/上一個收盤時間。
*   **範例**：找到 2023 年 3 月 8 日之前的最後一個收盤時間。

    ```python
    from zipline.utils.calendar_utils import get_calendar
    import pandas as pd

    calendar = get_calendar('TEJ_XTAI')
    a_day = pd.Timestamp('2023-03-08', tz='utc')

    prev_closing_time = calendar.previous_close(a_day)
    print(f"Previous close before {a_day.date()}: {prev_closing_time}")
    ```

### 範例：計算訂單已等待的交易日數

這個實務範例展示如何結合 `sessions_in_range` 來管理訂單的生命週期。

```python
from zipline.api import get_datetime, cancel_order
from zipline.utils.calendar_utils import get_calendar

def handle_data(context, data):
    # 獲取當前交易日曆
    calendar = get_calendar('TEJ_XTAI')
    
    # 遍歷所有未成交訂單
    for order in context.blotter.open_orders:
        # 計算從訂單創建到現在，經過了多少個交易日
        days_waited = len(calendar.sessions_in_range(order.created, get_datetime()))
        
        if days_waited > 5:
            # 如果訂單已等待超過 5 個交易日，則取消訂單
            cancel_order(order)
```

---

## 總結

交易日曆是 Zipline 回測框架中確保時間準確性的關鍵組件。在 TQuant Lab 中，透過使用專為台灣市場設計的 `TEJ_XTAI`（股票）和 `TEJ`（期貨）日曆，您可以確信您的回測是在一個貼近真實市場環境的基礎上運行的，從而大幅提升策略模擬結果的可靠性與可信度。