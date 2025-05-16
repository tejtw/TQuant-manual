
# Schedule_function 函數介紹

`schedule_function()` 是 Zipline 提供的一個排程工具，用來**安排某個函數在特定時間點執行**，例如每日開盤、每週一、或每月的最後一個交易日。

這讓你可以建立更具邏輯性與節奏感的交易策略，例如只在每週做再平衡、不每天都執行。

---

## 函數語法

```python
schedule_function(func, date_rule=None, time_rule=None)
```

- `func`：你要排程執行的函數（不用加括號）
- `date_rule`：使用 `date_rules` 模組設定哪幾天執行（可選）
- `time_rule`：使用 `time_rules` 模組設定當天的幾點執行（可選）

---

## 範例

> 這段會安排 `rebalance()` 函數在 **每週一的市場開盤後 30 分鐘執行一次**：

```python
from zipline.api import schedule_function, date_rules, time_rules

def initialize(context):
    schedule_function(
        rebalance,
        date_rule=date_rules.week_start(),
        time_rule=time_rules.market_open(minutes=30)
    )

def rebalance(context, data):
    # 實際下單邏輯
    pass
```

---

## 提醒

- 若你沒有指定 `date_rule` 和 `time_rule`，函數會在**每天開盤時執行一次**。
- 可搭配以下常見規則使用：
  - `date_rules.every_day()`
  - `date_rules.week_start(days_offset=0)`
  - `date_rules.month_end(days_offset=0)`
  - `time_rules.market_open(minutes=N)`
  - `time_rules.market_close(minutes=N)`
<br>
- 每次被觸發執行時，都會進入你指定的 `func(context, data)` 函數，因此記得這些函數也要接受標準 Zipline 參數。

---

`schedule_function()` 是實現「每週」、「每月」等週期性再平衡策略的關鍵工具，建議與 `order_target_percent()`、`pipeline_output()` 一起使用。
