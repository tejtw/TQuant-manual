# 案例 3：Dreman 逆向投資策略

> **策略類型：** 財報選股架構 - 計分法  
> **調倉頻率：** 每季（3/6/9/12 月末）  
> **股票池：** 台灣上市（TSE）普通股  
> **回測期間：** 2019-12-29 ~ 2025-09-30

---

## 📌 策略概述

這是 **David Dreman** 逆向投資哲學的量化實作，核心理念是：

> **"Buy what others are selling, sell what others are buying."**  
> 在市場過度悲觀時買入被低估的優質股票。

### Dreman 投資哲學

David Dreman 認為市場經常過度反應，導致：
- 📉 好公司因短期利空被錯殺
- 📈 差公司因題材炒作被高估

因此， **逆向投資者** 應該：

1. 尋找 **被低估的優質公司**（低本益比 + 高股息）
2. 確認 **財務健康**（流動性、獲利能力）
3. 耐心持有，等待市場修正

### 策略特色

1. **兩階段篩選**：核心條件（門檻）+ 額外條件（計分）
2. **產業中性**：避免特定產業偏好
3. **動態降級**：市場極端時自動放寬標準
4. **防禦性強**：強調財務安全

---

## 🎯 選股條件詳解

### 階段一：核心條件（必須通過）

這是 **不可妥協的門檻** ，不通過就直接淘汰。

#### 條件 1: 市值 ≥ 市場平均
```python
avg_mktcap = df['個股市值_元'].mean(skipna=True)
core_set_1 = set(df[df['個股市值_元'] >= avg_mktcap]['股票代碼'])
```
**邏輯：** Dreman 偏好中大型股，流動性好且資訊透明。

#### 條件 2: 本益比 ≤ 50% 分位數
```python
df_valid_per = df[df['本益比'] > 0]
per_threshold = df_valid_per['本益比'].quantile(0.5)
core_set_2 = set(df[
    (df['本益比'] <= per_threshold) & 
    (df['本益比'] <= avg_per) & 
    (df['本益比'] > 0)
]['股票代碼'])
```
**邏輯：** 
- 本益比必須 > 0（排除虧損公司）
- 必須低於中位數（相對便宜）
- 必須低於市場平均（絕對便宜）

#### 條件 3: 股息收益率 ≥ 市場平均
```python
avg_div_yield = df['股利殖利率'].mean(skipna=True)
core_set_3 = set(df[df['股利殖利率'] >= avg_div_yield]['股票代碼'])
```
**邏輯：** 高股息代表公司願意分享盈利，且提供下檔保護。
```python
core_set = core_set_1 & core_set_2 & core_set_3  # 取交集
```

---

### 階段二：額外條件（計分制）

通過核心條件後，根據以下 5 個指標計分， **至少 3 分** 才入選。

#### 指標 1: 流動比率 ≥ 市場平均（+1 分）
```python
df['流動比率'] = df['流動資產_Q'] / df['流動負債_Q']
avg_current_ratio = df['流動比率'].mean(skipna=True)
score_set_1 = set(df[df['流動比率'] >= avg_current_ratio]['股票代碼'])
```
**意義：** 短期償債能力，> 1 代表資產足以償還負債。

#### 指標 2: 負債淨值比 ≤ 市場平均（+1 分）
```python
df['負債淨值比'] = df['負債總額_Q'] / df['股東權益總額_Q']
avg_debt_equity = df['負債淨值比'].mean(skipna=True)
score_set_2 = set(df[df['負債淨值比'] <= avg_debt_equity]['股票代碼'])
```
**意義：** 槓桿程度，越低越安全。

#### 指標 3: ROE ≥ 市場平均（+1 分）
```python
valid_roe = df[df['ROE_A_稅後_Q'] > 0]['ROE_A_稅後_Q']
avg_roe = valid_roe.mean() if len(valid_roe) > 0 else 0
score_set_3 = set(df[(df['ROE_A_稅後_Q'] > 0) & (df['ROE_A_稅後_Q'] >= avg_roe)]['股票代碼'])
```
**意義：** 股東權益報酬率，衡量獲利效率。

