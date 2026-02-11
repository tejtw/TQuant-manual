# 案例 2：跟隨大戶策略

> **策略類型：** Pipeline 因子架構 - 籌碼分析  
> **交易標的：** 81 檔藍籌股  
> **調倉頻率：** 日度（每日開盤後）  
> **回測期間：** 2020-01-01 ~ 2023-08-15

---

## 📌 策略概述

跟隨大戶策略是基於 **籌碼面分析** 的量化策略，追蹤三大法人（外資、投信、自營商）的持股變化和買賣超動向。

### 核心理念

> **"Follow the smart money when they're still accumulating."**  
> 在聰明錢持續累積時跟進。

三大法人擁有：

- 📊 **資訊優勢**：研究團隊、產業調研
- 💰 **資金優勢**：影響股價走勢
- 🎯 **長期視角**：不做短線炒作

本策略的關鍵洞察：當三大法人 **買超** 但 **持股比率仍低於均值** 時，代表法人正在「建倉階段」，後續可能有一波漲勢。

### 策略特色

1. **雙重確認機制**：買超 + 持股率低於均線
2. **5 日移動平均**：過濾短期雜訊
3. **小額分散進場**：每次只用 5% 現金
4. **全數清倉出場**：發出賣出訊號立即出清
5. **藍籌股票池**：81 檔市值大、流動性好的股票

---

## 🎯 籌碼指標詳解

### 數據來源

**TEJ 三大法人資料：**
```python
# 使用 TejToolAPI 取得
columns = ['qfii_pct', 'fd_pct', 'dlr_pct', 'tot_ex']

# qfii_pct: 外資持股比率
# fd_pct: 投信持股比率
# dlr_pct: 自營商持股比率
# tot_ex: 三大法人合計買賣超
```

### 計算邏輯

**Step 1: 計算三大法人合計持股比率**
```python
Total_Pct = 外資持股比率 + 投信持股比率 + 自營商持股比率
```

**Step 2: 計算 5 日移動平均**
```python
pct_ma = SimpleMovingAverage(
    inputs=[CustomDataset.total_pct],
    window_length=5
)
```

**Step 3: 判斷買賣訊號**
```python
# 買入訊號：持股率 < 均線 且 買超
longs = (pct < pct_ma) & (vol > 0)

# 賣出訊號：持股率 > 均線 且 賣超
shorts = (pct > pct_ma) & (vol < 0)
```

### 訊號邏輯解析

**買入訊號的意義：**
```
情境：
- 三大法人今日買超 1000 張
- 但持股比率 30% < 5 日均線 32%

解讀：
→ 法人正在「建倉」
→ 持股還沒到高點
→ 後續可能持續買進
→ 給予買入訊號
```

**賣出訊號的意義：**
```
情境：
- 三大法人今日賣超 1000 張
- 且持股比率 35% > 5 日均線 33%

解讀：
→ 法人開始「出貨」
→ 持股已經偏高
→ 可能準備獲利了結
→ 給予賣出訊號
```

---

## 🔍 交易邏輯詳解

### 買入條件（必須同時滿足）

1. 三大法人合計買賣超 > 0（買超）
2. 三大法人合計持股率 < 5 日移動平均
3. 有足夠現金可用

### 賣出條件（必須同時滿足）

1. 三大法人合計買賣超 < 0（賣超）
2. 三大法人合計持股率 > 5 日移動平均
3. 該股票在投資組合中

### 資金管理

**買入：**
```python
# 每次買入使用可用現金的 5%
order_target_value(stock, cash * 0.05)
```

**賣出：**
```python
# 發出賣出訊號，全數清倉
order_target_percent(stock, 0)
```

---

