# Pipeline 因子架構 - Code 模板

本頁提供可直接使用的 Code Template，並標註需要自定義的部分。

---

## 📋 模板總覽

我們將因子挖掘流程拆解為五個模塊，請依照你的需求組裝：

| 模塊 (Module) | 核心功能 | 你的任務 (Action) |
| :--- | :--- | :--- |
| **M1. 基礎建設** | `環境設定` `股票池` | 🟢 **設定參數** (回測區間、數據 Bundle) |
| **M2. 因子定義** | `CustomFactor` `運算邏輯` | 🔥 **定義 Alpha** (撰寫數學公式、資料清洗) |
| **M3. 訊號組裝** | `Pipeline` `Filter` | 🔥 **合成因子** (多因子結合、篩選、排名) |
| **M4. 調倉邏輯** | `Schedule` `Rebalance` | 🔵 **選擇頻率** (月換/季換、權重分配) |
| **M5. 執行引擎** | `run_algorithm` `績效回測` | 🔒 **直接執行** (分析 IC 值、報酬率) |

---

## 🎯 完整模板

### Module 1: 環境設定 & 股票池
```python
# ====================================
# Module 1: 環境設定 & 股票池
# ====================================

import os
import pandas as pd
import numpy as np
import tejapi
import matplotlib.pyplot as plt
from logbook import Logger

# TEJ API 設定
os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'
os.environ['TEJAPI_KEY'] = 'your_key'
tejapi.ApiConfig.api_key = os.getenv('TEJAPI_KEY')
tejapi.ApiConfig.api_base = os.getenv('TEJAPI_BASE')

# 日誌設定
log = Logger('Strategy')

# 中文顯示設定
plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei']
plt.rcParams['axes.unicode_minus'] = False

# ====================================
# 參數設定
# ====================================
# 🔧 自定義：回測期間
start_date = '2019-01-01'
end_date = '2023-12-31'

# 🔧 自定義：股票池
# 方法 1: 台灣 50 成分股
tw50_list = get_universe(start_date,end_date, idx_id='IX0002')
print(f"台灣 50 成分股數量: {len(tw50_list)}")

# 方法 2: 上市 + 上櫃
from zipline.sources.TEJ_Api_Data import get_universe
pool = get_universe(
    start=pd.Timestamp(start_date, tz='utc'),
    end=pd.Timestamp(end_date, tz='utc'),
    mkt_bd_e=['TSE', 'OTC'],
    stktp_e='Common Stock'
)

# 設定環境變數
os.environ['mdate'] = f'{start_date} {end_date}'
os.environ['ticker'] = ' '.join(pool)  # 或 tw50_list

# ====================================
# 匯入股價資料
# ====================================
from zipline.data.run_ingest import simple_ingest

pools = pool + ['IR0001']  # 加入基準指數

print("正在準備 Zipline 資料...")
simple_ingest(
    name='tquant',
    tickers=pools,
    start_date=start_date.replace('-', ''),
    end_date=end_date.replace('-', '')
)
print("資料準備完成！")
```

---

### Module 2: CustomFactor 定義 🔥

這是 **最核心** 的模塊，定義你的因子計算邏輯。