#### 指標 4: 稅前淨利率 ≥ 市場平均（+1 分）
```python
valid_profit_margin = df[df['稅前淨利率_Q'] > 0]['稅前淨利率_Q']
avg_profit_margin = valid_profit_margin.mean() if len(valid_profit_margin) > 0 else 0
score_set_4 = set(df[(df['稅前淨利率_Q'] > 0) & (df['稅前淨利率_Q'] >= avg_profit_margin)]['股票代碼'])
```
**意義：** 營運效率，賺錢能力。

#### 指標 5: 盈餘成長率 ≥ 市場平均（+1 分）
```python
avg_earnings_growth = df['稅後淨利成長率_Q'].mean(skipna=True)
score_set_5 = set(df[df['稅後淨利成長率_Q'] >= avg_earnings_growth]['股票代碼'])
```
**意義：** 成長性，避免價值陷阱。

---

### 計分與篩選邏輯
```python
min_extra_score = 3  # 至少 3 分
selected_tickers = []

for ticker in core_set:
    score = 0
    if ticker in score_set_1: score += 1  # 流動比率
    if ticker in score_set_2: score += 1  # 負債比
    if ticker in score_set_3: score += 1  # ROE
    if ticker in score_set_4: score += 1  # 淨利率
    if ticker in score_set_5: score += 1  # 盈餘成長
    
    if score >= min_extra_score:
        selected_tickers.append(ticker)
```

### 動態降級機制

如果沒有股票達到 3 分，自動降至 2 分：
```python
if len(selected_tickers) == 0:
    fallback_score = 2
    print(f"降級至 {fallback_score} 分...")
    for ticker in core_set:
        score = 0
        # ... 重新計分 ...
        if score >= fallback_score:
            selected_tickers.append(ticker)
```

**為什麼需要降級？**
- 避免極端市況下無股票可買
- 保持策略持續運作
- 類似「次優解」的容錯機制

---

## 🔑 執行前準備：環境變數設定

本範例使用 `python-dotenv` 套件來管理敏感資訊（如 API Key），避免將金鑰直接寫死在程式碼中，以確保資訊安全。

### 1. 安裝套件
若您尚未安裝，請在notebook執行：
```python
!pip install python-dotenv
```
### 2. 建立設定檔
請在專案的根目錄下建立一個名為 `.env` 的檔案（注意開頭有點），並填入您的 TEJ API 資訊：
```python
# .env 檔案內容(注意等號旁不能有空格)
TEJAPI_KEY=你的_TEJ_API_KEY
TEJAPI_BASE=http://api.tej.com.tw
```

### 3. 程式讀取機制
程式碼中的 `load_dotenv()` 會自動尋找並讀取 `.env` 檔案，將其內容載入為環境變數，接著透過 `os.getenv` 取得使用。

---

