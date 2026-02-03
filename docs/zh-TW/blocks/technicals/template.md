# 技術指標架構 - Code 模板

本頁提供可直接使用的 Code Template，並標註需要自定義的部分。

---

## 📋 模板總覽

我們將技術指標回測流程拆解為四個模塊，請依照你的需求組裝：

| 模塊 (Module) | 核心功能 | 你的任務 (Action) |
| :--- | :--- | :--- |
| **M1. 基礎建設** | `環境設定` `數據匯入` | 🟢 **設定參數** (回測區間、資金、標的) |
| **M2. 初始設定** | `initialize` `全域變數` | 🔵 **定義參數** (指標週期、滑價、手續費) |
| **M3. 交易核心** | `handle_data` `指標計算` | 🔥 **寫下買賣訊號 (黃金交叉、RSI...)** |
| **M4. 執行引擎** | `run_algorithm` `績效圖表` | 🔒 **直接執行** (通常無需修改) |

---

## 🎯 完整模板

### Module 1: 環境設定 & 數據匯入
```python
# ====================================
# Module 1: 環境設定 & 數據匯入
# ====================================

import os
import pandas as pd
import numpy as np
import tejapi
import matplotlib.pyplot as plt
import talib

# TEJ API 設定
os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'
os.environ['TEJAPI_KEY'] = 'your_key'

# 🔧 自定義：回測參數
start_date = '2018-12-30'
end_date = '2023-05-26'
capital_base = 1e6  # 初始資金

# 🔧 自定義：標的股票（通常 1-10 檔）
ticker = '2330'  # 台積電

# 設定環境變數（供 zipline ingest 使用）
os.environ['mdate'] = f'{start_date} {end_date}'
os.environ['ticker'] = ticker

# ====================================
# 匯入股價資料到 Zipline
# ====================================
# 執行此指令（在 Jupyter 中用 ! 開頭）
# !zipline ingest -b tquant

# 或是使用 simple_ingest 函數匯入資料
from zipline.data.run_ingest import simple_ingest

print(f"開始匯入資料：{ticker}")
print(f"期間：{start_date} ~ {end_date}")

simple_ingest(
    name='tquant',               # Bundle 名稱
    tickers=ticker,              # 股票清單 (必須是 List)
    start_date=start_date.replace('-', ''), # 格式通常建議 YYYYMMDD
    end_date=end_date.replace('-', '')
)
```

---

### Module 2: 初始化函數
```python
# ====================================
# Module 2: 初始化函數
# ====================================

from zipline.api import (
    set_slippage, set_commission, set_benchmark,
    symbol, record, order, order_target, order_target_percent
)
from zipline.finance import commission, slippage

def initialize(context):
    """
    回測初始化函數
    
    用途：
    1. 設定交易成本
    2. 設定基準指數
    3. 初始化策略變數
    """
    # ====================================
    # 交易成本設定
    # ====================================
    # 滑價模型
    set_slippage(slippage.VolumeShareSlippage(
        volume_limit=1,      # 🔧 可調：最大成交量佔比（1 = 100%）
        price_impact=0.01    # 🔧 可調：價格衝擊（0.01 = 1%）
    ))
    
    # 手續費模型
    set_commission(commission.PerShare(
        cost=0.001425,       # 🔧 可調：每股手續費（0.1425%）
        min_trade_cost=20    # 最低手續費 20 元
    ))
    
    # 或使用台灣專用模型
    # set_commission(commission.Custom_TW_Commission(
    #     min_trade_cost=20,
    #     discount=0.6,
    #     tax=0.003
    # ))
    
    # ====================================
    # 基準設定
    # ====================================
    context.sym = symbol(ticker)  # 設定交易標的
    set_benchmark(context.sym)    # 設定基準（買入並持有）
    
    # ====================================
    # 策略變數初始化
    # ====================================
    context.i = 0                # 日期計數器
    context.invested = False     # 是否持有部位
    
    # 🔧 自定義：策略專用變數
    context.last_trade_day = 0   # 上次交易日（避免過度交易）
    context.buy_price = 0        # 買入價格（用於停損停利）
```

---

### Module 3: 每日執行函數 🔥

這是整個策略的**核心**，所有技術指標計算和交易邏輯都在這裡。

