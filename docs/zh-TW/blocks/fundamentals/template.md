# 財報選股架構 - Code 模板

本頁提供可直接使用的 Code Template，並標註需要自定義的部分。

---

## 📋 模板總覽

財報選股架構包含 **4 個核心模塊** ，請依照你的需求組裝：

| 模塊 (Module) | 核心功能 | 你的任務 (Action) |
| :--- | :--- | :--- |
| **M1. 基礎建設** | `環境設定` `數據下載` | 🟢 **設定參數** (日期、資金、股票池) |
| **M2. 策略大腦** | `選股邏輯` `因子篩選` | 🔥 **寫下你的獲利邏輯 (最重要!)** |
| **M3. 戰術節奏** | `換股日程` `再平衡` | 🔵 **選擇頻率** (季換/月換/固定天數) |
| **M4. 執行引擎** | `下單交易` `績效回報` | 🔒 **直接執行** (通常無需修改) |

---

## 🎯 完整模板

### Module 1: 環境設定 & 數據準備
```python
# ====================================
# Module 1: 環境設定 & 數據準備
# ====================================

import os
import pandas as pd
import numpy as np
import tejapi
import matplotlib.pyplot as plt
import warnings
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()
warnings.filterwarnings('ignore')

# TEJ API 設定
tejapi.ApiConfig.api_key = os.getenv('TEJAPI_KEY')
os.environ['TEJAPI_KEY'] = os.getenv('TEJAPI_KEY')
tejapi.ApiConfig.api_base = os.getenv('TEJAPI_BASE')
os.environ['TEJAPI_BASE'] = os.getenv('TEJAPI_BASE')

# 中文顯示設定
plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei', 'Arial']
plt.rcParams['axes.unicode_minus'] = False

# ====================================
# 參數設定
# ====================================
start_date = '2019-12-29'  # 🔧 自定義：回測起始日
end_date = '2023-12-31'    # 🔧 自定義：回測結束日
capital_base = 1e7         # 🔧 自定義：初始資金

# ====================================
# 股票池設定
# ====================================
from zipline.sources.TEJ_Api_Data import get_universe

pool = get_universe(
    start=pd.Timestamp(start_date, tz='utc'), 
    end=pd.Timestamp(end_date, tz='utc'), 
    mkt_bd_e=['TSE', 'OTC'],  # 🔧 自定義：TSE=上市, OTC=上櫃
    stktp_e='Common Stock'    # 固定：普通股
)

print(f"股票池總數: {len(pool)} 檔")

# ====================================
# 財報數據下載
# ====================================
import TejToolAPI

# 🔧 自定義：需要的財報欄位
columns = [
    'mktcap',      # 市值
    'per',         # 本益比
    'div_yid',     # 股息收益率
    'a0100',       # 流動資產
    'a1100',       # 流動負債
    'a1000',       # 總負債
    'a2000',       # 總權益
    'eps',         # 每股盈餘
    'r405'         # 營收成長率
    # 更多欄位請參考 TEJ API 文檔
]

data__ = TejToolAPI.get_history_data(
    start=pd.Timestamp(start_date, tz='UTC'), 
    end=pd.Timestamp(end_date, tz='UTC'), 
    ticker=pool, 
    fin_type='Q',  # 🔧 可選：'Q'=季報, 'A'=年報, 'TTM'=近12月
    columns=columns, 
    transfer_to_chinese=True,  # 欄位名轉中文
    include_self_acc='Y'       # 包含自結數
)

print(f"數據筆數: {len(data__):,}")
print(f"日期範圍: {data__['日期'].min().date()} ~ {data__['日期'].max().date()}")
```

---

### Module 2: 選股邏輯函數 🔥

這是整個策略的**靈魂**，所有篩選邏輯都在這裡定義。