## 💻 完整程式碼
```python
# ====================================
# Dreman 逆向投資策略 - 完整實作
# ====================================

import os
import datetime
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import warnings
from dotenv import load_dotenv

load_dotenv()
warnings.filterwarnings('ignore')

# ====================================
# TEJ API 設定
# ====================================
import tejapi

tejapi.ApiConfig.api_key = os.getenv('TEJAPI_KEY')
os.environ['TEJAPI_KEY'] = os.getenv('TEJAPI_KEY')
tejapi.ApiConfig.api_base = os.getenv('TEJAPI_BASE')
os.environ['TEJAPI_BASE'] = os.getenv('TEJAPI_BASE')

# 中文顯示設定
plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei', 'Arial', 'SourceHanSansTC-Regular.otf']
plt.rcParams['axes.unicode_minus'] = False

# ====================================
# 參數設定
# ====================================
start_date = '2019-12-29'
end_date = '2025-09-30'

# ====================================
# 股票池設定（僅上市）
# ====================================
from zipline.sources.TEJ_Api_Data import get_universe

pool = get_universe(
    start=pd.Timestamp(start_date, tz='utc'), 
    end=pd.Timestamp(end_date, tz='utc'), 
    mkt_bd_e=['TSE'],  # 僅上市
    stktp_e='Common Stock'
)

print(f"股票池總數: {len(pool)} 檔")

# ====================================
# 財報數據下載
# ====================================
import TejToolAPI

columns = [
    'mktcap',   # 市值
    'per',      # 本益比
    'div_yid',  # 股息收益率
    'a0100',    # 流動資產
    'a1100',    # 流動負債
    'a1000',    # 總負債
    'a2000',    # 總權益
    'r16a',     # 股利支付率
    'r103',     # ROE_A_稅後
    'r107',     # 稅前淨利率
    'eps',      # 每股盈餘
    'shares',   # 流通在外股數
    'r405'      # 稅後淨利成長率
]

data__ = TejToolAPI.get_history_data(
    start=pd.Timestamp(start_date, tz='UTC'), 
    end=pd.Timestamp(end_date, tz='UTC'), 
    ticker=pool, 
    fin_type='Q',  # 季報
    columns=columns, 
    transfer_to_chinese=True,
    include_self_acc='Y'
)

print(f"數據筆數: {len(data__):,}")
print(f"日期範圍: {data__['日期'].min().date()} ~ {data__['日期'].max().date()}")

# ====================================
# 換股日期計算（TEJ 交易日曆）
# ====================================
trade_days = tejapi.get(
    'TWN/TRADEDAY_TWSE',
    zdate={'gte': start_date, 'lte': end_date},
    tradeday_cno={'ne': 0}  # 只抓取交易日
)

trade_days['zdate'] = pd.to_datetime(trade_days['zdate'])
trade_days['year'] = trade_days['zdate'].dt.year
trade_days['month'] = trade_days['zdate'].dt.month

# 找出每季最後交易日
rebalance_months = [3, 6, 9, 12]
modified_day = []

for month in rebalance_months:
    month_data = trade_days[trade_days['month'] == month]
    last_days = month_data.groupby('year')['zdate'].max()
    modified_day.extend(last_days.tolist())

# 轉換為 date 格式並排序
modified_day = sorted([d.date() for d in modified_day])

print(f"再平衡次數: {len(modified_day)}")
print(f"範例日期: {modified_day[:8]}")

# ====================================
# 選股函數
# ====================================
def compute_stock(date, data, verbose=True):
    """
    Dreman 逆向投資選股函數
    
    邏輯：
    1. 核心條件：市值 + 低本益比 + 高股息（必須通過）
    2. 額外條件：流動比率、負債比、ROE、利潤率、成長率（計分，≥3分）
    3. 動態降級：若無股票則降至 2 分
    
    Parameters:
    -----------
    date : datetime.date
        選股日期
    data : pd.DataFrame
        財報數據
    verbose : bool
        是否顯示詳細訊息
        
    Returns:
    --------
    list : 入選股票代碼列表
    """
    df = data[data['日期'] == pd.Timestamp(date)].reset_index(drop=True)
    
    if len(df) == 0:
        if verbose:
            print(f"警告：{date} 無數據")
        return []

    # ========================================
    # 計算衍生指標
    # ========================================
    df['流動比率'] = df['流動資產_Q'] / df['流動負債_Q']
    df['負債淨值比'] = df['負債總額_Q'] / df['股東權益總額_Q']
    
    # 計算市場平均值
    avg_mktcap = df['個股市值_元'].mean(skipna=True)
    avg_per = df['本益比'].mean(skipna=True)
    avg_div_yield = df['股利殖利率'].mean(skipna=True)
    avg_current_ratio = df['流動比率'].mean(skipna=True)
    avg_debt_equity = df['負債淨值比'].mean(skipna=True)
    
    # ROE 和稅前淨利率：只對正值計算平均
    valid_roe = df[df['ROE_A_稅後_Q'] > 0]['ROE_A_稅後_Q']
    avg_roe = valid_roe.mean() if len(valid_roe) > 0 else 0
    
    valid_profit_margin = df[df['稅前淨利率_Q'] > 0]['稅前淨利率_Q']
    avg_profit_margin = valid_profit_margin.mean() if len(valid_profit_margin) > 0 else 0
    
    # 盈餘成長率
    avg_earnings_growth = df['稅後淨利成長率_Q'].mean(skipna=True)

    if verbose:
        print(f"\n========== {date} 選股 ==========")
        print(f"總股票數: {len(df)}")
    
    # ========================================
    # 階段一：核心條件
    # ========================================
    # 條件 1: 市值 ≥ 平均
    core_set_1 = set(df[df['個股市值_元'] >= avg_mktcap]['股票代碼'])
    
    # 條件 2: 本益比（50% 分位數）
    df_valid_per = df[df['本益比'] > 0]
    if len(df_valid_per) > 0:
        per_threshold = df_valid_per['本益比'].quantile(0.5)
        core_set_2 = set(df[
            (df['本益比'] <= per_threshold) & 
            (df['本益比'] <= avg_per) & 
            (df['本益比'] > 0)
        ]['股票代碼'])
    else:
        core_set_2 = set()
    
    # 條件 3: 股息收益率 ≥ 平均
    core_set_3 = set(df[df['股利殖利率'] >= avg_div_yield]['股票代碼'])
    
    # 核心條件交集
    core_set = core_set_1 & core_set_2 & core_set_3
    
    # ========================================
    # 階段二：額外條件（計分制）
    # ========================================
    score_set_1 = set(df[df['流動比率'] >= avg_current_ratio]['股票代碼'])
    score_set_2 = set(df[df['負債淨值比'] <= avg_debt_equity]['股票代碼'])
    score_set_3 = set(df[(df['ROE_A_稅後_Q'] > 0) & (df['ROE_A_稅後_Q'] >= avg_roe)]['股票代碼'])
    score_set_4 = set(df[(df['稅前淨利率_Q'] > 0) & (df['稅前淨利率_Q'] >= avg_profit_margin)]['股票代碼'])
    score_set_5 = set(df[df['稅後淨利成長率_Q'] >= avg_earnings_growth]['股票代碼'])
    
    if verbose:
        print(f"核心條件通過: {len(core_set)} 檔")
    
    # 計分篩選（至少 3 分）
    min_extra_score = 3
    selected_tickers = []
    
    for ticker in core_set:
        score = 0
        if ticker in score_set_1: score += 1
        if ticker in score_set_2: score += 1
        if ticker in score_set_3: score += 1
        if ticker in score_set_4: score += 1
        if ticker in score_set_5: score += 1
        
        if score >= min_extra_score:
            selected_tickers.append(ticker)
    
    # 動態降級機制（降至 2 分）
    if len(selected_tickers) == 0:
        fallback_score = 2
        if verbose:
            print(f"降級至 {fallback_score} 分...")
        for ticker in core_set:
            score = 0
            if ticker in score_set_1: score += 1
            if ticker in score_set_2: score += 1
            if ticker in score_set_3: score += 1
            if ticker in score_set_4: score += 1
            if ticker in score_set_5: score += 1
            if score >= fallback_score:
                selected_tickers.append(ticker)
    
    if verbose:
        print(f"最終入選: {len(selected_tickers)} 檔")
        if len(selected_tickers) > 0:
            print(f"股票: {selected_tickers[:10]}")
        print("="*40)
    
    return selected_tickers

# ====================================
# 匯入價量資料
# ====================================
from zipline.data.run_ingest import simple_ingest

pools = pool + ['IR0001']

print("正在準備 Zipline 資料...")
simple_ingest(
    name='tquant', 
    tickers=pools, 
    start_date=start_date.replace('-', ''), 
    end_date=end_date.replace('-', '')
)
print("資料準備完成！")

# ====================================
# Zipline 回測設定
# ====================================
from zipline.api import (
    set_slippage, set_commission, set_benchmark, 
    symbol, record, order_target_percent
)
from zipline.finance import commission, slippage
from zipline import run_algorithm

def initialize(context):
    """初始化函數：設定交易成本、滑價、基準"""
    # 滑價模型
    set_slippage(slippage.VolumeShareSlippage(volume_limit=1, price_impact=0.01))
    
    # 手續費模型
    set_commission(
        commission.Custom_TW_Commission(
            min_trade_cost=20,
            discount=1.0,
            tax=0.003
        )
    )
    
    # 設定基準指數
    set_benchmark(symbol('IR0001'))
    
    # 初始化變數
    context.i = 0
    context.state = False
    context.order_tickers = []
    context.last_tickers = []

def handle_data(context, data):
    """每日執行函數：判斷是否需要調整持倉"""
    # 避免前視偏差：在篩選股票下一交易日下單
    if context.state == True:
        print(f"下單日期: {data.current_dt.date()}, 入選股票數: {len(context.order_tickers)}")

        # 賣出不再持有的股票
        for ticker in context.last_tickers:
            if ticker not in context.order_tickers:
                order_target_percent(symbol(ticker), 0)
        
        # 買入新入選的股票（等權重）
        if len(context.order_tickers) > 0:
            target_weight = 1 / len(context.order_tickers)
            for ticker in context.order_tickers:
                order_target_percent(symbol(ticker), target_weight)
                curr = data.current(symbol(ticker), 'price')
                record(price=curr, days=context.i)
        
        context.last_tickers = context.order_tickers

    context.state = False
    backtest_date = data.current_dt.date()
    
    # 查看是否為再平衡日期
    for rebalance_date in modified_day:
        if backtest_date == rebalance_date:
            context.state = True
            # 執行選股
            context.order_tickers = compute_stock(
                date=backtest_date, 
                data=data__,
                verbose=True
            )
    
    context.i += 1

def analyze(context, perf):
    """分析函數：繪製績效圖表"""
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)
    
    # 上圖：累積報酬
    perf['algorithm_period_return'].plot(ax=ax1, label='策略報酬', linewidth=2, color='#2E86AB')
    perf['benchmark_period_return'].plot(ax=ax1, label='大盤報酬 (IR0001)', linewidth=2, alpha=0.7, color='#A23B72')
    ax1.set_title('Dreman 逆向投資策略 vs 大盤', fontsize=16, fontweight='bold', pad=20)
    ax1.set_ylabel('累積報酬率', fontsize=12)
    ax1.legend(loc='upper left', fontsize=11)
    ax1.grid(True, alpha=0.3)
    ax1.axhline(0, color='black', linewidth=0.8, linestyle='--', alpha=0.5)
    
    # 下圖：投資組合價值
    perf['portfolio_value'].plot(ax=ax2, label='投資組合價值', color='#F18F01', linewidth=2)
    ax2.set_title('投資組合價值變化', fontsize=14, fontweight='bold', pad=15)
    ax2.set_xlabel('日期', fontsize=12)
    ax2.set_ylabel('價值（元）', fontsize=12)
    ax2.legend(loc='upper left', fontsize=11)
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()
    
    # 儲存績效數據
    perf.to_csv(f"dreman_perf_{start_date}_{end_date}.csv")
    print(f"\n績效數據已儲存至: dreman_perf_{start_date}_{end_date}.csv")

# ====================================
# 執行回測
# ====================================
print("="*60)
print("開始回測 David Dreman 逆向投資策略")
print("="*60)

results = run_algorithm(
    start=pd.Timestamp(start_date, tz='utc'),
    end=pd.Timestamp(end_date, tz='utc'),
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    bundle='tquant',
    capital_base=1e7  # 1000 萬元
)

print("\n回測完成！")

# ====================================
# Pyfolio 績效分析
# ====================================
try:
    import pyfolio as pf
    from pyfolio.utils import extract_rets_pos_txn_from_zipline
    
    returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)
    benchmark_rets = results.benchmark_return

    print("------ 大盤績效指標 ------")
    pf.show_perf_stats(benchmark_rets)
    
    print("------ 策略績效 ------")
    pf.tears.create_full_tear_sheet(
        returns=returns,
        positions=positions,
        transactions=transactions,
        benchmark_rets=benchmark_rets
    )
    
except ImportError:
    print("未安裝 pyfolio，略過詳細分析")
    print("若需完整報告，請執行: pip install pyfolio")
except Exception as e:
    print(f"Pyfolio 分析錯誤: {e}")
```