#### 📌 模板 A：雙線交叉（最常用）
```python
# ====================================
# Module 3A: 每日執行 - 雙線交叉
# ====================================

def handle_data(context, data):
    """
    每日執行函數
    
    邏輯：
    1. 抓取歷史 K 線
    2. 計算技術指標（快線、慢線）
    3. 判斷交叉訊號
    4. 執行交易
    """
    # ========================================
    # Step 1: 抓取歷史資料
    # ========================================
    # 🔧 自定義：需要多少天的資料
    window_length = 35  # MACD(12,26,9) 需要 26+9=35 天
    
    trailing_window = data.history(
        context.sym,
        'price',           # 欄位：'open', 'high', 'low', 'close', 'volume'
        window_length,
        '1d'               # 日線
    )
    
    # 檢查資料完整性
    if trailing_window.isnull().values.any():
        return  # 資料不足，跳過
    
    # ========================================
    # Step 2: 計算技術指標
    # ========================================
    # 🔥 自定義區：替換成你的指標
    
    # 範例 1: MACD
    short_ema = talib.EMA(trailing_window.values, timeperiod=12)
    long_ema = talib.EMA(trailing_window.values, timeperiod=26)
    dif = short_ema - long_ema
    macd = talib.EMA(dif, timeperiod=9)
    bar = dif - macd
    
    # 範例 2: 均線交叉
    # fast_ma = talib.SMA(trailing_window.values, timeperiod=5)
    # slow_ma = talib.SMA(trailing_window.values, timeperiod=20)
    
    # 範例 3: KD 指標
    # high = data.history(context.sym, 'high', window_length, '1d')
    # low = data.history(context.sym, 'low', window_length, '1d')
    # k, d = talib.STOCH(high.values, low.values, trailing_window.values)
    
    # ========================================
    # Step 3: 訊號判斷
    # ========================================
    buy = False
    sell = False
    
    # 🔥 自定義區：替換成你的進出場邏輯
    
    # 買入訊號：黃金交叉
    if (dif[-2] < macd[-2]) and (dif[-1] > macd[-1]) and (bar[-2] < 0) and (bar[-1] > 0):
        if not context.invested:
            buy = True
    
    # 賣出訊號：死亡交叉
    elif (dif[-2] > macd[-2]) and (dif[-1] < macd[-1]) and (bar[-2] > 0) and (bar[-1] < 0):
        if context.invested:
            sell = True
    
    # ========================================
    # Step 4: 執行交易
    # ========================================
    if buy:
        order_target(context.sym, 1000)  # 🔧 可調：買入股數
        context.invested = True
        context.buy_price = data.current(context.sym, 'price')
        print(f"[{data.current_dt.date()}] 買入訊號，價格: {context.buy_price:.2f}")
    
    elif sell:
        order_target(context.sym, 0)  # 清空部位
        context.invested = False
        sell_price = data.current(context.sym, 'price')
        profit = ((sell_price / context.buy_price) - 1) * 100
        print(f"[{data.current_dt.date()}] 賣出訊號，價格: {sell_price:.2f}, 報酬: {profit:.2f}%")
    
    # ========================================
    # Step 5: 記錄變數（用於後續分析）
    # ========================================
    record(
        price=data.current(context.sym, 'close'),
        dif=dif[-1],
        macd=macd[-1],
        bar=bar[-1],
        buy=buy,
        sell=sell
    )
    
    context.i += 1
```