#### 📌 模板 A：單一資料源因子
```python
# ====================================
# Module 2A: 單一資料源因子
# ====================================

from zipline.pipeline import CustomFactor
from zipline.pipeline.data import EquityPricing
import numpy as np

class Momentum(CustomFactor):
    """
    動量因子：過去 N 天報酬率
    
    公式：(最新價 - 起始價) / 起始價
    """
    # 🔧 自定義：需要多少天的資料
    window_length = 252  # 年化報酬（252 個交易日）
    
    # 🔧 自定義：需要哪些欄位
    inputs = [EquityPricing.close]
    
    def compute(self, today, assets, out, close):
        """
        計算邏輯
        
        Parameters:
        -----------
        today : pd.Timestamp
            當前日期
        assets : np.array
            股票代碼陣列
        out : np.array
            輸出陣列（要填入計算結果）
        close : np.array
            收盤價矩陣（window_length × 股票數）
        """
        # 🔥 自定義區：替換成你的計算邏輯
        
        # 計算報酬率
        returns = (close[-1] - close[0]) / close[0]
        
        # 填入輸出陣列
        out[:] = returns


class Volatility(CustomFactor):
    """
    波動率因子：過去 N 天報酬率的標準差
    """
    window_length = 252
    inputs = [EquityPricing.close]
    
    def compute(self, today, assets, out, close):
        # 🔥 自定義區
        
        # 計算日報酬率
        daily_returns = np.diff(close, axis=0) / close[:-1]
        
        # 計算標準差（年化）
        volatility = np.nanstd(daily_returns, axis=0) * np.sqrt(252)
        
        out[:] = volatility


class AverageDollarVolume(CustomFactor):
    """
    平均成交金額：過去 N 天平均成交金額
    """
    window_length = 30
    inputs = [EquityPricing.close, EquityPricing.volume]
    
    def compute(self, today, assets, out, close, volume):
        # 🔥 自定義區
        
        # 成交金額 = 收盤價 × 成交量
        dollar_volume = close * volume
        
        # 計算平均
        avg_dollar_volume = np.nanmean(dollar_volume, axis=0)
        
        out[:] = avg_dollar_volume
```

#### 📌 模板 B：多資料源因子
```python
# ====================================
# Module 2B: 多資料源因子
# ====================================

class PriceToVolume(CustomFactor):
    """
    價量比：收盤價 / 成交量
    """
    window_length = 1  # 只需要最新一天
    inputs = [EquityPricing.close, EquityPricing.volume]
    
    def compute(self, today, assets, out, close, volume):
        # 🔥 自定義區
        
        # 取最新值
        latest_close = close[-1]
        latest_volume = volume[-1]
        
        # 計算比值（避免除以零）
        ratio = latest_close / (latest_volume + 1e-10)
        
        out[:] = ratio


class RSI(CustomFactor):
    """
    RSI 指標：相對強弱指數
    """
    window_length = 15  # 14 天 RSI 需要 15 天資料
    inputs = [EquityPricing.close]
    
    def compute(self, today, assets, out, close):
        # 🔥 自定義區
        
        # 計算價格變化
        delta = np.diff(close, axis=0)
        
        # 分離漲跌
        gains = np.where(delta > 0, delta, 0)
        losses = np.where(delta < 0, -delta, 0)
        
        # 計算平均漲跌幅
        avg_gain = np.nanmean(gains, axis=0)
        avg_loss = np.nanmean(losses, axis=0)
        
        # 計算 RS 和 RSI
        rs = avg_gain / (avg_loss + 1e-10)
        rsi = 100 - (100 / (1 + rs))
        
        out[:] = rsi
```

#### 📌 模板 C：排名因子
```python
# ====================================
# Module 2C: 排名因子
# ====================================

class MomentumRank(CustomFactor):
    """
    動量排名：將動量轉換為排名（0-1）
    """
    window_length = 252
    inputs = [EquityPricing.close]
    
    def compute(self, today, assets, out, close):
        # 🔥 自定義區
        
        # 計算報酬率
        returns = (close[-1] - close[0]) / close[0]
        
        # 轉換為排名（0-1 之間）
        # 最高報酬 = 1，最低報酬 = 0
        from scipy.stats import rankdata
        ranks = rankdata(returns) / len(returns)
        
        out[:] = ranks
```

