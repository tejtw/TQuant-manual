# 教學 - 快速入門: 你的第一個期貨策略

!!! info
    本篇教學將引導您使用 TQuant Lab，以經典的「黃金交叉」策略為基礎，完成第一個期貨回測。我們將交易台灣指數期貨 (小台指)，從策略建構、回測執行到績效分析，體驗完整的量化交易流程。

## 策略概念：黃金交叉

黃金交叉 (Golden Cross) 是一種常見的技術分析訊號，屬於趨勢跟蹤策略。它基於兩條不同週期的移動平均線 (Moving Average, MA) 來判斷趨勢的轉換。

*   **短期移動平均線 (Short MA)** ：反應較近期的價格變化，較為靈敏。
*   **長期移動平均線 (Long MA)** ：反應較長期的價格趨勢，較為平滑。

策略的核心邏輯非常直觀：

1.  **買進訊號 (黃金交叉)** ：當 `短期均線` 由下往上穿越 `長期均線` 時，代表短期趨勢轉強，可能是一波上漲行情的開端，因此建立多頭部位。
2.  **賣出訊號 (死亡交叉)** ：當 `短期均線` 由上往下穿越 `長期均線` 時，代表短期趨勢轉弱，可能是下跌的開始，因此平倉出場。

在本範例中，我們將使用 **3 日均線** 作為短期線， **10 日均線** 作為長期線。

---

## 實作步驟

接下來，我們將透過 6 個步驟，在 TQuant Lab 中從零開始實作這個策略。

### 步驟 1：環境設定與資料導入

在開始之前，我們需要設定 TQuant Lab 的執行環境，並導入必要的套件。

!!! warning
    請確保您已將 TEJ API Key 設定至環境變數中。若您不熟悉如何設定，請參考 [環境建置](setup.md) 教學。

**環境設定程式碼** ：

```python
import os
import pandas as pd
from zipline import run_algorithm
from zipline.api import (
    set_benchmark,
    set_commission,
    set_slippage,
    continuous_future,
    order_target_percent,
    symbol,
    record
)
from zipline.finance.commission import PerContract
from zipline.finance.slippage import FixedSlippage
from zipline.utils.calendar_utils import get_calendar
import pyfolio as pf

# 設定 TEJ API Key (請替換成您的金鑰)
os.environ['TEJAPI_KEY'] = 'YOUR_API_KEY'
os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'

# 設定回測的股票池與資料期間
os.environ['ticker'] = 'IR0001' # 加權指數作為 Benchmark
os.environ['future'] = 'MTX'   # 小台指期貨
os.environ['mdate'] = '20200101 20241231'
```

設定完成後，我們需要下載並「Ingest」期貨資料到 Zipline 的資料庫中。

```bash
!zipline ingest -b tquant_future
```

!!! note
    `ingest` 指令只需在初次使用或更新資料時執行一次。若您在 Jupyter Notebook 中執行，請保留 `!` 符號；若在終端機 (Terminal) 執行，請移除 `!`。

### 步驟 2：定義 `initialize` 函式

`initialize` 函式會在回測開始時執行一次，用於進行初始設定，例如設定手續費、滑價、Benchmark，以及定義我們要交易的資產。

**initialize 函式程式碼** ：

```python
def initialize(context):
    """
    回測初始化函式
    """
    # 1. 設定 Benchmark
    set_benchmark(symbol('IR0001'))

    # 2. 設定手續費模型
    set_commission(
        futures=PerContract(
            cost=15,          # 每口合約手續費
            exchange_fee=0
        )
    )

    # 3. 設定滑價模型
    set_slippage(futures=FixedSlippage(spread=1.0))

    # 4. 定義要交易的資產 (小台指連續合約)
    context.asset = continuous_future(
        'MTX',
        offset=0,
        roll='calendar',
        adjustment='add'
    )
```

### 步驟 3：定義 `handle_data` 函式