#### 📌 模板 B：突破策略
```python
# ====================================
# Module 3B: 每日執行 - 突破策略
# ====================================

def handle_data(context, data):
    """
    突破策略邏輯
    
    買入：價格突破上軌
    賣出：價格跌破下軌
    """
    # ========================================
    # 抓取歷史資料
    # ========================================
    window_length = 20
    trailing_window = data.history(context.sym, 'close', window_length + 1, '1d')
    
    if trailing_window.isnull().values.any():
        return
    
    # ========================================
    # 計算技術指標
    # ========================================
    # 🔥 自定義區：計算上軌、下軌
    
    # 範例 1: 布林通道
    upper, middle, lower = talib.BBANDS(
        trailing_window.values,
        timeperiod=20,
        nbdevup=2,    # 上軌：中軌 + 2 倍標準差
        nbdevdn=2     # 下軌：中軌 - 2 倍標準差
    )
    
    # 範例 2: 唐奇安通道
    # upper = trailing_window.rolling(20).max().iloc[-1]
    # lower = trailing_window.rolling(20).min().iloc[-1]
    
    # 範例 3: 固定百分比通道
    # middle = talib.SMA(trailing_window.values, timeperiod=20)
    # upper = middle[-1] * 1.05
    # lower = middle[-1] * 0.95
    
    current_price = data.current(context.sym, 'price')
    
    # ========================================
    # 訊號判斷
    # ========================================
    buy = False
    sell = False
    
    # 🔥 自定義區：突破邏輯
    
    # 買入：突破上軌
    if (current_price > upper[-1]) and not context.invested:
        buy = True
    
    # 賣出：跌破下軌
    elif (current_price < lower[-1]) and context.invested:
        sell = True
    
    # ========================================
    # 執行交易
    # ========================================
    if buy:
        order_target(context.sym, 1000)
        context.invested = True
        print(f"[{data.current_dt.date()}] 突破買入，價格: {current_price:.2f}")
    
    elif sell:
        order_target(context.sym, 0)
        context.invested = False
        print(f"[{data.current_dt.date()}] 跌破賣出，價格: {current_price:.2f}")
    
    # ========================================
    # 記錄變數
    # ========================================
    record(
        price=current_price,
        upper=upper[-1],
        middle=middle[-1],
        lower=lower[-1],
        buy=buy,
        sell=sell
    )
    
    context.i += 1
```

#### 📌 模板 C：反轉策略
```python
# ====================================
# Module 3C: 每日執行 - 反轉策略
# ====================================

def handle_data(context, data):
    """
    反轉策略邏輯
    
    買入：指標超賣（價格偏離均線）
    賣出：指標超買
    """
    # ========================================
    # 抓取歷史資料
    # ========================================
    window_length = 20
    trailing_window = data.history(context.sym, 'close', window_length + 1, '1d')
    
    if trailing_window.isnull().values.any():
        return
    
    # ========================================
    # 計算技術指標
    # ========================================
    # 🔥 自定義區：計算反轉指標
    
    # 範例 1: 乖離率
    ema = talib.EMA(trailing_window.values, timeperiod=7)
    current_price = data.current(context.sym, 'price')
    bias = ((current_price - ema[-1]) / ema[-1]) * 100
    
    # 範例 2: RSI
    # rsi = talib.RSI(trailing_window.values, timeperiod=14)
    
    # 範例 3: KD 指標
    # high = data.history(context.sym, 'high', window_length, '1d')
    # low = data.history(context.sym, 'low', window_length, '1d')
    # k, d = talib.STOCH(high.values, low.values, trailing_window.values)
    
    # ========================================
    # 額外過濾：價格突破
    # ========================================
    high_prices = data.history(context.sym, 'high', 7, '1d')
    low_prices = data.history(context.sym, 'low', 7, '1d')
    
    highest_high = high_prices.max()
    lowest_low = low_prices.min()
    
    # ========================================
    # 訊號判斷
    # ========================================
    buy = False
    sell = False
    
    # 🔥 自定義區：反轉邏輯
    
    # 買入：負乖離 + 創新低
    if (bias < -5) and (current_price < lowest_low) and not context.invested:
        buy = True
    
    # 賣出：正乖離 + 創新高
    elif (bias > 5) and (current_price > highest_high) and context.invested:
        sell = True
    
    # 範例：RSI 超買超賣
    # if (rsi[-1] < 30) and not context.invested:  # 超賣
    #     buy = True
    # elif (rsi[-1] > 70) and context.invested:    # 超買
    #     sell = True
    
    # ========================================
    # 執行交易
    # ========================================
    if buy:
        order_target(context.sym, 1000)
        context.invested = True
        context.buy_price = current_price
        print(f"[{data.current_dt.date()}] 反轉買入，乖離: {bias:.2f}%")
    
    elif sell:
        order_target(context.sym, 0)
        context.invested = False
        profit = ((current_price / context.buy_price) - 1) * 100
        print(f"[{data.current_dt.date()}] 反轉賣出，乖離: {bias:.2f}%, 報酬: {profit:.2f}%")
    
    # ========================================
    # 記錄變數
    # ========================================
    record(
        price=current_price,
        ema=ema[-1],
        bias=bias,
        buy=buy,
        sell=sell
    )
    
    context.i += 1
```