## 💻 完整程式碼
```python
# ====================================
# 跟隨大戶策略 - 完整實作
# ====================================

import tejapi
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

# ====================================
# 環境設定
# ====================================
os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'
os.environ['TEJAPI_KEY'] = 'your_key'

tejapi.ApiConfig.api_key = os.getenv('TEJAPI_KEY')
tejapi.ApiConfig.api_base = os.getenv('TEJAPI_BASE')

# ====================================
# Zipline 套件引入
# ====================================
from zipline import run_algorithm
from zipline.api import (
    attach_pipeline, pipeline_output,
    date_rules, time_rules, record, schedule_function,
    commission, slippage, set_slippage, set_commission,
    order_target, order_target_value, order_target_percent,
    get_datetime, symbol
)
from zipline.data import bundles
from zipline.pipeline import Pipeline, CustomFactor
from zipline.pipeline.data import Column, DataSet
from zipline.pipeline.domain import TW_EQUITIES
from zipline.pipeline.loaders.frame import DataFrameLoader
from zipline.pipeline.factors import SimpleMovingAverage
from zipline.pipeline.data import TWEquityPricing
from zipline.pipeline.loaders import EquityPricingLoader
from zipline.pipeline.engine import SimplePipelineEngine

from TejToolAPI.TejToolAPI import get_history_data
from zipline.sources.TEJ_Api_Data import get_Benchmark_Return

from logbook import Logger, StderrHandler, INFO

import seaborn as sns
sns.set_style('whitegrid')
pd.set_option('display.expand_frame_repr', False)

log_handler = StderrHandler(
    format_string='[{record.time:%Y-%m-%d %H:%M:%S.%f}]: ' +
                  '{record.level_name}: {record.func_name}: {record.message}',
    level=INFO
)
log_handler.push_application()
log = Logger('Algorithm')

# ====================================
# 參數設定
# ====================================
start_date = '2020-01-01'
end_date = '2023-08-15'

# ====================================
# 股票池設定（81 檔藍籌股）
# ====================================
tickers = '1101 1102 1216 1301 1303 1326 1402 1476 1590 1605 1722 1802 2002 2105 2201 2207 \
2227 2301 2303 2308 2311 2317 2324 2325 2327 2330 2347 2353 2354 2357 2379 2382 2395 2408 \
2409 2412 2448 2454 2474 2492 2498 2603 2609 2615 2618 2633 2801 2823 2880 2881 2882 2883 \
2884 2885 2886 2887 2888 2890 2891 2892 2912 3008 3009 3034 3037 3045 3231 3474 3481 3673 \
3697 3711 4904 4938 5854 5871 5876 5880 6239 6415 6505 6669 6770 8046 8454 9904 9910'

os.environ['ticker'] = tickers
os.environ['mdate'] = f"{start_date.replace('-', '')} {end_date.replace('-', '')}"

# ====================================
# Ingest 股價資料
# ====================================
from zipline.data.run_ingest import simple_ingest

print("正在匯入股價資料...")
simple_ingest(
    name='tquant',
    tickers=tickers.split(' '),
    start_date=start_date.replace('-', ''),
    end_date=end_date.replace('-', '')
)
print("股價資料匯入完成！")

# ====================================
# 載入三大法人資料
# ====================================
print("正在下載三大法人資料...")

# 載入 bundle
bundle_name = 'tquant'
bundle = bundles.load(bundle_name)

sids = bundle.asset_finder.equities_sids
assets = bundle.asset_finder.retrieve_all(sids)
symbols = [i.symbol for i in assets]

# 取得三大法人持股比例與買賣超
df = get_history_data(
    ticker=symbols,
    columns=['qfii_pct', 'fd_pct', 'dlr_pct', 'tot_ex'],
    start=start_date,
    end=end_date
)

df = df.sort_values(['coid', 'mdate'])

# 計算三大法人合計持股比率
df = df.assign(
    Total_Pct=(
        df.Fund_Stock_Holding_Pct +
        df.Qfii_Stock_Holding_Pct +
        df.Dealer_Stock_Holding_Pct
    )
)

print(f"三大法人資料載入完成：{len(df)} 筆")

# ====================================
# 轉換為 Zipline 格式
# ====================================
def Custom_loader(df, bundle):
    """
    將 DataFrame 轉換為 Zipline Pipeline 可用的格式
    """
    df['coid'] = df['coid'].astype(str)

    column = df.columns[~df.columns.isin(['coid', 'mdate'])].tolist()

    df1 = df.set_index(['coid', 'mdate'])
    symbols = df1.index.get_level_values(0).unique().astype(str).tolist()

    assets = bundle.asset_finder.lookup_symbols(symbols, as_of_date=None)
    assets_map = {i.symbol: i for i in assets}

    baseline_data = {}

    for i in column:
        target = df1.unstack('coid')[i]
        target.columns = target.columns.map(assets_map)
        target = target.tz_localize('UTC').tz_convert('UTC')
        baseline_data.update({i: target})

    return baseline_data

baseline_data = Custom_loader(df, bundle)

print(f"可用欄位：{baseline_data.keys()}")

# ====================================
# 定義 CustomDataset
# ====================================
class CustomDataset(DataSet):
    """
    自定義數據集：三大法人資料
    """
    total_vol = Column(dtype=float)  # 三大法人合計買賣超
    total_pct = Column(dtype=float)  # 三大法人合計持股比率

    domain = TW_EQUITIES

# 建立 DataFrameLoader
transform_data = {
    CustomDataset.total_vol: DataFrameLoader(
        CustomDataset.total_vol,
        baseline_data['Total_Diff_Vol']
    ),
    CustomDataset.total_pct: DataFrameLoader(
        CustomDataset.total_pct,
        baseline_data['Total_Pct']
    ),
}

# ====================================
# Pipeline 定義
# ====================================
def make_pipeline(ma_days=5):
    """
    建立 Pipeline

    邏輯：
    - 買入：持股率 < 均線 且 買超
    - 賣出：持股率 > 均線 且 賣超
    """
    # 取得最新資料
    vol = CustomDataset.total_vol.latest
    pct = CustomDataset.total_pct.latest

    # 計算 5 日移動平均
    pct_ma = SimpleMovingAverage(
        inputs=[CustomDataset.total_pct],
        window_length=ma_days
    )

    # 買入訊號：持股率 < 均線 且 買超
    longs = (pct < pct_ma) & (vol > 0)

    # 賣出訊號：持股率 > 均線 且 賣超
    shorts = (pct > pct_ma) & (vol < 0)

    return Pipeline(
        columns={
            'Total_volume_diff': vol,
            'Total_pct': pct,
            'Total_pct_ma': pct_ma,
            'longs': longs,
            'shorts': shorts
        },
    )

# ====================================
# 策略函數
# ====================================
def initialize(context):
    """
    初始化函數
    """
    # 交易成本設定
    set_slippage(slippage.FixedSlippage(spread=0.002))  # 滑價 0.2%
    set_commission(commission.PerDollar(cost=0.002))   # 手續費 0.2%

    # 績效追蹤
    context.last_month = 1e6

    # 排程：每日開盤後調倉
    schedule_function(
        rebalance_start,
        date_rules.every_day(),
        time_rules.market_open()
    )

    schedule_function(
        rebalance_end,
        date_rules.every_day(),
        time_rules.market_open()
    )

    schedule_function(
        output_progress,
        date_rules.month_start(),
        time_rules.market_open()
    )

    # 附加 Pipeline
    pipeline = make_pipeline(5)
    attach_pipeline(pipeline, 'make_pipeline')

def output_progress(context, data):
    """
    輸出績效進度
    """
    today = get_datetime().date()

    perf_pct = (context.portfolio.portfolio_value / context.last_month) - 1

    log.info(f"【{today}】投組報酬率：{perf_pct*100:.2f}%")

    context.last_month = context.portfolio.portfolio_value

def before_trading_start(context, data):
    """
    盤前執行：取得 Pipeline 輸出
    """
    context.trades = pipeline_output('make_pipeline').dropna(axis=0)

def rebalance_start(context, data):
    """
    買入邏輯
    """
    target = pd.DataFrame(context.trades)

    # 篩選出買入訊號的股票
    target = target[target['longs']]

    cash = context.portfolio.cash

    for stock in target.index:
        if data.can_trade(stock) and (cash > 0):
            # 每次使用 5% 現金買入
            order_target_value(stock, cash * 0.05)

def rebalance_end(context, data):
    """
    賣出邏輯
    """
    target = pd.DataFrame(context.trades)

    # 篩選出賣出訊號的股票
    target = target[target['shorts']]

    curr_positions = context.portfolio.positions.keys()

    for stock in curr_positions:
        if stock in target.index and data.can_trade(stock):
            # 全數清倉
            order_target_percent(stock, 0)

def portfolio_plot(context, results):
    """
    績效視覺化
    """
    import matplotlib.pyplot as plt

    fig = plt.figure()
    ax1 = fig.add_subplot(111)

    results['benchmark_cum'] = results.benchmark_return.add(1).cumprod() * 1e6
    results[['portfolio_value', 'benchmark_cum']].plot(
        ax=ax1,
        label='Portfolio Value($)'
    )

    ax1.set_ylabel('Portfolio value (TWD)')
    plt.legend(loc='upper left')
    plt.gcf().set_size_inches(18, 8)
    plt.show()

# ====================================
# 執行回測
# ====================================
print("="*60)
print("開始回測跟隨大戶策略")
print("="*60)

start_dt = pd.Timestamp(start_date, tz='utc')
end_dt = pd.Timestamp(end_date, tz='utc')

# 取得基準報酬
Bindex = get_Benchmark_Return(
    start=start_dt,
    end=end_dt,
    symbol='IR0001'
).sort_index(ascending=True).tz_convert('utc')

# 執行回測
results = run_algorithm(
    start=start_dt,
    end=end_dt,
    initialize=initialize,
    before_trading_start=before_trading_start,
    capital_base=1e6,
    benchmark_returns=Bindex,
    data_frequency='daily',
    bundle='tquant',
    custom_loader=transform_data,
    analyze=portfolio_plot
)

print("\n回測完成！")

# ====================================
# 績效統計
# ====================================
print("\n========== 績效摘要 ==========")

total_return = (results['portfolio_value'].iloc[-1] / 1e6 - 1) * 100
benchmark_return = results['benchmark_period_return'].iloc[-1] * 100

print(f"策略總報酬: {total_return:.2f}%")
print(f"基準報酬: {benchmark_return:.2f}%")
print(f"超額報酬: {(total_return - benchmark_return):.2f}%")
print(f"最大回撤: {results['max_drawdown'].min() * 100:.2f}%")

results.to_csv('institution_results.csv')
print(f"\n詳細結果已儲存至: institution_results.csv")

# ====================================
# Pyfolio 績效分析
# ====================================
try:
    import pyfolio as pf
    from pyfolio.utils import extract_rets_pos_txn_from_zipline

    print("\n" + "="*60)
    print("Pyfolio 績效分析")
    print("="*60)

    returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)
    benchmark_rets = results.benchmark_return

    pf.tears.create_full_tear_sheet(
        returns=returns,
        positions=positions,
        transactions=transactions,
        benchmark_rets=benchmark_rets
    )

except ImportError:
    print("\n未安裝 pyfolio，略過詳細分析")
    print("若需完整報告，請執行: pip install pyfolio")
except Exception as e:
    print(f"\nPyfolio 分析錯誤: {e}")
```