`handle_data` 是策略的核心，它會在每個交易日被呼叫一次，用於處理當天的資料並產生交易決策。

**handle_data 函式程式碼** ：

```python
def handle_data(context, data):
    """
    每個交易日執行的策略邏輯
    """
    # 1. 取得歷史價格資料
    hist = data.history(
        context.asset,
        fields='close',
        bar_count=11, # 需要 10 日 MA，所以至少需要 10+1 根 K 棒
        frequency='1d'
    )

    # 2. 計算長短期均線
    short_ma = hist.rolling(window=3).mean().iloc[-1]
    long_ma = hist.rolling(window=10).mean().iloc[-1]

    # 取得昨日的均線值
    short_ma_prev = hist.rolling(window=3).mean().iloc[-2]
    long_ma_prev = hist.rolling(window=10).mean().iloc[-2]

    # 3. 判斷是否持有部位
    open_orders = context.portfolio.positions
    in_position = context.asset in open_orders

    # 4. 產生交易訊號
    # 黃金交叉: 昨日短均 < 昨日長均 且 今日短均 > 今日長均
    buy_signal = (short_ma_prev < long_ma_prev) and (short_ma > long_ma)

    # 死亡交叉: 昨日短均 > 昨日長均 且 今日短均 < 今日長均
    sell_signal = (short_ma_prev > long_ma_prev) and (short_ma < long_ma)

    # 5. 執行交易
    if buy_signal and not in_position:
        # 全力買進
        order_target_percent(asset=context.asset, target=1.0)
    elif sell_signal and in_position:
        # 平倉
        order_target_percent(asset=context.asset, target=0.0)

    # 記錄每日的均線值以供後續分析
    record(
        short_ma=short_ma,
        long_ma=long_ma
    )
```

### 步驟 4：執行回測

當 `initialize` 和 `handle_data` 都定義好後，我們就可以使用 `run_algorithm` 來執行整個回測。

**回測執行程式碼** ：

```python
# 設定回測期間與初始資金
start_date = pd.Timestamp('2020-01-02', tz='utc')
end_date = pd.Timestamp('2024-10-31', tz='utc')
initial_capital = 1000000 # 初始資金 100 萬

# 執行回測
results = run_algorithm(
    start=start_date,
    end=end_date,
    initialize=initialize,
    handle_data=handle_data,
    capital_base=initial_capital,
    data_frequency='daily',
    bundle='tquant_future',
    trading_calendar=get_calendar('TEJ') # 使用 TEJ 交易日曆
)
```

### 步驟 5：分析績效報表

回測完成後，`run_algorithm` 會返回一個 `results` DataFrame，其中包含了詳細的回測數據。我們可以利用 `pyfolio` 套件來產生專業的視覺化績效報表。

**績效分析程式碼** ：

```python
# 產生 Pyfolio 績效報表
returns, positions, transactions = pf.utils.extract_rets_pos_txn_from_zipline(results)

pf.create_full_tear_sheet(
    returns,
    positions=positions,
    transactions=transactions,
    benchmark_rets=results.benchmark_period_return
)
```

`create_full_tear_sheet` 會輸出一系列圖表，包含：

*   **累積報酬率** ：策略與 Benchmark 的績效對比。
*   **水下圖 (Drawdown)** ：策略期間內的最大回撤。
*   **月度/年度報酬率** ：不同時間區間的報酬分佈。
*   **各項績效指標** ：如 Sharpe Ratio, Calmar Ratio, Alpha, Beta 等。

---

## 下一步

恭喜您完成了第一個期貨策略回測！您可以嘗試：

*   **調整參數** ：試著改變長短均線的週期 (例如 5/20, 10/30)，觀察績效變化。
*   **加入風控** ：在 `handle_data` 中加入停損 (Stop-loss) 或停利 (Take-profit) 邏輯。
*   **探索更多策略** ：參考 `TQuant-Lab/example` 資料夾中的其他範例，學習更進階的策略寫法。