---

## 📊 策略特性分析

### 優勢 ✅

1. **防禦性強**
> - 低本益比 + 高股息：提供下檔保護
> - 強調財務健康：避開地雷股
> - 中大型股為主：流動性佳

2. **計分制靈活**
> - 不是「全有或全無」
> - 允許某些指標略差
> - 綜合評估更全面

3. **動態降級機制**
> - 避免極端市況無股票可買
> - 保持策略持續運作
> - 類似「Plan B」的容錯設計

4. **適合長期持有**
> - 季度調倉，週轉率低
> - 交易成本低
> - 適合價值投資者

### 風險 ⚠️

1. **價值陷阱風險**
> - 便宜不一定是好貨
> - 可能買到夕陽產業
> - 需搭配成長率檢驗

2. **績效落後成長股**
> - 市場瘋狂時表現平淡
> - 錯過高成長股行情
> - 需要耐心等待

3. **選股數量波動**
> - 牛市時可能只選出 5-10 檔
> - 熊市時可能選出 30-40 檔
> - 影響分散效果

---

## 🔍 關鍵學習點

### 1. 計分制的實作技巧
```python
# 方法 1: 逐檔計分（適合複雜邏輯）
selected_tickers = []
for ticker in core_set:
    score = 0
    if ticker in score_set_1: score += 1
    if ticker in score_set_2: score += 1
    # ...
    if score >= min_score:
        selected_tickers.append(ticker)

# 方法 2: 向量化計分（效能更好）
df['score'] = (
    (df['股票代碼'].isin(score_set_1)).astype(int) +
    (df['股票代碼'].isin(score_set_2)).astype(int) +
    # ...
)
selected_tickers = df[df['score'] >= min_score]['股票代碼'].tolist()
```

