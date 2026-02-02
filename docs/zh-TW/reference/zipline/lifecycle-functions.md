# Zipline 回測生命週期函數參考

!!! info
    本頁詳細說明 Zipline 回測的生命週期函數，包括 `initialize()`、`before_trading_start()`、`handle_data()` 和 `analyze()` 的用途、執行時機和常見操作，幫助使用者編寫有效的 Zipline 策略。

Zipline 是一個事件驅動的回測框架，它透過一系列定義好的生命週期函數來執行交易策略。理解這些函數的用途和執行時機，對於編寫有效的 Zipline 策略至關重要。

本文件將詳細說明 `initialize()`、`before_trading_start()`、`handle_data()` 和 `analyze()` 這四個核心函數。

---

## 1. initialize(context)

*   **用途**: 策略執行前的初始化設定。
*   **執行時機**: 在回測開始時僅執行 **一次**。
*   **參數**:
    *   `context`: 一個 `dict` 般的物件，用於在回測期間儲存和傳遞策略的狀態資訊。您可以在 `context` 中定義任何自定義變數。

#### 1.1常見操作
*   **設定 Benchmark**: 使用 `set_benchmark()`。
*   **設定交易成本**: 使用 `set_commission()` 和 `set_slippage()`。
*   **設定交易控制**: 使用 `set_max_leverage()` 等。
*   **附掛 Pipeline**: 使用 `attach_pipeline()`。
*   **初始化自定義變數**: 例如 `context.has_ordered = False`。
*   **設定排程函數**: 使用 `schedule_function()`。

#### 1.2範例
```python
from zipline.api import set_benchmark, symbol, set_commission, set_slippage, attach_pipeline
from zipline.finance import commission, slippage
from zipline.pipeline import Pipeline
from zipline.pipeline.factors import SimpleMovingAverage
from zipline.pipeline.data import EquityPricing

def make_my_pipeline():
    # 這裡定義一個簡單的 Pipeline
    return Pipeline(columns={'SMA': SimpleMovingAverage(inputs=[EquityPricing.close], window_length=20)})

def initialize(context):
    context.my_stock = symbol('2330')
    set_benchmark(symbol('IR0001')) # 設定Benchmark
    set_commission(equities=commission.PerDollar(cost=0.001)) # 設定手續費
    set_slippage(equities=slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1)) # 設定滑價
    attach_pipeline(make_my_pipeline(), 'my_strategy_pipeline') # 附掛 Pipeline
    context.trading_signal_triggered = False # 初始化自定義變數
```

---

## 2. before_trading_start(context, data)

*   **用途**: 每日盤前數據準備和決策。
*   **執行時機**: 每個交易日 **開盤前** 執行一次，在 `handle_data()` 之前。
*   **參數**:
    *   `context`: 策略狀態物件。
    *   `data`: 數據物件，提供當前日期之前所有可用的歷史數據。

#### 2.1常見操作
*   **數據預處理**: 獲取最新的歷史數據或計算盤前指標。
*   **更新資產池 (Universe)**: 基於盤前信息篩選出當日要關注的股票。
*   **檢索 Pipeline 輸出**: 獲取 Pipeline 在前一交易日計算出的因子值或信號，並儲存到 `context` 中，供 `handle_data()` 使用。

!!! important
    `before_trading_start()` 函數 **不能** 用於下達交易訂單。訂單必須在市場開放時間內，通常在 `handle_data()` 中執行。

#### 2.2範例
```python
from zipline.api import pipeline_output

def before_trading_start(context, data):
    # 獲取 Pipeline 在前一交易日計算的結果，並存儲到 context 中
    context.pipeline_data = pipeline_output('my_strategy_pipeline')
    # 可以進行一些盤前數據的篩選或處理
    if not context.pipeline_data.empty:
        context.today_factors = context.pipeline_data['SMA']
    else:
        context.today_factors = None
```

---