#### 📌 模板 D：多指標組合
```python
# ====================================
# Module 3D: 每日執行 - 多指標組合
# ====================================

def handle_data(context, data):
    """
    多指標組合策略
    
    邏輯：多個指標同時確認才交易
    """
    # ========================================
    # 抓取歷史資料
    # ========================================
    window_length = 50  # 取較長的週期
    close = data.history(context.sym, 'close', window_length, '1d')
    high = data.history(context.sym, 'high', window_length, '1d')
    low = data.history(context.sym, 'low', window_length, '1d')
    volume = data.history(context.sym, 'volume', window_length, '1d')
    
    if close.isnull().values.any():
        return
    
    # ========================================
    # 計算多個指標
    # ========================================
    # 指標 1: MACD
    macd, signal, hist = talib.MACD(close.values, fastperiod=12, slowperiod=26, signalperiod=9)
    
    # 指標 2: RSI
    rsi = talib.RSI(close.values, timeperiod=14)
    
    # 指標 3: 均線
    ma20 = talib.SMA(close.values, timeperiod=20)
    ma60 = talib.SMA(close.values, timeperiod=60)
    
    # 指標 4: 成交量
    avg_volume = talib.SMA(volume.values, timeperiod=20)
    
    current_price = data.current(context.sym, 'price')
    current_volume = data.current(context.sym, 'volume')
    
    # ========================================
    # 訊號判斷（多條件確認）
    # ========================================
    buy = False
    sell = False
    
    # 🔥 自定義區：組合邏輯
    
    # 買入條件（需全部滿足）
    condition_1 = (macd[-1] > signal[-1])           # MACD 多頭
    condition_2 = (rsi[-1] > 50) and (rsi[-1] < 70) # RSI 中性偏多
    condition_3 = (current_price > ma20[-1])        # 站上 20 日均線
    condition_4 = (ma20[-1] > ma60[-1])             # 短均 > 長均
    condition_5 = (current_volume > avg_volume[-1]) # 量能放大
    
    if all([condition_1, condition_2, condition_3, condition_4, condition_5]) and not context.invested:
        buy = True
    
    # 賣出條件（任一滿足）
    exit_1 = (macd[-1] < signal[-1])           # MACD 死叉
    exit_2 = (rsi[-1] > 70)                    # RSI 超買
    exit_3 = (current_price < ma20[-1])        # 跌破 20 日均線
    
    if any([exit_1, exit_2, exit_3]) and context.invested:
        sell = True
    
    # ========================================
    # 執行交易
    # ========================================
    if buy:
        order_target_percent(context.sym, 1.0)  # 全倉買入
        context.invested = True
        context.buy_price = current_price
        print(f"[{data.current_dt.date()}] 多指標確認買入")
        print(f"  MACD: {macd[-1]:.2f}, RSI: {rsi[-1]:.2f}, 價格: {current_price:.2f}")
    
    elif sell:
        order_target(context.sym, 0)
        context.invested = False
        profit = ((current_price / context.buy_price) - 1) * 100
        print(f"[{data.current_dt.date()}] 觸發賣出")
        print(f"  報酬: {profit:.2f}%")
    
    # ========================================
    # 記錄變數
    # ========================================
    record(
        price=current_price,
        macd=macd[-1],
        signal=signal[-1],
        rsi=rsi[-1],
        ma20=ma20[-1],
        ma60=ma60[-1],
        buy=buy,
        sell=sell
    )
    
    context.i += 1
```

---