**何時用計分法？**
- 條件很多（>5 個）
- 條件之間可替代
- 希望綜合評估而非絕對門檻

### 2. 動態降級的設計哲學
```python
# 基本版：固定降級
if len(selected_tickers) == 0:
    selected_tickers = fallback_selection()

# 進階版：漸進式降級
for threshold in [3, 2, 1]:
    selected_tickers = select_with_score(threshold)
    if len(selected_tickers) >= 5:  # 至少 5 檔
        break

# 專業版：根據市場狀況調整
if market_volatility > 30:  # 市場恐慌
    min_score = 2  # 降低標準
else:
    min_score = 3
```

**為什麼需要降級？**
- **實務考量**：總不能空手
- **策略穩健性**：極端情況仍能運作
- **避免過度擬合**：太嚴格的條件可能失效

### 3. 處理負值與缺失值
```python
# ❌ 錯誤：直接計算平均
avg_roe = df['ROE'].mean()  # 包含負值，平均值失真

# ✅ 正確：只對正值計算
valid_roe = df[df['ROE'] > 0]['ROE']
avg_roe = valid_roe.mean() if len(valid_roe) > 0 else 0

# ✅ 更嚴謹：處理極端值
valid_roe = df[(df['ROE'] > 0) & (df['ROE'] < 100)]['ROE']  # 排除 >100% 的異常值
```