#### 📌 模板 D：組合因子
```python
# ====================================
# Module 2D: 組合因子
# ====================================

class QualityScore(CustomFactor):
    """
    品質分數：ROE + 毛利率的組合
    
    需要外部數據（TEJ）
    """
    window_length = 1
    
    def compute(self, today, assets, out, roe, gross_margin):
        # 🔥 自定義區
        
        # 標準化 ROE（0-1）
        roe_normalized = (roe[-1] - np.nanmin(roe[-1])) / (np.nanmax(roe[-1]) - np.nanmin(roe[-1]) + 1e-10)
        
        # 標準化毛利率（0-1）
        gm_normalized = (gross_margin[-1] - np.nanmin(gross_margin[-1])) / (np.nanmax(gross_margin[-1]) - np.nanmin(gross_margin[-1]) + 1e-10)
        
        # 加權組合（可調整權重）
        quality_score = 0.6 * roe_normalized + 0.4 * gm_normalized
        
        out[:] = quality_score
```

---

### Module 3: Pipeline 組合 🔥
```python
# ====================================
# Module 3: Pipeline 組合
# ====================================

from zipline.pipeline import Pipeline
from zipline.pipeline.filters import StaticAssets

def make_pipeline():
    """
    建立 Pipeline
    
    流程：
    1. 定義因子
    2. 定義篩選器（screen）
    3. 組合 Pipeline
    """
    # ========================================
    # Step 1: 定義因子
    # ========================================
    # 🔥 自定義區：選擇你要使用的因子
    
    momentum = Momentum()
    volatility = Volatility()
    dollar_volume = AverageDollarVolume()
    
    # ========================================
    # Step 2: 定義篩選器
    # ========================================
    # 🔥 自定義區：設定篩選條件
    
    # 篩選 1: 成交金額前 N 名（流動性過濾）
    tradable = dollar_volume.top(100)
    
    # 篩選 2: 動量 > 0（正報酬）
    positive_momentum = momentum > 0
    
    # 篩選 3: 波動率 < 0.5（不要太波動）
    low_volatility = volatility < 0.5
    
    # 組合篩選器（AND）
    screen = tradable & positive_momentum & low_volatility
    
    # 或使用特定股票池
    # universe = StaticAssets(symbols(['2330', '2317', '2454']))
    # screen = universe
    
    # ========================================
    # Step 3: 組合 Pipeline
    # ========================================
    pipe = Pipeline(
        columns={
            'momentum': momentum,
            'volatility': volatility,
            'dollar_volume': dollar_volume
        },
        screen=screen
    )
    
    return pipe
```

---