## 3. handle_data(context, data)

*   **用途**: 執行核心交易邏輯。
*   **執行時機**: 在回測的每個時間單位（例如，每日或每分鐘）都會被呼叫。
*   **參數**:
    *   `context`: 策略狀態物件。
    *   `data`: 數據物件，提供當前時間點可用的市場數據（例如，最新價格、成交量）。

#### 3.1常見操作
*   **獲取市場數據**: 使用 `data.current()` 或 `data.history()` 獲取當前或歷史的價格、成交量等信息。
*   **計算交易信號**: 根據技術指標、因子值或其他邏輯判斷買賣時機。
*   **下達訂單**: 使用 `order()`, `order_target()`, `order_percent()`, `order_target_percent()` 等函數執行交易。
*   **記錄數據**: 使用 `record()` 函數記錄您想要在回測結果中追蹤的數據。

#### 3.2範例
```python
from zipline.api import order_target_percent

def handle_data(context, data):
    # 檢查是否有 Pipeline 數據可用
    if context.today_factors is None or context.my_stock not in context.today_factors.index:
        return

    current_sma = context.today_factors.loc[context.my_stock]
    current_price = data.current(context.my_stock, 'price')

    # 簡單的均線突破策略：如果股價高於均線，則全倉買入
    if current_price > current_sma and not context.trading_signal_triggered:
        order_target_percent(context.my_stock, 1.0) # 全倉買入
        context.trading_signal_triggered = True
    # 如果股價低於均線，且已持有，則清倉
    elif current_price < current_sma and context.my_stock in context.portfolio.positions:
        order_target_percent(context.my_stock, 0.0) # 清倉
        context.trading_signal_triggered = False

    # 記錄數據 (例如股價和均線，方便分析)
    record(price=current_price, sma=current_sma)
```

---

## 4. analyze(context, results)

*   **用途**: 回測結束後的績效分析和視覺化。
*   **執行時機**: 在整個回測流程完成後僅執行 **一次**。
*   **參數**:
    *   `context`: 策略狀態物件 (與 `initialize` 和 `handle_data` 中的 `context` 相同)。
    *   `results`: 一個 `pandas.DataFrame`，包含了回測期間每日的績效數據 (例如，報酬率、資金曲線、最大回撤等)。

#### 4.1常見操作
*   **使用 Pyfolio 產生 Tearsheet**: 將 `results` 數據傳遞給 Pyfolio，生成標準的績效分析報表。
*   **自定義圖表繪製**: 使用 Matplotlib 或 Seaborn 等庫繪製自定義的績效圖表。
*   **計算自定義指標**: 從 `results` 中提取數據，計算策略特有的指標。

#### 4.2範例
```python
import matplotlib.pyplot as plt
import pyfolio
from pyfolio.utils import extract_rets_pos_txn_from_zipline

def analyze(context, results):
    # 繪製投資組合價值曲線
    results['portfolio_value'].plot(figsize=(10, 6))
    plt.title('Portfolio Value Over Time')
    plt.xlabel('Date')
    plt.ylabel('Portfolio Value')
    plt.grid(True)
    plt.show()

    # 使用 Pyfolio 生成績效報表
    returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)
    benchmark_rets = results.benchmark_return # 假設 benchmark_return 存在於 results 中

    # 時區標準化 (為 Pyfolio 準備)
    returns.index = returns.index.tz_localize(None).tz_localize('UTC')
    positions.index = positions.index.tz_localize(None).tz_localize('UTC')
    transactions.index = transactions.index.tz_localize(None).tz_localize('UTC')
    benchmark_rets.index = benchmark_rets.index.tz_localize(None).tz_localize('UTC')

    pyfolio.tears.create_full_tear_sheet(
        returns=returns,
        positions=positions,
        transactions=transactions,
        benchmark_rets=benchmark_rets
    )
    plt.show() # 確保 Pyfolio 的圖表顯示
```