#### 📌 模板 A：交集法（最常用）
```python
# ====================================
# Module 2A: 選股邏輯 - 交集法
# ====================================

def compute_stock(date, data, verbose=True):
    """
    選股函數：根據財報條件篩選股票
    
    Parameters:
    -----------
    date : datetime.date
        選股日期
    data : pd.DataFrame
        完整財報數據
    verbose : bool
        是否顯示詳細訊息
        
    Returns:
    --------
    list : 入選股票代碼列表
    """
    # 提取當日數據
    df = data[data['日期'] == pd.Timestamp(date)].reset_index(drop=True)
    
    if len(df) == 0:
        if verbose:
            print(f"警告：{date} 無數據")
        return []
    
    # ========================================
    # 🔥 自定義區：定義篩選條件
    # ========================================
    
    # 條件 1: 本益比 < 市場平均
    market_avg_per = df['本益比'].mean(skipna=True)
    set_1 = set(df[df['本益比'] < market_avg_per]['股票代碼'])
    
    # 條件 2: 流動比率 > 產業平均
    df['產業平均流動比率'] = df.groupby('主產業別_中文')['流動資產_Q'].transform('mean') / \
                          df.groupby('主產業別_中文')['流動負債_Q'].transform('mean')
    df['流動比率'] = df['流動資產_Q'] / df['流動負債_Q']
    set_2 = set(df[df['流動比率'] > df['產業平均流動比率']]['股票代碼'])
    
    # 條件 3: 負債比 < 20%
    df['負債比'] = df['負債總額_Q'] / df['股東權益總額_Q']
    set_3 = set(df[df['負債比'] < 0.2]['股票代碼'])
    
    # 條件 4: 股息收益率 > 市場平均
    market_avg_div = df['股利殖利率'].mean(skipna=True)
    set_4 = set(df[df['股利殖利率'] > market_avg_div]['股票代碼'])
    
    # ========================================
    # 取交集
    # ========================================
    selected_tickers = list(set_1 & set_2 & set_3 & set_4)
    
    if verbose:
        print(f"\n========== {date} 選股 ==========")
        print(f"條件 1 通過: {len(set_1)} 檔")
        print(f"條件 2 通過: {len(set_2)} 檔")
        print(f"條件 3 通過: {len(set_3)} 檔")
        print(f"條件 4 通過: {len(set_4)} 檔")
        print(f"最終入選: {len(selected_tickers)} 檔")
        print("="*40)
    
    return selected_tickers
```

#### 📌 模板 B：計分法（進階）
```python
# ====================================
# Module 2B: 選股邏輯 - 計分法
# ====================================

def compute_stock_scoring(date, data, min_score=3, verbose=True):
    """
    選股函數：計分制篩選
    
    邏輯：
    1. 核心條件（必須通過）
    2. 額外條件（計分，達標即入選）
    """
    df = data[data['日期'] == pd.Timestamp(date)].reset_index(drop=True)
    
    if len(df) == 0:
        if verbose:
            print(f"警告：{date} 無數據")
        return []
    
    # ========================================
    # 階段 1: 核心條件（必須通過）
    # ========================================
    avg_mktcap = df['個股市值_元'].mean(skipna=True)
    core_set_1 = set(df[df['個股市值_元'] >= avg_mktcap]['股票代碼'])
    
    avg_per = df['本益比'].mean(skipna=True)
    core_set_2 = set(df[(df['本益比'] > 0) & (df['本益比'] <= avg_per)]['股票代碼'])
    
    core_set = core_set_1 & core_set_2
    
    # ========================================
    # 階段 2: 額外條件（計分）
    # ========================================
    df['流動比率'] = df['流動資產_Q'] / df['流動負債_Q']
    df['負債比'] = df['負債總額_Q'] / df['股東權益總額_Q']
    
    avg_current_ratio = df['流動比率'].mean(skipna=True)
    avg_debt_ratio = df['負債比'].mean(skipna=True)
    avg_roe = df[df['ROE_A_稅後_Q'] > 0]['ROE_A_稅後_Q'].mean()
    
    score_set_1 = set(df[df['流動比率'] >= avg_current_ratio]['股票代碼'])
    score_set_2 = set(df[df['負債比'] <= avg_debt_ratio]['股票代碼'])
    score_set_3 = set(df[(df['ROE_A_稅後_Q'] > 0) & (df['ROE_A_稅後_Q'] >= avg_roe)]['股票代碼'])
    
    # ========================================
    # 計分與篩選
    # ========================================
    selected_tickers = []
    
    for ticker in core_set:
        score = 0
        if ticker in score_set_1: score += 1
        if ticker in score_set_2: score += 1
        if ticker in score_set_3: score += 1
        
        if score >= min_score:
            selected_tickers.append(ticker)
    
    # 動態降級（如果沒有符合的股票）
    if len(selected_tickers) == 0 and min_score > 1:
        if verbose:
            print(f"降級至 {min_score-1} 分...")
        return compute_stock_scoring(date, data, min_score-1, verbose=False)
    
    if verbose:
        print(f"\n========== {date} 選股（計分制）==========")
        print(f"核心條件通過: {len(core_set)} 檔")
        print(f"最終入選（≥{min_score}分）: {len(selected_tickers)} 檔")
        print("="*40)
    
    return selected_tickers
```