### Module 4: 調倉邏輯
```python
# ====================================
# Module 4: 調倉邏輯
# ====================================

from zipline.api import (
    attach_pipeline, pipeline_output,
    order_target_percent, set_commission, set_slippage,
    record, schedule_function, date_rules, time_rules
)
from zipline.finance import commission, slippage

def initialize(context):
    """
    初始化函數
    """
    # 交易成本設定
    set_commission(commission.PerShare(cost=0.001425, min_trade_cost=20))
    set_slippage(slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1))
    
    # 附加 Pipeline
    attach_pipeline(make_pipeline(), 'my_pipeline')
    
    # 🔧 自定義：調倉頻率
    # 每週一開盤後調倉
    schedule_function(
        rebalance,
        date_rules.week_start(),
        time_rules.market_open()
    )
    
    # 或每月第一個交易日
    # schedule_function(
    #     rebalance,
    #     date_rules.month_start(),
    #     time_rules.market_open()
    # )
    
    # 或每日
    # schedule_function(
    #     rebalance,
    #     date_rules.every_day(),
    #     time_rules.market_open()
    # )


def before_trading_start(context, data):
    """
    盤前執行：取得 Pipeline 輸出
    """
    # 取得 Pipeline 結果
    output = pipeline_output('my_pipeline')
    
    # 🔥 自定義區：選股邏輯
    
    # 方法 1: 取前 N 名
    context.stocks = output.nlargest(20, 'momentum').index.tolist()
    
    # 方法 2: 綜合排名
    # output['rank'] = output['momentum'].rank() + output['volatility'].rank(ascending=False)
    # context.stocks = output.nlargest(20, 'rank').index.tolist()
    
    # 方法 3: 分組
    # high_momentum = output[output['momentum'] > output['momentum'].median()]
    # context.stocks = high_momentum.index.tolist()
    
    # 儲存完整 output（用於計算權重）
    context.output = output


def rebalance(context, data):
    """
    調倉函數
    """
    # ========================================
    # Step 1: 計算目標權重
    # ========================================
    # 🔥 自定義區：權重計算方法
    
    # 方法 1: 等權重
    target_weights = {}
    for stock in context.stocks:
        target_weights[stock] = 1.0 / len(context.stocks)
    
    # 方法 2: 因子加權（動量越高，權重越大）
    # momentum_values = context.output.loc[context.stocks, 'momentum']
    # total_momentum = momentum_values.sum()
    # target_weights = {}
    # for stock in context.stocks:
    #     target_weights[stock] = momentum_values[stock] / total_momentum
    
    # 方法 3: 反波動率加權
    # volatility_values = context.output.loc[context.stocks, 'volatility']
    # inv_vol = 1 / volatility_values
    # total_inv_vol = inv_vol.sum()
    # target_weights = {}
    # for stock in context.stocks:
    #     target_weights[stock] = inv_vol[stock] / total_inv_vol
    
    # ========================================
    # Step 2: 賣出不在清單的股票
    # ========================================
    for stock in context.portfolio.positions:
        if stock not in context.stocks:
            order_target_percent(stock, 0)
    
    # ========================================
    # Step 3: 買入目標股票
    # ========================================
    for stock, weight in target_weights.items():
        if data.can_trade(stock):
            order_target_percent(stock, weight)
    
    # ========================================
    # Step 4: 記錄資訊
    # ========================================
    record(
        num_positions=len(context.portfolio.positions),
        leverage=context.account.leverage
    )
```

---

