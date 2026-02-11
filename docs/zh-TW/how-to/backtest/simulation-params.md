# Zipline 回測模擬參數 (Simulation Parameters)

!!! info
    本頁詳細說明 Zipline 回測中的模擬參數，包括 `run_algorithm()` 函數的核心參數、如何設定回測期間、初始資金、數據頻率、以及其他影響回測行為的重要設定。

在 Zipline 中，模擬參數 (Simulation Parameters) 決定了回測引擎如何運行您的交易策略。這些參數控制著回測的時間範圍、可用的資金、數據的粒度以及其他環境因素。精確地設定這些參數對於確保回測結果的有效性和可靠性至關重要。

本文件將主要介紹 `zipline.run_algorithm()` 函數中的關鍵參數，因為它是控制 Zipline 回測行為的主要入口。

---

## 1. `run_algorithm()` 函數的核心參數

`zipline.run_algorithm()` 函數是啟動 Zipline 回測的核心。以下是其一些最常用的參數：

*   `start` (`pd.Timestamp`)
    *   **用途**：定義回測的起始日期。必須是 UTC 時區的 `pandas.Timestamp` 物件。
    *   **範例**：`pd.Timestamp('2020-01-01', tz='utc')`

*   `end` (`pd.Timestamp`)
    *   **用途**：定義回測的結束日期。必須是 UTC 時區的 `pandas.Timestamp` 物件。
    *   **範例**：`pd.Timestamp('2023-12-31', tz='utc')`

*   `initialize` (`function`)
    *   **用途**：在回測開始時僅執行一次的函數，用於設定策略的初始狀態。
    *   **詳見**：[生命週期函數](../../reference/zipline/lifecycle-functions.md)

*   `handle_data` (`function`)
    *   **用途**：在每個交易日被調用一次的核心交易邏輯函數。
    *   **詳見**：[生命週期函數](../../reference/zipline/lifecycle-functions.md)

*   `analyze` (`function`, optional)
    *   **用途**：在整個回測結束後執行一次的函數，用於績效分析和視覺化。
    *   **詳見**：[生命週期函數](../../reference/zipline/lifecycle-functions.md)

*   `capital_base` (`float`)
    *   **用途**：設定回測開始時的初始資金金額。
    *   **範例**：`1_000_000` (100 萬)

*   `data_frequency` (`str`, optional)
    *   **用途**：指定數據的頻率。可選 `'daily'` (日頻) 或 `'minute'` (分鐘頻)。
    *   **預設**：`'daily'`

*   `bundle` (`str`, optional)
    *   **用途**：指定要使用的 Zipline 資料包名稱。
    *   **預設**：`'tquant'` (TQuant Lab 預設的資料包)

*   `trading_calendar` (`zipline.utils.calendars.TradingCalendar`, optional)
    *   **用途**：指定回測要使用的交易日曆。例如 `'TEJ_XTAI'` (台灣股票) 或 `'TEJ'` (台灣期貨)。
    *   **詳見**：[交易日曆](../../concepts/calendars.md)

*   `benchmark_sid` (`int`, optional) 或 `benchmark_symbol` (`str`, optional)
    *   **用途**：設定用於比較的基準指數的 Zipline ID 或股票代碼。
    *   **詳見**：[如何設定與取得 Benchmark 報酬率](../data/get-benchmark-roi.md)

*   `treasury_returns` (`pd.Series`, optional)
    *   **用途**：提供自定義的無風險利率序列。
    *   **詳見**：[如何設定無風險利率](../data/get-risk-free-rate.md)

*   `before_trading_start` (`function`, optional)
    *   **用途**：在每個交易日開盤前執行一次的函數，通常用於盤前數據準備。
    *   **詳見**：[生命週期函數](../../reference/zipline/lifecycle-functions.md)

*   `warm_up_days` (`int`, optional)
    *   **用途**：設定在回測開始前，策略需要「預熱」的交易日數。這些天數的數據會被加載，但不會執行交易或記錄績效，以確保因子計算有足夠的歷史數據。
    *   **預設**：0

*   `metrics_set` (`zipline.finance.metrics.MetricsSet`, optional)
    *   **用途**：指定要使用的績效指標集。通常使用預設值。

---

## 2. `SimulationParameters` 物件 (進階)

在 Zipline 的內部，這些 `run_algorithm()` 的參數最終會被封裝成一個 `SimulationParameters` 物件。對於大多數使用者而言，直接透過 `run_algorithm()` 傳入參數已經足夠。

然而，如果您需要更細粒度的控制，例如自定義 Zipline 的行為，可以手動構建 `SimulationParameters` 物件。但這通常屬於進階用法，且在 TQuant Lab 中較少直接操作。

---

## 3. 範例

以下是一個結合多個模擬參數的 `run_algorithm()` 範例：

```python
import pandas as pd
from zipline import run_algorithm
from zipline.api import (
    set_benchmark,
    symbol,
    order_target_percent
)
from zipline.utils.calendar_utils import get_calendar

# 假設這是您的策略邏輯
def initialize(context):
    set_benchmark(symbol('IR0001'))
    context.asset = symbol('2330')
    context.ordered = False

def handle_data(context, data):
    if not context.ordered:
        order_target_percent(context.asset, 1.0)
        context.ordered = True

def analyze(context, results):
    print("回測分析完成。")

# 設定無風險利率 (例如：使用固定的年化 1% 無風險利率)
start_date = pd.Timestamp('2020-01-01', tz='utc')
end_date = pd.Timestamp('2022-01-01', tz='utc')
date_range = pd.date_range(start=start_date, end=end_date, freq='D', tz='utc')
fixed_treasury_returns = pd.Series(data=(0.01 / 252), index=date_range) # 假設 252 個交易日

# 執行回測
results = run_algorithm(
    start=start_date,
    end=end_date,
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    capital_base=500_000,              # 初始資金 50 萬
    data_frequency='daily',           # 日頻數據
    bundle='tquant',                  # 使用 'tquant' 資料包
    trading_calendar=get_calendar('TEJ_XTAI'), # 指定台灣股票交易日曆
    benchmark_symbol='IR0001',        # 設定 Benchmark 為 IR0001
    treasury_returns=fixed_treasury_returns, # 自定義無風險利率
    warm_up_days=50                   # 預熱 50 個交易日
)
```