#### 📌 模板 C：排名法
```python
# ====================================
# Module 2C: 選股邏輯 - 排名法
# ====================================

def compute_stock_ranking(date, data, top_n=20, verbose=True):
    """
    選股函數：排名法
    
    邏輯：
    1. 通過基本條件
    2. 按某指標排名，取前 N 名
    """
    df = data[data['日期'] == pd.Timestamp(date)].reset_index(drop=True)
    
    if len(df) == 0:
        if verbose:
            print(f"警告：{date} 無數據")
        return []
    
    # ========================================
    # 基本條件
    # ========================================
    avg_mktcap = df['個股市值_元'].mean(skipna=True)
    basic_set = set(df[df['個股市值_元'] <= avg_mktcap * 0.3]['股票代碼'])  # 小型股
    
    # ========================================
    # 排名指標：PEG (本益比/成長率)
    # ========================================
    df['PEG'] = df['本益比'] / df['稅後淨利成長率_Q']
    
    # 篩選 + 排序
    filtered_df = df[df['股票代碼'].isin(basic_set) & (df['PEG'] > 0)]
    top_df = filtered_df.sort_values(by='PEG').head(top_n)
    
    selected_tickers = list(top_df['股票代碼'])
    
    if verbose:
        print(f"\n========== {date} 選股（排名法）==========")
        print(f"基本條件通過: {len(basic_set)} 檔")
        print(f"最終入選（前{top_n}名）: {len(selected_tickers)} 檔")
        print("="*40)
    
    return selected_tickers
```

---

### Module 3: 換股日期計算

#### 📌 方法 A：固定週期（簡單）
```python
# ====================================
# Module 3A: 換股日期 - 固定週期
# ====================================

# 手動指定日期
modified_day = [
    pd.Timestamp('2020-03-31').date(),
    pd.Timestamp('2020-06-30').date(),
    pd.Timestamp('2020-09-30').date(),
    pd.Timestamp('2020-12-31').date(),
    # ... 繼續列舉
]

print(f"換股次數: {len(modified_day)}")
print(f"範例日期: {modified_day[:5]}")
```

#### 📌 方法 B：TEJ 交易日曆（推薦）
```python
# ====================================
# Module 3B: 換股日期 - TEJ 交易日曆
# ====================================

# 使用 TEJ 官方交易日曆，避免遇到非交易日
trade_days = tejapi.get(
    'TWN/TRADEDAY_TWSE',
    zdate={'gte': start_date, 'lte': end_date},
    tradeday_cno={'ne': 0}  # 只抓取交易日
)

trade_days['zdate'] = pd.to_datetime(trade_days['zdate'])
trade_days['year'] = trade_days['zdate'].dt.year
trade_days['month'] = trade_days['zdate'].dt.month

# 找出每季最後交易日
rebalance_months = [3, 6, 9, 12]  # 🔧 自定義：換股月份
modified_day = []

for month in rebalance_months:
    month_data = trade_days[trade_days['month'] == month]
    last_days = month_data.groupby('year')['zdate'].max()
    modified_day.extend(last_days.tolist())

# 轉換為 date 格式並排序
modified_day = sorted([d.date() for d in modified_day])

print(f"換股次數: {len(modified_day)}")
print(f"範例日期: {modified_day[:8]}")
```

#### 📌 方法 C：固定頻率（N 天調倉）
```python
# ====================================
# Module 3C: 換股日期 - 固定頻率
# ====================================

# 此方法不需事先計算，在 handle_data 中用計數器實現
# 見 Module 4 的變體 B
```

---

### Module 4: Zipline 回測引擎