### Module 5: 績效分析 & 執行回測
```python
# ====================================
# Module 5: 績效分析函數
# ====================================

def analyze(context, perf):
    """
    績效分析與視覺化
    """
    import matplotlib.pyplot as plt
    
    fig = plt.figure(figsize=(16, 12))
    
    # ========================================
    # 圖 1: 投資組合價值
    # ========================================
    ax1 = fig.add_subplot(411)
    perf['portfolio_value'].plot(ax=ax1, linewidth=2)
    ax1.set_ylabel('Portfolio Value (TWD)', fontsize=12)
    ax1.set_title('Portfolio Performance', fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    
    # ========================================
    # 圖 2: 累積報酬 vs 基準
    # ========================================
    ax2 = fig.add_subplot(412)
    
    cumulative_returns = (1 + perf['returns']).cumprod() - 1
    benchmark_returns = (1 + perf['benchmark_return']).cumprod() - 1
    
    cumulative_returns.plot(ax=ax2, label='Strategy', linewidth=2, color='#2E86AB')
    benchmark_returns.plot(ax=ax2, label='Benchmark', linewidth=2, alpha=0.7, color='#A23B72')
    
    ax2.set_ylabel('Cumulative Returns', fontsize=12)
    ax2.set_title('Strategy vs Benchmark', fontsize=14, fontweight='bold')
    ax2.legend(loc='upper left', fontsize=11)
    ax2.grid(True, alpha=0.3)
    ax2.axhline(0, color='black', linewidth=0.8, linestyle='--', alpha=0.5)
    
    # ========================================
    # 圖 3: 持倉數量
    # ========================================
    ax3 = fig.add_subplot(413)
    perf['num_positions'].plot(ax=ax3, linewidth=2, color='#F18F01')
    ax3.set_ylabel('Number of Positions', fontsize=12)
    ax3.set_title('Position Count', fontsize=14, fontweight='bold')
    ax3.grid(True, alpha=0.3)
    
    # ========================================
    # 圖 4: 槓桿
    # ========================================
    ax4 = fig.add_subplot(414)
    perf['leverage'].plot(ax=ax4, linewidth=2, color='#6A4C93')
    ax4.set_ylabel('Leverage', fontsize=12)
    ax4.set_xlabel('Date', fontsize=12)
    ax4.set_title('Portfolio Leverage', fontsize=14, fontweight='bold')
    ax4.grid(True, alpha=0.3)
    ax4.axhline(1, color='red', linewidth=1, linestyle='--', alpha=0.5)
    
    plt.tight_layout()
    plt.show()
    
    # 儲存績效數據
    perf.to_csv(f'pipeline_performance.csv')
    print(f"\n績效數據已儲存至: pipeline_performance.csv")


# ====================================
# 執行回測
# ====================================
from zipline import run_algorithm

print("="*60)
print("開始回測 Pipeline 因子策略")
print("="*60)

results = run_algorithm(
    start=pd.Timestamp(start_date, tz='utc'),
    end=pd.Timestamp(end_date, tz='utc'),
    initialize=initialize,
    before_trading_start=before_trading_start,
    analyze=analyze,
    bundle='tquant',
    capital_base=1e7  # 1000 萬元
)

print("\n回測完成！")

# ====================================
# 績效統計
# ====================================
print("\n========== 績效摘要 ==========")

total_return = (results['portfolio_value'].iloc[-1] / 1e7 - 1) * 100
benchmark_return = results['benchmark_period_return'].iloc[-1] * 100

print(f"策略總報酬: {total_return:.2f}%")
print(f"基準報酬: {benchmark_return:.2f}%")
print(f"超額報酬: {(total_return - benchmark_return):.2f}%")
print(f"最大回撤: {results['max_drawdown'].min() * 100:.2f}%")
print(f"夏普比率: {results['sharpe'].iloc[-1]:.2f}")
print(f"平均持倉數: {results['num_positions'].mean():.0f}")

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

## 🎯 使用指南

### Step 1: 選擇因子類型

根據你的策略選擇對應的 CustomFactor 模板：

- **模板 A**：單一資料源（動量、波動率、成交量）
- **模板 B**：多資料源（價量比、RSI）
- **模板 C**：排名因子（相對排名）
- **模板 D**：組合因子（多因子加權）

### Step 2: 實作 compute() 函數

修改 `compute()` 函數中的計算邏輯：
```python
def compute(self, today, assets, out, close):
    # 1. 提取需要的資料
    latest_close = close[-1]
    first_close = close[0]
    
    # 2. 計算因子值
    returns = (latest_close - first_close) / first_close
    
    # 3. 填入輸出陣列
    out[:] = returns
```

### Step 3: 組合 Pipeline

在 `make_pipeline()` 中組合因子和篩選器：
```python
def make_pipeline():
    # 定義因子
    factor1 = MyFactor1()
    factor2 = MyFactor2()
    
    # 定義篩選器
    screen = (factor1 > 0) & (factor2.top(100))
    
    # 組合 Pipeline
    return Pipeline(
        columns={'factor1': factor1, 'factor2': factor2},
        screen=screen
    )
```

### Step 4: 設定調倉邏輯

選擇調倉頻率和權重計算方法：
```python
# 調倉頻率
schedule_function(
    rebalance,
    date_rules.week_start(),  # 每週一
    time_rules.market_open()
)

# 權重計算
target_weights = {}
for stock in context.stocks:
    target_weights[stock] = 1.0 / len(context.stocks)  # 等權
```

---

## 💡 進階技巧

### 技巧 1: 多因子組合
```python
def make_pipeline():
    # 定義多個因子
    momentum = Momentum()
    value = ValueFactor()
    quality = QualityFactor()
    
    # 標準化因子（0-1）
    momentum_rank = momentum.rank(mask=universe) / universe.sum()
    value_rank = value.rank(mask=universe) / universe.sum()
    quality_rank = quality.rank(mask=universe) / universe.sum()
    
    # 組合因子（加權）
    composite_score = (
        0.4 * momentum_rank +
        0.3 * value_rank +
        0.3 * quality_rank
    )
    
    return Pipeline(
        columns={'score': composite_score},
        screen=universe
    )