---

## 📊 策略特性分析

### 優勢 ✅

1. **捕捉建倉階段**
> - 法人買超但持股率仍低
> - 代表正在累積部位
> - 後續可能持續買進

2. **雙重確認機制**
> - 不只看買賣超
> - 還看持股率相對位置
> - 降低假訊號

3. **5 日均線過濾**
> - 過濾單日異常
> - 確認趨勢持續性
> - 訊號較穩定

4. **小額分散進場**
> - 每次只用 5% 現金
> - 風險分散
> - 可同時持有多檔

5. **全數清倉出場**
> - 發出賣出訊號立即出清
> - 避免套牢
> - 保護獲利

### 劣勢 ⚠️

1. **資訊延遲**
> - 法人資料通常 T+1 公布
> - 已經晚一天
> - 可能錯過最佳時機

2. **假訊號風險**
> - 法人也會犯錯
> - 短期買賣不代表長期看好
> - 可能被洗出場

3. **持股分散**
> - 每次只用 5% 現金
> - 可能同時持有 20 檔
> - 單一股票影響有限

4. **交易成本高**
> - 日度調倉
> - 頻繁進出
> - 手續費和滑價成本高

5. **無基本面驗證**
> - 只看籌碼面
> - 不管公司好壞
> - 可能買到地雷股

