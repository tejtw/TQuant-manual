# 教學：建立你的第一個期貨策略

這份教學文件旨在引導初學者使用 TQuant Lab，從零開始建立一個完整且可執行的期貨回測策略。我們將以一個簡單的「均線交叉策略」為範例，說明一個期貨策略的完整生命週期，包含資料準備、策略初始化、交易邏輯、轉倉處理，以及最終的回測執行。

---

## 步驟 1：資料準備 (Data Preparation)

在進行任何回測之前，我們需要先將市場資料下載到本地環境。Zipline 使用 `ingest` 命令來完成這個步驟。

以下程式碼會設定您的 TEJ API 金鑰，並指定要下載的期貨商品（此處為台指期 `TX`）與對應的指數（`IR0001` 作為大盤指標），然後執行 `ingest`。

```python
import os

# 填入您的 TEJ API Key
os.environ['TEJAPI_KEY'] = 'YOUR_KEY'
os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'

# 設定要下載的期貨與對應的指數/股票
os.environ['future'] = 'TX'
os.environ['ticker'] = 'IR0001'

# 設定下載的起訖日期
os.environ['mdate'] = '20100101 20250930'

# 執行 ingest 命令 (首次執行或需更新數據時取消註解)
# !zipline ingest -b tquant_future
```
> **注意**：`ingest` 命令只需要在第一次執行，或當您需要更新本地資料時執行。在平常的策略開發中，可以將其註解掉以節省時間。

---

## 步驟 2：策略架構 - 初始化與排程

`initialize` 函數是 Zipline 策略的起點，它在整個回測開始時只會被呼叫一次。所有關於策略的基礎設定都在這裡完成。

- **`continuous_future(...)`**: 建立一個連續合約物件，讓 Zipline 自動處理換月，方便我們對一個連續的價格序列進行分析。
- **`set_commission()` / `set_slippage()`**: 設定交易成本，包含手續費與滑價。
- **`set_benchmark()`**: 設定績效比較的基準，通常為大盤指數。
- **`schedule_function(...)`**: Zipline 的排程器，用來安排在回測的特定時間點（如每日開盤、收盤）執行指定的函數。

```python
from zipline.api import (
    continuous_future, schedule_function, date_rules, time_rules,
    set_commission, set_slippage, set_benchmark, symbol
)
from zipline.finance import commission, slippage

def initialize(context):
    # --- 1. 設定要交易的資產 ---
    # 建立台指期的連續近月合約
    context.future = continuous_future('TX', offset=0, roll='calendar', adjustment='add')
    
    # --- 2. 設定交易成本 ---
    set_commission(futures=commission.PerContract(cost=200, exchange_fee=0))
    set_slippage(futures=slippage.FixedSlippage(spread=6))
    
    # --- 3. 設定策略參數與績效基準 ---
    context.ma_period = 20  # 設定均線計算週期
    set_benchmark(symbol('IR0001'))
    
    # --- 4. 設定排程 ---
    # 每日開盤後 30 分鐘，執行主要的交易邏輯
    schedule_function(daily_trade, date_rules.every_day(), time_rules.market_open(minutes=30))
    # 每日收盤時，檢查是否需要轉倉
    schedule_function(roll_futures, date_rules.every_day(), time_rules.market_close())
```

---

## 步驟 3：撰寫交易邏輯

`daily_trade` 函數是我們策略的核心，它會根據我們在 `initialize` 中設定的排程被每日呼叫。

這個範例策略的邏輯很簡單：
1.  使用 `data.history()` 獲取過去一段時間的歷史價格。
2.  計算短期（10日）與長期（20日）的移動平均線 (MA)。
3.  當短期均線由下往上穿越長期均線時（黃金交叉），建立多單。
4.  當短期均線由上往下穿越長期均線時（死亡交叉），平倉。
5.  使用 `order_target()` 函數來下單，它會自動計算需要買賣的口數以達到我們的目標部位。
6.  使用 `record()` 記錄我們想要在圖表上觀察的數值。