### 4. 50% 分位數 vs 平均值
```python
# 平均值：容易被極端值影響
avg_per = df['本益比'].mean()  # 如果有幾檔 PE=100，平均會被拉高

# 中位數（50% 分位）：更穩健
median_per = df['本益比'].quantile(0.5)  # 不受極端值影響

# Dreman 同時使用兩者
condition = (df['本益比'] <= median_per) & (df['本益比'] <= avg_per)
```

**決策樹：**
- 數據分佈偏態？ → 用中位數
- 有極端值？ → 用中位數
- 想要更嚴格？ → 兩者都用（AND）

---

## 🎯 延伸優化方向

### 優化 1: 動態調整計分權重
```python
# 根據市場環境調整權重
if market_pe > historical_pe.quantile(0.8):  # 市場過熱
    # 重視財務安全
    score = (
        ticker in score_set_1 * 2 +  # 流動比率（加倍）
        ticker in score_set_2 * 2 +  # 負債比（加倍）
        ticker in score_set_3 * 1 +  # ROE
        ticker in score_set_4 * 1 +  # 淨利率
        ticker in score_set_5 * 0    # 成長率（忽略）
    )
    min_score = 5
else:  # 市場正常
    # 平衡考量
    score = sum([ticker in s for s in [score_set_1, ..., score_set_5]])
    min_score = 3
```