---

## 🔍 關鍵學習點

### 1. 為什麼用「持股率 < 均線」而非「持股率上升」？

**持股率上升的問題：**
```python
# 只看持股率是否上升
if pct_today > pct_yesterday:
    buy = True

# 問題：
# - 持股率可能已經很高（如 50%）
# - 法人可能準備出貨
# - 進場時機太晚
```

**持股率 < 均線的優勢：**
```python
# 持股率 < 均線 且 買超
if (pct < pct_ma) and (vol > 0):
    buy = True

# 優勢：
# - 確認法人在「建倉」階段
# - 持股還沒到高點
# - 後續可能持續買進
```

**案例說明：**
```
情境 A（不好）：
- 持股率：45% → 46%（上升）
- 5 日均線：43%
- 今日買超：500 張
→ 持股已經偏高，可能準備出貨

情境 B（好）：
- 持股率：28% → 29%（上升）
- 5 日均線：31%
- 今日買超：1000 張
→ 持股還在低檔，正在建倉
```

### 2. CustomDataset 與 DataFrameLoader 的使用

**挑戰：**

Pipeline 預設只能用 `EquityPricing`，如何整合三大法人資料？

**解決方案：**
```python
# Step 1: 定義 CustomDataset
class CustomDataset(DataSet):
    total_vol = Column(dtype=float)
    total_pct = Column(dtype=float)
    domain = TW_EQUITIES

# Step 2: 準備數據（DataFrame 格式）
# index: 日期（UTC timezone）
# columns: 股票（Equity 物件）
baseline_data['Total_Pct'] = DataFrame(...)

# Step 3: 建立 Loader
transform_data = {
    CustomDataset.total_pct: DataFrameLoader(
        CustomDataset.total_pct,
        baseline_data['Total_Pct']
    )
}

# Step 4: 在 Pipeline 中使用
pct = CustomDataset.total_pct.latest
```