### Module 4: 績效分析 & 執行回測
```python
# ====================================
# Module 4: 績效分析函數
# ====================================

def analyze(context, perf):
    """
    績效分析與視覺化
    """
    import matplotlib.pyplot as plt
    
    fig = plt.figure(figsize=(14, 10))
    
    # ========================================
    # 上圖：投資組合價值
    # ========================================
    ax1 = fig.add_subplot(311)
    perf['portfolio_value'].plot(ax=ax1, label='Portfolio Value')
    ax1.set_ylabel('Portfolio Value (TWD)')
    ax1.set_title('Portfolio Performance')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # ========================================
    # 中圖：累積報酬 vs 基準
    # ========================================
    ax2 = fig.add_subplot(312)
    cumulative_returns = (1 + perf['returns']).cumprod() - 1
    benchmark_returns = (1 + perf['benchmark_return']).cumprod() - 1
    
    cumulative_returns.plot(ax=ax2, label='Strategy', linewidth=2)
    benchmark_returns.plot(ax=ax2, label='Buy & Hold', linewidth=2, alpha=0.7)
    ax2.set_ylabel('Cumulative Returns')
    ax2.set_title('Strategy vs Buy & Hold')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # ========================================
    # 下圖：技術指標 + 買賣點
    # ========================================
    ax3 = fig.add_subplot(313)
    
    # 繪製價格
    perf['price'].plot(ax=ax3, label='Price', color='black', linewidth=1.5)
    
    # 繪製技術指標（根據你的策略調整）
    if 'dif' in perf.columns and 'macd' in perf.columns:
        # MACD 策略
        ax3_twin = ax3.twinx()
        perf['dif'].plot(ax=ax3_twin, label='DIF', color='blue', alpha=0.5)
        perf['macd'].plot(ax=ax3_twin, label='MACD', color='red', alpha=0.5)
        ax3_twin.set_ylabel('MACD')
        ax3_twin.legend(loc='upper right')
    
    elif 'upper' in perf.columns and 'lower' in perf.columns:
        # 布林通道策略
        perf['upper'].plot(ax=ax3, label='Upper Band', color='red', alpha=0.5)
        perf['lower'].plot(ax=ax3, label='Lower Band', color='green', alpha=0.5)
    
    # 標記買賣點
    buy_signals = perf[perf['buy'] == True]
    sell_signals = perf[perf['sell'] == True]
    
    ax3.plot(
        buy_signals.index,
        buy_signals['price'],
        '^',
        markersize=10,
        color='green',
        label='Buy'
    )
    ax3.plot(
        sell_signals.index,
        sell_signals['price'],
        'v',
        markersize=10,
        color='red',
        label='Sell'
    )
    
    ax3.set_ylabel('Price (TWD)')
    ax3.set_xlabel('Date')
    ax3.set_title('Price & Indicators')
    ax3.legend(loc='upper left')
    ax3.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()
    
    # 儲存績效數據
    perf.to_csv(f'performance_{ticker}.csv')
    print(f"\n績效數據已儲存至: performance_{ticker}.csv")

# ====================================
# 執行回測
# ====================================
from zipline import run_algorithm

print("="*60)
print("開始回測技術指標策略")
print("="*60)

results = run_algorithm(
    start=pd.Timestamp(start_date, tz='utc'),
    end=pd.Timestamp(end_date, tz='utc'),
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    bundle='tquant',
    capital_base=capital_base,
    data_frequency='daily'
)

print("\n回測完成！")

# ====================================
# 績效統計
# ====================================
print("\n========== 績效摘要 ==========")
total_return = (results['portfolio_value'].iloc[-1] / capital_base - 1) * 100
buy_hold_return = (results['benchmark_period_return'].iloc[-1]) * 100

print(f"初始資金: {capital_base:,.0f} 元")
print(f"最終資金: {results['portfolio_value'].iloc[-1]:,.0f} 元")
print(f"策略總報酬: {total_return:.2f}%")
print(f"買入持有報酬: {buy_hold_return:.2f}%")
print(f"超額報酬: {(total_return - buy_hold_return):.2f}%")
print(f"最大回撤: {results['max_drawdown'].min() * 100:.2f}%")
print(f"夏普比率: {results['sharpe'].iloc[-1]:.2f}")

# 交易統計
transactions = results['transactions']
if len(transactions) > 0:
    num_trades = len(transactions)
    print(f"交易次數: {num_trades}")
    print(f"平均持有天數: {len(results) / (num_trades / 2):.0f} 天")
```

---

## 🎯 使用指南

### Step 1: 選擇模板
根據你的策略類型選擇：

- **模板 A（雙線交叉）**：MACD、均線交叉、KD 交叉
- **模板 B（突破策略）**：布林通道、唐奇安通道
- **模板 C（反轉策略）**：乖離率、RSI、KD 超買超賣
- **模板 D（多指標組合）**：綜合判斷