#### 📌 標準版（季度調倉）
```python
# ====================================
# Module 4: Zipline 回測引擎
# ====================================

from zipline.data.run_ingest import simple_ingest
from zipline.api import (
    set_slippage, set_commission, set_benchmark, 
    symbol, record, order_target_percent
)
from zipline.finance import commission, slippage
from zipline import run_algorithm

# ====================================
# 匯入價量資料
# ====================================
pools = pool + ['IR0001']  # 加入基準指數

print("正在準備 Zipline 資料...")
simple_ingest(
    name='tquant', 
    tickers=pools, 
    start_date=start_date.replace('-', ''), 
    end_date=end_date.replace('-', '')
)
print("資料準備完成！")

# ====================================
# 初始化函數
# ====================================
def initialize(context):
    """回測初始化"""
    # 滑價模型
    set_slippage(slippage.VolumeShareSlippage(
        volume_limit=1,      # 🔧 可調：最大成交量佔比
        price_impact=0.01    # 🔧 可調：價格衝擊
    ))
    
    # 手續費模型
    set_commission(commission.Custom_TW_Commission(
        min_trade_cost=20,   # 最低手續費 20 元
        discount=1.0,        # 🔧 可調：手續費折扣（0.5=五折）
        tax=0.003            # 證交稅 0.3%
    ))
    
    # 設定基準指數
    set_benchmark(symbol('IR0001'))
    
    # 初始化變數
    context.i = 0                    # 日期計數器
    context.state = False            # 是否為換股日隔天
    context.order_tickers = []       # 本期入選股票
    context.last_tickers = []        # 上期持有股票

# ====================================
# 每日執行函數
# ====================================
def handle_data(context, data):
    """每日執行邏輯"""
    # 避免前視偏差：在篩選股票下一交易日下單
    if context.state == True:
        print(f"下單日期: {data.current_dt.date()}, 入選股票數: {len(context.order_tickers)}")

        # 賣出不再持有的股票
        for ticker in context.last_tickers:
            if ticker not in context.order_tickers:
                order_target_percent(symbol(ticker), 0)
        
        # 買入新入選的股票（等權重）
        if len(context.order_tickers) > 0:
            target_weight = 1 / len(context.order_tickers)  # 🔧 可改：權重計算
            for ticker in context.order_tickers:
                order_target_percent(symbol(ticker), target_weight)
                curr = data.current(symbol(ticker), 'price')
                record(price=curr, days=context.i)
        
        context.last_tickers = context.order_tickers
        context.state = False

    backtest_date = data.current_dt.date()
    
    # 查看是否為換股日
    for rebalance_date in modified_day:
        if backtest_date == rebalance_date:
            context.state = True
            # 🔥 呼叫選股函數
            context.order_tickers = compute_stock(
                date=backtest_date, 
                data=data__,
                verbose=True
            )
    
    context.i += 1

# ====================================
# 績效分析函數
# ====================================
def analyze(context, perf):
    """繪製績效圖表"""
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)
    
    # 上圖：累積報酬
    perf['algorithm_period_return'].plot(ax=ax1, label='策略報酬', linewidth=2)
    perf['benchmark_period_return'].plot(ax=ax1, label='大盤報酬', linewidth=2, alpha=0.7)
    ax1.set_title('策略 vs 大盤', fontsize=16, fontweight='bold')
    ax1.set_ylabel('累積報酬率', fontsize=12)
    ax1.legend(loc='upper left')
    ax1.grid(True, alpha=0.3)
    
    # 下圖：投資組合價值
    perf['portfolio_value'].plot(ax=ax2, label='投資組合價值', linewidth=2)
    ax2.set_title('投資組合價值', fontsize=14)
    ax2.set_ylabel('價值（元）', fontsize=12)
    ax2.legend(loc='upper left')
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()
    
    # 儲存績效數據
    perf.to_csv(f"perf_{start_date}_{end_date}.csv")

# ====================================
# 執行回測
# ====================================
print("="*60)
print("開始回測")
print("="*60)

results = run_algorithm(
    start=pd.Timestamp(start_date, tz='utc'),
    end=pd.Timestamp(end_date, tz='utc'),
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    bundle='tquant',
    capital_base=capital_base
)

print("\n回測完成！")
```

#### 📌 變體 B：固定天數調倉
```python
def initialize(context):
    # ... 前面相同 ...
    
    context.rebalance_freq = 20  # 🔧 自定義：每 N 天調倉

def handle_data(context, data):
    if context.state == True:
        # ... 下單邏輯 ...
        context.state = False

    backtest_date = data.current_dt.date()
    
    # 🔥 改用計數器判斷
    if context.i % context.rebalance_freq == 0:
        context.state = True
        context.order_tickers = compute_stock(backtest_date, data__)
    
    context.i += 1
```

---

## 🎯 使用指南

### Step 1: 複製模板
選擇最接近你需求的模板組合：
- **交集法 + TEJ 日曆** ← 最推薦
- **計分法 + 固定週期**
- **排名法 + 固定頻率**

### Step 2: 自定義核心邏輯
修改 `compute_stock()` 函數中的篩選條件：
```python
# 🔥 在這裡替換成你的邏輯
set_1 = set(df[df['你的條件']]['股票代碼'])
set_2 = set(df[df['你的條件']]['股票代碼'])
```

### Step 3: 調整參數
- 回測期間：`start_date`, `end_date`
- 股票池：`mkt_bd_e`, `stktp_e`
- 財報欄位：`columns`
- 換股頻率：`rebalance_months` 或 `rebalance_freq`

### Step 4: 執行回測
```python
results = run_algorithm(...)
```

---

## 📚 相關資源

- **案例學習**：
  - [多因子選股](case-multifactor.md) - 交集法完整範例
  - [Dreman 逆向投資](case-dreman.md) - 計分法完整範例
  - [小型成長股](case-smallcap.md) - 排名法完整範例
- **常見問題**：[faq.md](faq.md)

---

**👉 Next Step:** 參考 [case-multifactor.md](case-multifactor.md) 查看完整實戰案例！