### 3. 為什麼每次只用 5% 現金？

**大額買入的問題：**
```python
# 每次用 50% 現金
order_target_value(stock, cash * 0.5)

# 問題：
# - 資金集中
# - 風險高
# - 只能持有 2 檔
```

**小額分散的優勢：**
```python
# 每次用 5% 現金
order_target_value(stock, cash * 0.05)

# 優勢：
# - 風險分散
# - 可同時持有 20 檔
# - 單一股票影響有限
```

### 4. Custom_loader 函數的作用

**目的：**

將 TEJ 資料（DataFrame）轉換為 Zipline Pipeline 可用的格式。

**關鍵步驟：**
```python
# 原始數據格式
# coid | mdate | Total_Pct
# 2330 | 2023-01-01 | 45.2
# 2330 | 2023-01-02 | 45.5

# 轉換後格式（寬表）
# mdate | Equity(2330) | Equity(2317) | ...
# 2023-01-01 | 45.2 | 32.1 | ...
# 2023-01-02 | 45.5 | 32.3 | ...
```

**程式碼解析：**
```python
# 1. 將 coid, mdate 設為 MultiIndex
df1 = df.set_index(['coid', 'mdate'])

# 2. 將股票代碼轉換為 Equity 物件
assets_map = {i.symbol: i for i in assets}

# 3. 轉為寬表（unstack）
target = df1.unstack('coid')[column]

# 4. 將欄位名稱從字串轉為 Equity 物件
target.columns = target.columns.map(assets_map)

# 5. 設定時區
target = target.tz_localize('UTC')
```

---

## 🎯 延伸優化方向

### 優化 1: 動態調整買入金額
```python
def rebalance_start(context, data):
    target = context.trades[context.trades['longs']]
    
    # 根據買超量調整買入金額
    for stock in target.index:
        vol = target.loc[stock, 'Total_volume_diff']
        
        # 買超越多，買入金額越大（但不超過 10%）
        weight = min(vol / 10000 * 0.01, 0.10)
        
        order_target_value(stock, cash * weight)
```