### 優化 2: 加入動量過濾
```python
# 排除價格趨勢向下的股票
df['MA20'] = df.groupby('股票代碼')['收盤價'].transform(lambda x: x.rolling(20).mean())
momentum_set = set(df[df['收盤價'] > df['MA20']]['股票代碼'])

# 最終篩選
selected_tickers = [t for t in selected_tickers if t in momentum_set]
```

**邏輯：** Dreman 重視價值，但也不買「falling knife」（接落下的刀）。

### 優化 3: 產業分散
```python
# 每個產業最多 3 檔
industry_counts = {}
final_tickers = []

for ticker in selected_tickers:
    industry = df[df['股票代碼'] == ticker]['主產業別'].values[0]
    if industry_counts.get(industry, 0) < 3:
        final_tickers.append(ticker)
        industry_counts[industry] = industry_counts.get(industry, 0) + 1
```

### 優化 4: 持有期延長
```python
# 持有 2 季，減少週轉
if context.i % 2 == 0:  # 每 2 季換股一次
    context.state = True
```

---

## 📚 相關資源

- **模板頁面**：[template.md](template.md) - 計分法模板
- **架構說明**：[index.md](index.md) - 理解設計原理
- **其他案例**：
  - [多因子選股](case-multifactor.md) - 交集法範例
  - [小型成長股](case-smallcap.md) - 排名法範例

---

## 💡 總結

Dreman 逆向投資策略展示了 **計分法** 的精髓：

1. ✅ **兩階段設計**：核心門檻 + 靈活計分
2. ✅ **動態降級**：容錯機制，保持運作
3. ✅ **防禦為主**：低估值 + 高股息 + 財務健康
4. ✅ **長期持有**：季度調倉，低週轉率

**適合誰使用？**
- 價值投資者（重視安全邊際）
- 保守型投資人（偏好穩定收益）
- 長期投資者（不在意短期波動）

**與其他策略的差異：**
| 特性 | Dreman | 多因子 | 小型成長股 |
| :--- | :---: | :---: | :---: |
| **選股邏輯** | 計分法 | 交集法 | 排名法 |
| **風險偏好** | 保守 | 中性 | 積極 |
| **持股數量** | 10-20 檔 | 15-30 檔 | 5-15 檔 |
| **適合市況** | 熊市/盤整 | 全市況 | 牛市 |

**👉 Next Step:**  
三個案例都看完了？前往 [faq.md](faq.md) 查看常見問題，或直接開始開發你的策略！

---

## 📖 延伸閱讀

**David Dreman 經典著作：**

- 《逆向投資策略》(Contrarian Investment Strategies)
- 《逆向投資心理學》(Contrarian Investment Psychology)

**核心觀點摘要：**
> "The market is not always efficient. Emotions drive prices to extremes, creating opportunities for patient investors who focus on fundamentals."

**Dreman 四大投資原則：**

1. 買入低本益比股票
2. 買入低股價淨值比股票
3. 買入高股息股票
4. 持有分散的投資組合

本策略即為這些原則的量化實作。