### Step 2: 自定義核心邏輯
修改 `handle_data()` 函數中的 🔥 標記區域：
```python
# 1. 調整歷史資料長度
window_length = 35  # 改成你需要的天數

# 2. 替換技術指標計算
short_ema = talib.EMA(trailing_window.values, timeperiod=12)  # 改成你的指標

# 3. 修改進出場邏輯
if (your_condition):
    buy = True
```

### Step 3: 調整參數
```python
# 回測期間
start_date = '2020-01-01'
end_date = '2023-12-31'

# 交易標的
ticker = '2330'  # 改成你想測試的股票

# 交易股數
order_target(context.sym, 1000)  # 改成你的部位大小
```

### Step 4: 執行回測
```python
results = run_algorithm(...)
```

---

## 📚 常用技術指標速查

### 趨勢指標
```python
# 移動平均
sma = talib.SMA(close, timeperiod=20)
ema = talib.EMA(close, timeperiod=20)
wma = talib.WMA(close, timeperiod=20)

# MACD
macd, signal, hist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)

# ADX（趨勢強度）
adx = talib.ADX(high, low, close, timeperiod=14)
```

### 震盪指標
```python
# RSI
rsi = talib.RSI(close, timeperiod=14)

# KD 指標
k, d = talib.STOCH(high, low, close, 
                   fastk_period=14, slowk_period=3, slowd_period=3)

# CCI
cci = talib.CCI(high, low, close, timeperiod=14)

# 威廉指標
willr = talib.WILLR(high, low, close, timeperiod=14)
```

### 通道指標
```python
# 布林通道
upper, middle, lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2)

# 唐奇安通道（手寫）
upper_band = close.rolling(20).max()
lower_band = close.rolling(20).min()
```

### 成交量指標
```python
# OBV
obv = talib.OBV(close, volume)

# 成交量移動平均
vol_ma = talib.SMA(volume, timeperiod=20)
```

---

## 💡 進階技巧

### 技巧 1: 避免過度交易
```python
# 加入冷卻期
def handle_data(context, data):
    # ... 計算訊號 ...
    
    if buy_signal:
        # 檢查距離上次交易是否超過 5 天
        if context.i - context.last_trade_day > 5:
            order_target(stock, 1000)
            context.last_trade_day = context.i
```

### 技巧 2: 停損停利
```python
def handle_data(context, data):
    current_price = data.current(context.sym, 'price')
    
    # 停損：虧損超過 10%
    if context.invested and (current_price < context.buy_price * 0.9):
        order_target(context.sym, 0)
        context.invested = False
        print(f"停損出場: {current_price}")
    
    # 停利：獲利超過 20%
    elif context.invested and (current_price > context.buy_price * 1.2):
        order_target(context.sym, 0)
        context.invested = False
        print(f"停利出場: {current_price}")
```

### 技巧 3: 金字塔加碼
```python
def handle_data(context, data):
    current_price = data.current(context.sym, 'price')
    
    if buy_signal:
        if not context.invested:
            # 首次買入 1000 股
            order(context.sym, 1000)
            context.invested = True
            context.buy_price = current_price
        
        elif current_price < context.buy_price * 0.95:
            # 價格回檔 5%，加碼 500 股
            order(context.sym, 500)
            print(f"加碼: {current_price}")
```

### 技巧 4: 動態部位管理
```python
def handle_data(context, data):
    # 根據 ATR 調整部位大小
    atr = talib.ATR(high.values, low.values, close.values, timeperiod=14)
    
    # 固定風險：每筆交易風險 1%
    risk_per_trade = context.portfolio.portfolio_value * 0.01
    position_size = risk_per_trade / (atr[-1] * 2)  # 以 2 倍 ATR 作為停損距離
    
    if buy_signal:
        order(context.sym, int(position_size))
```

---

## 📚 相關資源

- **架構說明**：[index.md](index.md)
- **案例學習**：
  - [MACD 策略](case-macd.md)
  - [乖離率策略](case-bias.md)
  - [布林通道策略](case-bollinger.md)
- **常見問題**：[faq.md](faq.md)

---

**👉 Next Step:** 選擇一個模板，參考對應的 case study，開始開發你的技術指標策略！