### 優化 2: 加入持股比率門檻
```python
def make_pipeline(ma_days=5):
    vol = CustomDataset.total_vol.latest
    pct = CustomDataset.total_pct.latest
    pct_ma = SimpleMovingAverage(
        inputs=[CustomDataset.total_pct],
        window_length=ma_days
    )
    
    # 持股率要在合理範圍（10%-40%）
    longs = (pct < pct_ma) & (vol > 0) & (pct > 0.10) & (pct < 0.40)
```

### 優化 3: 加入基本面過濾
```python
# 只買本益比 < 20 的股票
def make_pipeline(ma_days=5):
    # ... 原本的邏輯 ...
    
    # 加入本益比過濾
    pe_ratio = PERatio()
    
    longs = (
        (pct < pct_ma) &
        (vol > 0) &
        (pe_ratio < 20) &  # 本益比 < 20
        (pe_ratio > 0)     # 排除虧損股
    )
```

### 優化 4: 停損機制
```python
def rebalance_end(context, data):
    # 原本的賣出邏輯
    target = context.trades[context.trades['shorts']]
    
    # 加入停損
    for stock in context.portfolio.positions:
        position = context.portfolio.positions[stock]
        current_price = data.current(stock, 'close')
        
        # 虧損 10% 停損
        if current_price < position.cost_basis * 0.9:
            order_target_percent(stock, 0)
            log.info(f"停損出場: {stock.symbol}")
```

### 優化 5: 持有時間限制
```python
def initialize(context):
    # ... 原本的邏輯 ...
    context.buy_date = {}

def rebalance_start(context, data):
    # 記錄買入日期
    for stock in target.index:
        if stock not in context.portfolio.positions:
            order_target_value(stock, cash * 0.05)
            context.buy_date[stock] = get_datetime()

def rebalance_end(context, data):
    # 持有超過 30 天強制出場
    for stock in context.portfolio.positions:
        if stock in context.buy_date:
            holding_days = (get_datetime() - context.buy_date[stock]).days
            
            if holding_days > 30:
                order_target_percent(stock, 0)
                log.info(f"持有 {holding_days} 天，強制出場")
```

---

## 📚 相關資源

- **模板頁面**：[template.md](template.md) - CustomDataset 模板
- **架構說明**：[index.md](index.md) - 理解設計原理
- **其他案例**：
  - [Expanded Momentum](case-momentum.md) - 動量策略
  - [CounterTrend](case-countertrend.md) - 逆勢策略

---

## 💡 總結

跟隨大戶策略展示了 **籌碼面量化** 的關鍵洞察：

1. ✅ **建倉階段進場**：持股率低 + 買超
2. ✅ **雙重確認**：降低假訊號
3. ✅ **小額分散**：每次 5% 現金
4. ✅ **全數清倉**：發出賣出訊號立即出清
5. ✅ **自定義數據**：整合 TEJ 三大法人資料

**適合誰使用？**

- 相信籌碼面分析
- 能承受高頻交易成本
- 短線操作者

**使用建議：**

- ✅ 注意交易成本
- ✅ 搭配基本面過濾
- ✅ 設定停損機制
- ⚠️ 法人資料有延遲
- ⚠️ 法人也會犯錯

**👉 Next Step:**

1. 複製完整程式碼
2. 調整參數（均線天數、買入金額）
3. 加入基本面過濾
4. 測試不同調倉頻率

---

## 📖 延伸閱讀

**籌碼分析理論：**

- 供需法則：大量買盤推升股價
- 資訊不對稱：機構比散戶有優勢
- 建倉理論：持股低檔累積，持股高檔出貨

**三大法人特性：**

- 外資：長線布局，資金龐大
- 投信：季底作帳，月底結算
- 自營商：短線避險，參考價值低

**實務注意事項：**

- 法人資料 T+1 公布（有延遲）
- 作帳行情：季末月初需注意
- 假外資：借名帳戶可能扭曲數據
- 建倉階段：持股率 20-35% 較佳
- 出貨階段：持股率 > 40% 需謹慎