```

### 技巧 2: 產業中性
```python
def before_trading_start(context, data):
    output = pipeline_output('my_pipeline')
    
    # 假設有產業分類欄位
    # 每個產業選前 5 名
    stocks = []
    for industry in output['industry'].unique():
        industry_stocks = output[output['industry'] == industry]
        top5 = industry_stocks.nlargest(5, 'momentum')
        stocks.extend(top5.index.tolist())
    
    context.stocks = stocks
```

### 技巧 3: 動態調整持倉數
```python
def before_trading_start(context, data):
    output = pipeline_output('my_pipeline')
    
    # 根據市場狀況調整持倉數
    market_volatility = calculate_market_volatility()
    
    if market_volatility < 0.2:
        num_stocks = 30  # 低波動，持倉多
    elif market_volatility < 0.4:
        num_stocks = 20  # 中波動
    else:
        num_stocks = 10  # 高波動，持倉少
    
    context.stocks = output.nlargest(num_stocks, 'momentum').index.tolist()
```

### 技巧 4: 風險平價
```python
def rebalance(context, data):
    # 根據波動率分配權重
    volatility_values = context.output.loc[context.stocks, 'volatility']
    
    # 反波動率權重
    inv_vol = 1 / volatility_values
    total_inv_vol = inv_vol.sum()
    
    target_weights = {}
    for stock in context.stocks:
        target_weights[stock] = inv_vol[stock] / total_inv_vol
    
    # 執行調倉
    for stock, weight in target_weights.items():
        order_target_percent(stock, weight)
```

---

## 📚 常用因子速查

### 動量類
```python
# 簡單報酬率
class Returns(CustomFactor):
    window_length = 252
    inputs = [EquityPricing.close]
    def compute(self, today, assets, out, close):
        out[:] = (close[-1] - close[0]) / close[0]

# 年化報酬率
class AnnualizedReturns(CustomFactor):
    window_length = 252
    inputs = [EquityPricing.close]
    def compute(self, today, assets, out, close):
        returns = (close[-1] / close[0]) - 1
        out[:] = returns
```

### 波動率類
```python
# 標準差
class StdDev(CustomFactor):
    window_length = 252
    inputs = [EquityPricing.close]
    def compute(self, today, assets, out, close):
        daily_returns = np.diff(close, axis=0) / close[:-1]
        out[:] = np.nanstd(daily_returns, axis=0)

# 年化波動率
class AnnualizedVolatility(CustomFactor):
    window_length = 252
    inputs = [EquityPricing.close]
    def compute(self, today, assets, out, close):
        daily_returns = np.diff(close, axis=0) / close[:-1]
        out[:] = np.nanstd(daily_returns, axis=0) * np.sqrt(252)
```

### 成交量類
```python
# 平均成交量
class AverageVolume(CustomFactor):
    window_length = 30
    inputs = [EquityPricing.volume]
    def compute(self, today, assets, out, volume):
        out[:] = np.nanmean(volume, axis=0)

# 成交量變化率
class VolumeChange(CustomFactor):
    window_length = 2
    inputs = [EquityPricing.volume]
    def compute(self, today, assets, out, volume):
        out[:] = (volume[-1] - volume[-2]) / volume[-2]
```

---

## 📚 相關資源

- **架構說明**：[index.md](index.md) - 理解設計原理
- **案例學習**：
  - [Expanded Momentum](case-momentum.md) - 動量策略
  - [跟隨大戶](case-institution.md) - 籌碼分析
  - [CounterTrend](case-countertrend.md) - 逆勢策略
- **常見問題**：[faq.md](faq.md)

---

**👉 Next Step:** 選擇一個模板，參考對應的 case study，開始開發你的 Pipeline 策略！