```python
from zipline.api import order_target, record, data

def daily_trade(context, data):
    # --- 1. 獲取歷史數據 ---
    hist = data.history(context.future, 'price', bar_count=context.ma_period + 5, frequency='1d')
    
    # --- 2. 計算指標 ---
    short_ma = hist.rolling(window=10).mean().iloc[-1]
    long_ma = hist.rolling(window=context.ma_period).mean().iloc[-1]
    
    # --- 3. 產生交易信號 ---
    buy_signal = short_ma > long_ma
    sell_signal = short_ma < long_ma
    
    # --- 4. 取得當前合約與部位 ---
    # 必須先從連續合約物件中，取得當前應該交易的「具體」合約
    current_contract = data.current(context.future, 'contract')
    # 檢查目前台指期產品的總持倉口數
    current_position = context.portfolio.positions.get(current_contract, None)
    root_qty = current_position.amount if current_position else 0

    # --- 5. 執行下單邏輯 ---
    if buy_signal and root_qty == 0:
        order_target(current_contract, 1) # 目標持有 1 口多單
    elif sell_signal and root_qty != 0:
        order_target(current_contract, 0) # 平倉
        
    # --- 6. 記錄數據 ---
    record(price=hist.iloc[-1], short_ma=short_ma, long_ma=long_ma)
```

---

## 步驟 4：處理期貨轉倉

期貨合約有到期日。為了讓策略可以長期運行，我們必須在舊合約到期前，將部位「轉移」到新的合約上，這個過程稱為「轉倉」。`roll_futures` 函數就是專門用來處理這件事。

它的邏輯如下：
1.  每日收盤時檢查目前持有的所有期貨部位。
2.  計算該合約距離自動平倉日 (`auto_close_date`) 還有幾天。
3.  如果即將到期（例如，5天內），就執行轉倉：
    a. 取消所有掛在舊合約上的訂單。
    b. 將舊合約的部位平倉 (`order_target(old_contract, 0)`)。
    c. 在 `continuous_future` 指向的新合約上，建立相同數量的部位 (`order_target(new_contract, amount)`)。

```python
from zipline.api import get_open_orders, cancel_order

def roll_futures(context, data):
    for asset, pos in context.portfolio.positions.items():
        # 忽略非期貨資產或空部位
        if pos.amount == 0 or getattr(asset, 'auto_close_date', None) is None:
            continue
        
        # 計算距離到期日天數
        days_to_auto_close = (asset.auto_close_date.date() - data.current_session.date()).days
        if days_to_auto_close > 5:
            continue

        # 取得新的目標合約
        new_contract = data.current(context.future, "contract")
        if new_contract == asset:
            continue

        # 執行轉倉
        # 1. 取消舊合約的所有掛單
        for o in get_open_orders(asset):
            cancel_order(o.id)

        print(f"執行轉倉: 從 {asset.symbol} 到 {new_contract.symbol}")
        # 2. 平掉舊倉位
        order_target(asset, 0)
        # 3. 建立新倉位
        order_target(new_contract, pos.amount)
```

---

## 步驟 5：執行回測

當所有函數都定義好之後，最後一步就是呼叫 `run_algorithm()` 來啟動整個回測流程。

您需要提供回測的起訖日期、`initialize` 函數的名稱、初始資金、資料集名稱 (`bundle`) 等參數。回測結束後，它會回傳一個包含所有績效與自定義記錄數據的 `results` DataFrame。

```python
import pandas as pd
from zipline import run_algorithm
from zipline.utils.calendar_utils import get_calendar

results = run_algorithm(
    start=pd.Timestamp('2020-01-01', tz='utc'),
    end=pd.Timestamp('2024-09-30', tz='utc'),
    initialize=initialize,
    capital_base=1000000,
    data_frequency='daily',
    bundle='tquant_future',
    trading_calendar=get_calendar('TEJ')
)

# 您可以接著分析 results DataFrame
# print(results.head())
```

---

恭喜！您已經完成了一個完整的期貨策略。您可以試著調整均線的週期、修改交易信號的邏輯，或是更換不同的期貨商品，來觀察策略表現的變化。
